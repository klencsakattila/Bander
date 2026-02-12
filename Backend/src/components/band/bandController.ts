import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";
import { toPublicUrl } from "../../middleware/upload";

export async function getBandsLimit(req: Request, res: Response) {
    const limitParam = parseInt((req.params.limit || req.query.limit || '10') as string);
    const limit = isNaN(limitParam) ? 10 : Math.min(20, Math.max(1, limitParam));
    const offsetParam = parseInt((req.params.offset || req.query.offset || '0') as string);
    const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT id, name, city, profile_image_url, banner_image_url, created_at FROM bands ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        ) as Array<any>;

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
        res.status(500).send('Error fetching bands.');
    }
}

export async function getLatestBandPosts(req: Request, res: Response) {
    const limitParam = parseInt((req.params.limit || req.query.limit || '10') as string);
    const limit = isNaN(limitParam) ? 10 : Math.min(20, Math.max(1, limitParam));
    const offsetParam = parseInt((req.params.offset || req.query.offset || '0') as string);
    const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT p.id, p.band_id, p.post_type, p.post_message, p.image_url, p.created_at, b.name as band_name FROM posts p LEFT JOIN bands b ON p.band_id = b.id WHERE p.band_id IS NOT NULL ORDER BY p.created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        ) as Array<any>;

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
        res.status(500).send('Error fetching band posts.');
    }
}

export async function getBandPostById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if(isNaN(id)){
        res.status(400).send("Invalid post id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT p.id, p.band_id, p.post_type, p.post_message, p.image_url, p.created_at, p.expires_at, b.name as band_name FROM posts p LEFT JOIN bands b ON p.band_id = b.id WHERE p.id = ? AND p.band_id IS NOT NULL',
            [id]
        ) as Array<any>;

        if(!result || result.length === 0){
            await connection.end();
            res.status(404).send("Band post not found.");
            return;
        }

        await connection.end();
        res.status(200).send(result[0]);
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error fetching band post.');
    }
}

export async function createBandPost(req: Request, res: Response) {
    const { band_id, post_type, post_message, expires_at } = req.body || {};

    if(!band_id || !post_type || !post_message || !expires_at){
        res.status(400).send("Band ID, post type, post message, and expiry date are required.");
        return;
    }

    const validTypes = ['search', 'announcement', 'general'];
    if(!validTypes.includes(post_type)){
        res.status(400).send("Invalid post type.");
        return;
    }

    const expiresAtDate = new Date(expires_at);
    if(isNaN(expiresAtDate.getTime())){
        res.status(400).send("Invalid expiry date.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        const [bandCheck] = await connection.query(
            'SELECT id FROM bands WHERE id = ?',
            [band_id]
        ) as Array<any>;

        if(!bandCheck || bandCheck.length === 0){
            await connection.end();
            res.status(404).send("Band not found.");
            return;
        }

        const [result] = await connection.query(
            'INSERT INTO posts (band_id, post_type, post_message, expires_at) VALUES (?, ?, ?, ?)',
            [band_id, post_type, post_message, expiresAtDate]
        ) as Array<any>;

        const insertId = (result && (result as any).insertId) ? (result as any).insertId : null;

        if(!insertId){
            await connection.end();
            res.status(500).send("Unable to create band post.");
            return;
        }

        const [postResult] = await connection.query(
            'SELECT p.id, p.band_id, p.post_type, p.post_message, p.image_url, p.created_at, p.expires_at, b.name as band_name FROM posts p LEFT JOIN bands b ON p.band_id = b.id WHERE p.id = ? AND p.band_id IS NOT NULL',
            [insertId]
        ) as Array<any>;

        await connection.end();
        res.status(201).send(postResult[0]);
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error creating band post.');
    }
}

export async function deleteBandPost(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if(isNaN(id)){
        res.status(400).send("Invalid post id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        const [postCheck] = await connection.query(
            'SELECT id FROM posts WHERE id = ? AND band_id IS NOT NULL',
            [id]
        ) as Array<any>;

        if(!postCheck || postCheck.length === 0){
            await connection.end();
            res.status(404).send("Band post not found.");
            return;
        }

        await connection.query(
            'DELETE FROM posts WHERE id = ? AND band_id IS NOT NULL',
            [id]
        );

        await connection.end();
        res.status(200).send({ message: "Band post deleted successfully." });
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error deleting band post.');
    }
}

export async function getBandById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    if(isNaN(id)){
        res.status(400).send("Invalid band id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        // Get band basic info
        const [bandResult] = await connection.query(
            'SELECT * FROM bands WHERE id = ?',
            [id]
        ) as Array<any>;

        if(bandResult.length === 0){
            res.status(404).send("No band found with the given id.");
            return;
        }

        const band = bandResult[0];

        // Get band members with their instruments
        const [membersResult] = await connection.query(
            `SELECT DISTINCT
                u.id,
                u.username,
                GROUP_CONCAT(DISTINCT i.name ORDER BY i.name SEPARATOR ', ') as instruments
            FROM band_members bm
            INNER JOIN users u ON bm.user_id = u.id
            LEFT JOIN user_instruments ui ON u.id = ui.user_id
            LEFT JOIN instruments i ON ui.instrument_id = i.id
            WHERE bm.band_id = ?
            GROUP BY u.id, u.username`,
            [id]
        ) as Array<any>;

        // Get band styles
        const [stylesResult] = await connection.query(
            `SELECT ms.id, ms.name
            FROM band_styles bs
            INNER JOIN musical_styles ms ON bs.style_id = ms.id
            WHERE bs.band_id = ?`,
            [id]
        ) as Array<any>;

        // Format members: convert instruments string to array, or empty array if null
        const members = membersResult.map((member: any) => ({
            id: member.id,
            username: member.username,
            instruments: member.instruments ? member.instruments.split(', ') : []
        }));

        // Format styles: extract just the names
        const styles = stylesResult.map((style: any) => style.name);

        // Combine all data
        const result = {
            ...band,
            members: members,
            styles: styles
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
        res.status(500).send('Error fetching band.');
    }
}

// Create new band
export async function createBand(req: Request, res: Response) {
    const { name, city } = req.body || {};

    if(!name){
        res.status(400).send("Band name is required.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'INSERT INTO bands (name, city) VALUES (?, ?)',
            [name, city || null]
        ) as Array<any>;

        const insertId = (result && (result as any).insertId) ? (result as any).insertId : null;

        if(!insertId){
            res.status(500).send("Unable to create band.");
            await connection.end();
            return;
        }

        // Get the created band with all details
        const [bandResult] = await connection.query(
            'SELECT * FROM bands WHERE id = ?',
            [insertId]
        ) as Array<any>;

        const band = bandResult[0];

        // Get band members (empty initially)
        const [membersResult] = await connection.query(
            `SELECT DISTINCT
                u.id,
                u.username,
                GROUP_CONCAT(DISTINCT i.name ORDER BY i.name SEPARATOR ', ') as instruments
            FROM band_members bm
            INNER JOIN users u ON bm.user_id = u.id
            LEFT JOIN user_instruments ui ON u.id = ui.user_id
            LEFT JOIN instruments i ON ui.instrument_id = i.id
            WHERE bm.band_id = ?
            GROUP BY u.id, u.username`,
            [insertId]
        ) as Array<any>;

        // Get band styles (empty initially)
        const [stylesResult] = await connection.query(
            `SELECT ms.id, ms.name
            FROM band_styles bs
            INNER JOIN musical_styles ms ON bs.style_id = ms.id
            WHERE bs.band_id = ?`,
            [insertId]
        ) as Array<any>;

        const members = membersResult.map((member: any) => ({
            id: member.id,
            username: member.username,
            instruments: member.instruments ? member.instruments.split(', ') : []
        }));

        const styles = stylesResult.map((style: any) => style.name);

        const result_band = {
            ...band,
            members: members,
            styles: styles
        };

        await connection.end();
        res.status(201).send(result_band);
    }
    catch(err: any){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        if(err && err.code === 'ER_DUP_ENTRY'){
            res.status(409).send("Band with this name already exists.");
            return;
        }
        res.status(500).send('Error creating band.');
    }
}

// Update band details
export async function updateBand(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    
    if(isNaN(id)){
        res.status(400).send("Invalid band id.");
        return;
    }

    const { name, city } = req.body || {};

    const connection = await mysql.createConnection(config.database);

    try{
        // Check if band exists
        const [bandCheck] = await connection.query(
            'SELECT id FROM bands WHERE id = ?',
            [id]
        ) as Array<any>;

        if(bandCheck.length === 0){
            res.status(404).send("Band not found.");
            await connection.end();
            return;
        }

        // Build update query dynamically
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if(name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if(city !== undefined) {
            updateFields.push('city = ?');
            updateValues.push(city);
        }

        if(updateFields.length === 0){
            res.status(400).send("No fields to update.");
            await connection.end();
            return;
        }

        updateValues.push(id);

        const updateQuery = `UPDATE bands SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await connection.query(updateQuery, updateValues);

        // Get updated band with all details
        const [bandResult] = await connection.query(
            'SELECT * FROM bands WHERE id = ?',
            [id]
        ) as Array<any>;

        const band = bandResult[0];

        // Get band members
        const [membersResult] = await connection.query(
            `SELECT DISTINCT
                u.id,
                u.username,
                GROUP_CONCAT(DISTINCT i.name ORDER BY i.name SEPARATOR ', ') as instruments
            FROM band_members bm
            INNER JOIN users u ON bm.user_id = u.id
            LEFT JOIN user_instruments ui ON u.id = ui.user_id
            LEFT JOIN instruments i ON ui.instrument_id = i.id
            WHERE bm.band_id = ?
            GROUP BY u.id, u.username`,
            [id]
        ) as Array<any>;

        // Get band styles
        const [stylesResult] = await connection.query(
            `SELECT ms.id, ms.name
            FROM band_styles bs
            INNER JOIN musical_styles ms ON bs.style_id = ms.id
            WHERE bs.band_id = ?`,
            [id]
        ) as Array<any>;

        const members = membersResult.map((member: any) => ({
            id: member.id,
            username: member.username,
            instruments: member.instruments ? member.instruments.split(', ') : []
        }));

        const styles = stylesResult.map((style: any) => style.name);

        const result = {
            ...band,
            members: members,
            styles: styles
        };

        await connection.end();
        res.status(200).send(result);
    }
    catch(err: any){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        if(err && err.code === 'ER_DUP_ENTRY'){
            res.status(409).send("Band with this name already exists.");
            return;
        }
        res.status(500).send('Error updating band.');
    }
}

// Add new member to band
export async function addBandMember(req: Request, res: Response) {
    const { band_id, user_id, role } = req.body || {};

    if(!band_id || !user_id){
        res.status(400).send("Band ID and User ID are required.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        // Check if band exists
        const [bandCheck] = await connection.query(
            'SELECT id FROM bands WHERE id = ?',
            [band_id]
        ) as Array<any>;

        if(bandCheck.length === 0){
            res.status(404).send("Band not found.");
            await connection.end();
            return;
        }

        // Check if user exists
        const [userCheck] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [user_id]
        ) as Array<any>;

        if(userCheck.length === 0){
            res.status(404).send("User not found.");
            await connection.end();
            return;
        }

        // Check if member already exists
        const [memberCheck] = await connection.query(
            'SELECT band_id, user_id FROM band_members WHERE band_id = ? AND user_id = ?',
            [band_id, user_id]
        ) as Array<any>;

        if(memberCheck.length > 0){
            res.status(409).send("User is already a member of this band.");
            await connection.end();
            return;
        }

        // Add member
        await connection.query(
            'INSERT INTO band_members (band_id, user_id, role) VALUES (?, ?, ?)',
            [band_id, user_id, role || null]
        );

        // Get updated band with all details
        const [bandResult] = await connection.query(
            'SELECT * FROM bands WHERE id = ?',
            [band_id]
        ) as Array<any>;

        const band = bandResult[0];

        // Get band members
        const [membersResult] = await connection.query(
            `SELECT DISTINCT
                u.id,
                u.username,
                GROUP_CONCAT(DISTINCT i.name ORDER BY i.name SEPARATOR ', ') as instruments
            FROM band_members bm
            INNER JOIN users u ON bm.user_id = u.id
            LEFT JOIN user_instruments ui ON u.id = ui.user_id
            LEFT JOIN instruments i ON ui.instrument_id = i.id
            WHERE bm.band_id = ?
            GROUP BY u.id, u.username`,
            [band_id]
        ) as Array<any>;

        // Get band styles
        const [stylesResult] = await connection.query(
            `SELECT ms.id, ms.name
            FROM band_styles bs
            INNER JOIN musical_styles ms ON bs.style_id = ms.id
            WHERE bs.band_id = ?`,
            [band_id]
        ) as Array<any>;

        const members = membersResult.map((member: any) => ({
            id: member.id,
            username: member.username,
            instruments: member.instruments ? member.instruments.split(', ') : []
        }));

        const styles = stylesResult.map((style: any) => style.name);

        const result = {
            ...band,
            members: members,
            styles: styles
        };

        await connection.end();
        res.status(201).send(result);
    }
    catch(err: any){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error adding band member.');
    }
}

// Delete band
export async function deleteBand(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    
    if(isNaN(id)){
        res.status(400).send("Invalid band id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try{
        // Check if band exists
        const [bandCheck] = await connection.query(
            'SELECT id FROM bands WHERE id = ?',
            [id]
        ) as Array<any>;

        if(bandCheck.length === 0){
            res.status(404).send("Band not found.");
            await connection.end();
            return;
        }

        // Delete band (CASCADE will handle related records)
        await connection.query(
            'DELETE FROM bands WHERE id = ?',
            [id]
        );

        await connection.end();
        res.status(200).send({ message: "Band deleted successfully." });
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error deleting band.');
    }
}

export async function uploadBandProfileImage(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if(isNaN(id)){
        res.status(400).send("Invalid band id.");
        return;
    }

    if(!req.file){
        res.status(400).send("No image file uploaded.");
        return;
    }

    const imageUrl = toPublicUrl("bands/profile", req.file.filename);
    const connection = await mysql.createConnection(config.database);

    try{
        const [bandCheck] = await connection.query(
            'SELECT id FROM bands WHERE id = ?',
            [id]
        ) as Array<any>;

        if(bandCheck.length === 0){
            res.status(404).send("Band not found.");
            await connection.end();
            return;
        }

        await connection.query(
            'UPDATE bands SET profile_image_url = ? WHERE id = ?',
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
        res.status(500).send('Error uploading band profile image.');
    }
}

export async function uploadBandBannerImage(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if(isNaN(id)){
        res.status(400).send("Invalid band id.");
        return;
    }

    if(!req.file){
        res.status(400).send("No image file uploaded.");
        return;
    }

    const imageUrl = toPublicUrl("bands/banner", req.file.filename);
    const connection = await mysql.createConnection(config.database);

    try{
        const [bandCheck] = await connection.query(
            'SELECT id FROM bands WHERE id = ?',
            [id]
        ) as Array<any>;

        if(bandCheck.length === 0){
            res.status(404).send("Band not found.");
            await connection.end();
            return;
        }

        await connection.query(
            'UPDATE bands SET banner_image_url = ? WHERE id = ?',
            [imageUrl, id]
        );

        await connection.end();
        res.status(200).send({ banner_image_url: imageUrl });
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error uploading band banner image.');
    }
}

export async function uploadBandPostImage(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if(isNaN(id)){
        res.status(400).send("Invalid post id.");
        return;
    }

    if(!req.file){
        res.status(400).send("No image file uploaded.");
        return;
    }

    const imageUrl = toPublicUrl("bands/posts", req.file.filename);
    const connection = await mysql.createConnection(config.database);

    try{
        const [postCheck] = await connection.query(
            'SELECT id FROM posts WHERE id = ? AND band_id IS NOT NULL',
            [id]
        ) as Array<any>;

        if(postCheck.length === 0){
            res.status(404).send("Band post not found.");
            await connection.end();
            return;
        }

        await connection.query(
            'UPDATE posts SET image_url = ? WHERE id = ?',
            [imageUrl, id]
        );

        await connection.end();
        res.status(200).send({ image_url: imageUrl });
    }
    catch(err){
        console.log(err);
        try {
            await connection.end();
        } catch(closeErr) {
            // Ignore close errors
        }
        res.status(500).send('Error uploading band post image.');
    }
}