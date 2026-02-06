import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";

export async function createMessage(req: Request, res: Response) {
    const { thread_id, sender_id, message } = req.body || {};

    if (!thread_id || !sender_id || !message) {
        res.status(400).send("Thread ID, sender ID, and message are required.");
        return;
    }

    const threadId = parseInt(thread_id);
    const senderId = parseInt(sender_id);

    if (isNaN(threadId) || isNaN(senderId)) {
        res.status(400).send("Invalid thread id or sender id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [threadCheck] = await connection.query(
            "SELECT id FROM threads WHERE id = ?",
            [threadId]
        ) as Array<any>;

        if (!threadCheck || threadCheck.length === 0) {
            await connection.end();
            res.status(404).send("Thread not found.");
            return;
        }

        const [senderCheck] = await connection.query(
            "SELECT id FROM users WHERE id = ?",
            [senderId]
        ) as Array<any>;

        if (!senderCheck || senderCheck.length === 0) {
            await connection.end();
            res.status(404).send("Sender not found.");
            return;
        }

        const [membershipCheck] = await connection.query(
            "SELECT thread_id FROM thread_users WHERE thread_id = ? AND user_id = ?",
            [threadId, senderId]
        ) as Array<any>;

        if (!membershipCheck || membershipCheck.length === 0) {
            await connection.end();
            res.status(403).send("Sender is not in this thread.");
            return;
        }

        const [result] = await connection.query(
            "INSERT INTO messages (thread_id, sender_id, message) VALUES (?, ?, ?)",
            [threadId, senderId, message]
        ) as Array<any>;

        const insertId = (result && (result as any).insertId) ? (result as any).insertId : null;

        if (!insertId) {
            await connection.end();
            res.status(500).send("Unable to create message.");
            return;
        }

        const [messageResult] = await connection.query(
            "SELECT id, thread_id, sender_id, message, sent_at FROM messages WHERE id = ?",
            [insertId]
        ) as Array<any>;

        await connection.end();
        res.status(201).send(messageResult[0]);
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error creating message.");
    }
}

export async function deleteMessage(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).send("Invalid message id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [messageCheck] = await connection.query(
            "SELECT id FROM messages WHERE id = ?",
            [id]
        ) as Array<any>;

        if (!messageCheck || messageCheck.length === 0) {
            await connection.end();
            res.status(404).send("Message not found.");
            return;
        }

        await connection.query(
            "DELETE FROM messages WHERE id = ?",
            [id]
        );

        await connection.end();
        res.status(200).send({ message: "Message deleted successfully." });
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error deleting message.");
    }
}
