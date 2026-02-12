import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";

export async function getGenreById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).send("Invalid genre id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [result] = await connection.query(
            "SELECT id, name FROM musical_styles WHERE id = ?",
            [id]
        ) as Array<any>;

        if (!result || result.length === 0) {
            await connection.end();
            res.status(404).send("Genre not found.");
            return;
        }

        await connection.end();
        res.status(200).send(result[0]);
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error fetching genre.");
    }
}

export async function createGenre(req: Request, res: Response) {
    const { name } = req.body || {};

    if (!name) {
        res.status(400).send("Genre name is required.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [result] = await connection.query(
            "INSERT INTO musical_styles (name) VALUES (?)",
            [name]
        ) as Array<any>;

        const insertId = (result && (result as any).insertId) ? (result as any).insertId : null;

        if (!insertId) {
            await connection.end();
            res.status(500).send("Unable to create genre.");
            return;
        }

        const [genreResult] = await connection.query(
            "SELECT id, name FROM musical_styles WHERE id = ?",
            [insertId]
        ) as Array<any>;

        await connection.end();
        res.status(201).send(genreResult[0]);
    } catch (err: any) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        if (err && err.code === "ER_DUP_ENTRY") {
            res.status(409).send("Genre with this name already exists.");
            return;
        }
        res.status(500).send("Error creating genre.");
    }
}

export async function getAllGenres(_req: Request, res: Response) {
    const connection = await mysql.createConnection(config.database);

    try {
        const [result] = await connection.query(
            "SELECT id, name FROM musical_styles ORDER BY name ASC"
        ) as Array<any>;

        await connection.end();
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error fetching genres.");
    }
}
