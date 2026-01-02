import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";

export default function root(_req: Request, res: Response) {
    res.status(200).send("The server is running properly.");
}

function idIsNan(id: number, res: Response){
    if(isNaN(id)){
        res.status(400).send("Nem megfelelő formátumú azonosító.");
        return;
    };
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