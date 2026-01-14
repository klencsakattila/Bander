import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";

export async function getBandsLimit(req: Request, res: Response) {
    const limitParam = parseInt((req.params.limit || req.query.limit || '10') as string);
    const limit = isNaN(limitParam) ? 10 : Math.min(20, Math.max(1, limitParam));

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT id, name, city, created_at FROM bands ORDER BY created_at DESC LIMIT ?',
            [limit]
        ) as Array<any>;

        res.status(200).send(result);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error fetching bands.');
    }
}

export async function getLatestBandPosts(req: Request, res: Response) {
    const limitParam = parseInt((req.params.limit || req.query.limit || '10') as string);
    const limit = isNaN(limitParam) ? 10 : Math.min(20, Math.max(1, limitParam));

    const connection = await mysql.createConnection(config.database);

    try{
        const [result] = await connection.query(
            'SELECT p.id, p.band_id, p.post_type, p.post_message, p.created_at, b.name as band_name FROM posts p LEFT JOIN bands b ON p.band_id = b.id WHERE p.band_id IS NOT NULL ORDER BY p.created_at DESC LIMIT ?',
            [limit]
        ) as Array<any>;

        res.status(200).send(result);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error fetching band posts.');
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
        const [result] = await connection.query(
            'SELECT * FROM bands WHERE id = ?',
            [id]
        ) as Array<any>;

        if(result.length > 0){
            res.status(200).send(result[0]);
            return;
        }

        res.status(404).send("No band found with the given id.");
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error fetching band.');
    }
}