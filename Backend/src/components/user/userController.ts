import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";
import jwt from "jsonwebtoken";
import { toPublicUrl } from "../../middleware/upload";

export default function root(_req: Request, res: Response) {
    res.status(200).send("The server is running properly.");
}

export async function signIn(req: any, res: any) {
    const { email, password } = req.body || {};

    if(!(email && password)){
        res.status(400).send("Incorrect data entered or request body is missing.");
        return;
    };

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT login(?, ?) AS id',
            [email, password]
        ) as Array<any>;

        if(!result || result.length === 0 || !result[0] || !result[0].id){
            res.status(401).send("Incorrect email or password.");
            return;
        };

        if(!config.jwtSecret){
            res.status(500).send("Error with the secret key.");
            return;
        };

        const [adminResult] = await connection.query(
            'SELECT is_admin FROM users WHERE id = ?',
            [result[0].id]
        ) as Array<any>;

        const isAdmin = adminResult && adminResult[0] ? !!adminResult[0].is_admin : false;

        const token = jwt.sign({id: result[0].id, is_admin: isAdmin}, config.jwtSecret, {expiresIn: "2h"});

        await connection.end();

        res.status(201).send({token: token});
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        if(!res.headersSent){
            res.status(500).send('Error during sign in. '+ err);
        }
    }
};

export async function signUp(req: any, res: any) {
    const { email, password } = req.body || {};
    // DEBUG: inspect incoming request for content-type and body keys (remove in production)
    console.log('signUp - method:', req.method, 'path:', req.path);
    console.log('signUp - content-type:', req.headers && (req.headers['content-type'] || req.headers['Content-Type']));
    console.log('signUp - body type:', typeof req.body, 'body keys:', Object.keys(req.body || {}));

    if(!(email && password)){
        res.status(400).send("Incorrect data entered or request body is missing.");
        return;
    };

    const connection = await mysql.createConnection(config.database);
    try{
        const [result] = await connection.query(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [email, password]
        ) as Array<any>;

        const insertId = (result && (result as any).insertId) ? (result as any).insertId : null;

        if(!insertId){
            res.status(500).send("Unable to create user.");
            return;
        };

        if(!config.jwtSecret){
            res.status(500).send("Error with the secret key.");
            return;
        };

        const [adminResult] = await connection.query(
            'SELECT is_admin FROM users WHERE id = ?',
            [insertId]
        ) as Array<any>;

        const isAdmin = adminResult && adminResult[0] ? !!adminResult[0].is_admin : false;

        const token = jwt.sign({id: insertId, is_admin: isAdmin}, config.jwtSecret, {expiresIn: "2h"});

        await connection.end();

        res.status(201).send({token: token});
    }
    catch(err: any){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        if(err && err.code === 'ER_DUP_ENTRY'){
            res.status(409).send("User with this email already exists.");
            return;
        }
        res.status(500).send('Error creating user.');
    }
};

function idIsNan(id: number, res: Response): boolean {
    if(isNaN(id)){
        res.status(400).send("Id is not valid.");
        return false;
    }
    return true;
};

function normalizeIdList(value: any): number[] | null {
    if(value === undefined){
        return null;
    }

    const rawList = Array.isArray(value)
        ? value
        : typeof value === "string"
            ? value.split(",")
            : [value];

    const ids = rawList
        .map((item) => parseInt(String(item).trim(), 10))
        .filter((item) => Number.isFinite(item) && item > 0);

    return Array.from(new Set(ids));
}


export async function getUserById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    
    if(!idIsNan(id, res)){
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        // Get user basic info
        const [userResult] = await connection.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        ) as Array<any>;

        if(userResult.length === 0){
            res.status(404).send("There arent any items with the given id.");
            return;
        }

        const user = userResult[0];

        // Get user's band (if any)
        const [bandResult] = await connection.query(
            `SELECT b.id, b.name
             FROM band_members bm
             INNER JOIN bands b ON b.id = bm.band_id
             WHERE bm.user_id = ?
             LIMIT 1`,
            [id]
        ) as Array<any>;
        const band = (bandResult && bandResult.length > 0)
            ? { id: bandResult[0].id, name: bandResult[0].name }
            : null;

        // Get user instruments
        const [instrumentsResult] = await connection.query(
            `SELECT i.id, i.name
            FROM user_instruments ui
            INNER JOIN instruments i ON ui.instrument_id = i.id
            WHERE ui.user_id = ?`,
            [id]
        ) as Array<any>;

        // Get user styles
        const [stylesResult] = await connection.query(
            `SELECT ms.id, ms.name
            FROM user_styles us
            INNER JOIN musical_styles ms ON us.style_id = ms.id
            WHERE us.user_id = ?`,
            [id]
        ) as Array<any>;

        // Format instruments: extract just the names
        const instruments = instrumentsResult.map((instrument: any) => instrument.name);

        // Format styles: extract just the names
        const styles = stylesResult.map((style: any) => style.name);

        // Remove password_hash and combine all data
        const { password_hash, ...userWithoutPassword } = user;
        const result = {
            ...userWithoutPassword,
            instruments: instruments,
            styles: styles,
            band: band
        };

        await connection.end();
        res.status(200).send(result);
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error fetching user.');
    }
};

export async function getUsersLimit(req: Request, res: Response) {
    const limitParam = parseInt((req.params.limit || req.query.limit) as string);
    const limit = isNaN(limitParam) ? 10 : Math.min(20, Math.max(1, limitParam));
    const offsetParam = parseInt((req.params.offset || req.query.offset || '0') as string);
    const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);

    const connection = await mysql.createConnection(config.database);

    try{
        // Get users basic info
        const [usersResult] = await connection.query(
            'SELECT id, username, email, first_name, last_name, city, birth_date, profile_image_url, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        ) as Array<any>;

        // Get instruments and styles for all users
        const userIds = usersResult.map((user: any) => user.id);
        
        if(userIds.length > 0){
            // Get all instruments for these users
            const [instrumentsResult] = await connection.query(
                `SELECT ui.user_id, i.name
                FROM user_instruments ui
                INNER JOIN instruments i ON ui.instrument_id = i.id
                WHERE ui.user_id IN (${userIds.map(() => '?').join(',')})`,
                userIds
            ) as Array<any>;

            // Get all styles for these users
            const [stylesResult] = await connection.query(
                `SELECT us.user_id, ms.name
                FROM user_styles us
                INNER JOIN musical_styles ms ON us.style_id = ms.id
                WHERE us.user_id IN (${userIds.map(() => '?').join(',')})`,
                userIds
            ) as Array<any>;

            // Get bands for these users (if any)
            const [bandsResult] = await connection.query(
                `SELECT bm.user_id, b.id AS band_id, b.name AS band_name
                 FROM band_members bm
                 INNER JOIN bands b ON b.id = bm.band_id
                 WHERE bm.user_id IN (${userIds.map(() => '?').join(',')})`,
                userIds
            ) as Array<any>;

            // Group instruments and styles by user_id
            const instrumentsByUser: { [key: number]: string[] } = {};
            const stylesByUser: { [key: number]: string[] } = {};
            const bandByUser: { [key: number]: { id: number; name: string } } = {};

            instrumentsResult.forEach((row: any) => {
                if(!instrumentsByUser[row.user_id]){
                    instrumentsByUser[row.user_id] = [];
                }
                instrumentsByUser[row.user_id].push(row.name);
            });

            stylesResult.forEach((row: any) => {
                if(!stylesByUser[row.user_id]){
                    stylesByUser[row.user_id] = [];
                }
                stylesByUser[row.user_id].push(row.name);
            });

            // If a user can be in multiple bands, keep the first one encountered.
            bandsResult.forEach((row: any) => {
                if(!bandByUser[row.user_id]){
                    bandByUser[row.user_id] = { id: row.band_id, name: row.band_name };
                }
            });

            // Combine data
            const result = usersResult.map((user: any) => ({
                ...user,
                instruments: instrumentsByUser[user.id] || [],
                styles: stylesByUser[user.id] || [],
                band: bandByUser[user.id] || null
            }));

            await connection.end();
            res.status(200).send(result);
        } else {
            await connection.end();
            res.status(200).send([]);
        }
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error fetching users.');
    }
};

// Update user details
export async function updateUser(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    
    if(!idIsNan(id, res)){
        return;
    }

    const { username, email, first_name, last_name, city, birth_date, password_hash } = req.body || {};
    const instrumentIds = normalizeIdList(req.body?.instruments);
    const styleIds = normalizeIdList(req.body?.styles);

    const connection = await mysql.createConnection(config.database);

    try{
        await connection.beginTransaction();
        // Check if user exists
        const [userCheck] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [id]
        ) as Array<any>;

        if(userCheck.length === 0){
            res.status(404).send("User not found.");
            await connection.rollback();
            await connection.end();
            return;
        }

        // Build update query dynamically
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if(username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if(email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if(first_name !== undefined) {
            updateFields.push('first_name = ?');
            updateValues.push(first_name);
        }
        if(last_name !== undefined) {
            updateFields.push('last_name = ?');
            updateValues.push(last_name);
        }
        if(city !== undefined) {
            updateFields.push('city = ?');
            updateValues.push(city);
        }
        if(birth_date !== undefined) {
            updateFields.push('birth_date = ?');
            updateValues.push(birth_date);
        }
        if(password_hash !== undefined) {
            updateFields.push('password_hash = ?');
            updateValues.push(password_hash);
        }

        if(updateFields.length === 0 && instrumentIds === null && styleIds === null){
            res.status(400).send("No fields to update.");
            await connection.rollback();
            await connection.end();
            return;
        }

        if(updateFields.length > 0){
            updateValues.push(id);

            const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            
            await connection.query(updateQuery, updateValues);
        }

        if(instrumentIds !== null){
            await connection.query(
                'DELETE FROM user_instruments WHERE user_id = ?',
                [id]
            );

            if(instrumentIds.length > 0){
                const values = instrumentIds.map(() => '(?, ?)').join(', ');
                const params = instrumentIds.flatMap((instrumentId) => [id, instrumentId]);
                await connection.query(
                    `INSERT INTO user_instruments (user_id, instrument_id) VALUES ${values}`,
                    params
                );
            }
        }

        if(styleIds !== null){
            await connection.query(
                'DELETE FROM user_styles WHERE user_id = ?',
                [id]
            );

            if(styleIds.length > 0){
                const values = styleIds.map(() => '(?, ?)').join(', ');
                const params = styleIds.flatMap((styleId) => [id, styleId]);
                await connection.query(
                    `INSERT INTO user_styles (user_id, style_id) VALUES ${values}`,
                    params
                );
            }
        }

        // Get updated user with instruments and styles
        const [userResult] = await connection.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        ) as Array<any>;

        const user = userResult[0];

        // Get user instruments
        const [instrumentsResult] = await connection.query(
            `SELECT i.id, i.name
            FROM user_instruments ui
            INNER JOIN instruments i ON ui.instrument_id = i.id
            WHERE ui.user_id = ?`,
            [id]
        ) as Array<any>;

        // Get user styles
        const [stylesResult] = await connection.query(
            `SELECT ms.id, ms.name
            FROM user_styles us
            INNER JOIN musical_styles ms ON us.style_id = ms.id
            WHERE us.user_id = ?`,
            [id]
        ) as Array<any>;

        // Format instruments and styles
        const instruments = instrumentsResult.map((instrument: any) => instrument.name);
        const styles = stylesResult.map((style: any) => style.name);

        // Remove password_hash and combine all data
        const { password_hash: pwd, ...userWithoutPassword } = user;
        const result = {
            ...userWithoutPassword,
            instruments: instruments,
            styles: styles
        };

        await connection.commit();
        await connection.end();
        res.status(200).send(result);
    }
    catch(err: any){
        console.log(err);
        try {
            await connection.rollback();
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        if(err && err.code === 'ER_DUP_ENTRY'){
            res.status(409).send("Username or email already exists.");
            return;
        }
        res.status(500).send('Error updating user.');
    }
};

// Delete user
export async function deleteUser(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    
    if(!idIsNan(id, res)){
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        // Check if user exists
        const [userCheck] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [id]
        ) as Array<any>;

        if(userCheck.length === 0){
            res.status(404).send("User not found.");
            await connection.end();
            return;
        }

        // Delete user (CASCADE will handle related records)
        await connection.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        await connection.end();
        res.status(200).send({ message: "User deleted successfully." });
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error deleting user.');
    }
};

export async function uploadUserProfileImage(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if(!idIsNan(id, res)){
        return;
    }

    if(!req.file){
        res.status(400).send("No image file uploaded.");
        return;
    }

    const imageUrl = toPublicUrl("users", req.file.filename);
    const connection = await mysql.createConnection(config.database);

    try{
        const [userCheck] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [id]
        ) as Array<any>;

        if(userCheck.length === 0){
            res.status(404).send("User not found.");
            await connection.end();
            return;
        }

        await connection.query(
            'UPDATE users SET profile_image_url = ? WHERE id = ?',
            [imageUrl, id]
        );

        await connection.end();
        res.status(200).send({ profile_image_url: imageUrl });
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error uploading user profile image.');
    }
}