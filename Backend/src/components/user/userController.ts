import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";
import jwt from "jsonwebtoken";

export default function root(_req: Request, res: Response) {
    res.status(200).send("The server is running properly.");
}

function idIsNan(id: number, res: Response){
    if(isNaN(id)){
        res.status(400).send("Nem megfelelő formátumú azonosító.");
        return;
    };
};

export async function signIn(req: any, res: any) {
    const { email, password } = req.body || {};

    // DEBUG: inspect incoming request for content-type and body keys (remove in production)
    console.log('signIn - method:', req.method, 'path:', req.path);
    console.log('signIn - content-type:', req.headers && (req.headers['content-type'] || req.headers['Content-Type']));
    console.log('signIn - body type:', typeof req.body, 'body keys:', Object.keys(req.body || {}));
    console.log('signIn - password present:', !!(req.body && req.body.password));

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

        if(!result[0].id){
            return res.status(401).send("Incorrect email or password.");
        };

        if(!config.jwtSecret){
            return res.status(500).send("Error with the secret key.");
        };

        const token = jwt.sign({id: result[0].id}, config.jwtSecret, {expiresIn: "2h"});

        res.status(201).send({token: token});
    }
    catch(err){
        console.log(err);
    }
};

export async function getUserById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    idIsNan(id, res);

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        ) as Array<any>;

        if(result.length > 0){
            res.status(200).send(result);
            return;
        };

        res.status(404).send("There arent any items with the given id.");
    }
    catch(err){
        console.log(err);
    }
};

export async function getUsersLimit(req: Request, res: Response) {
    const limitParam = parseInt((req.params.limit || req.query.limit) as string);
    const limit = isNaN(limitParam) ? 10 : Math.min(20, Math.max(1, limitParam));

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT id, username, email, first_name, last_name, city, birth_date, created_at FROM users ORDER BY created_at DESC LIMIT ?',
            [limit]
        ) as Array<any>;

        res.status(200).send(result);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error fetching users.');
    }
};