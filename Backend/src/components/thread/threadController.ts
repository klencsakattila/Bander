import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";

export async function getThreadById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    const limitParam = parseInt(req.params.numberofmessages);
    const limit = isNaN(limitParam) ? 20 : Math.min(100, Math.max(1, limitParam));

    if (isNaN(id)) {
        res.status(400).send("Invalid thread id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [threadResult] = await connection.query(
            "SELECT id, created_at FROM threads WHERE id = ?",
            [id]
        ) as Array<any>;

        if (!threadResult || threadResult.length === 0) {
            await connection.end();
            res.status(404).send("Thread not found.");
            return;
        }

        const [usersResult] = await connection.query(
            "SELECT u.id, u.username FROM thread_users tu INNER JOIN users u ON tu.user_id = u.id WHERE tu.thread_id = ?",
            [id]
        ) as Array<any>;

        const [messagesResult] = await connection.query(
            "SELECT id, thread_id, sender_id, message, sent_at FROM messages WHERE thread_id = ? ORDER BY sent_at DESC LIMIT ?",
            [id, limit]
        ) as Array<any>;

        await connection.end();
        res.status(200).send({
            thread: threadResult[0],
            users: usersResult,
            messages: messagesResult
        });
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error fetching thread.");
    }
}

export async function createThread(req: Request, res: Response) {
    const { user1_id, user2_id } = req.body || {};

    if (!user1_id || !user2_id) {
        res.status(400).send("Both user IDs are required.");
        return;
    }

    const user1Id = parseInt(user1_id);
    const user2Id = parseInt(user2_id);

    if (isNaN(user1Id) || isNaN(user2Id)) {
        res.status(400).send("Invalid user id.");
        return;
    }

    if (user1Id === user2Id) {
        res.status(400).send("Users must be different.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [user1Check] = await connection.query(
            "SELECT id FROM users WHERE id = ?",
            [user1Id]
        ) as Array<any>;

        if (!user1Check || user1Check.length === 0) {
            await connection.end();
            res.status(404).send("User 1 not found.");
            return;
        }

        const [user2Check] = await connection.query(
            "SELECT id FROM users WHERE id = ?",
            [user2Id]
        ) as Array<any>;

        if (!user2Check || user2Check.length === 0) {
            await connection.end();
            res.status(404).send("User 2 not found.");
            return;
        }

        const [existingThreadResult] = await connection.query(
            "SELECT tu1.thread_id FROM thread_users tu1 INNER JOIN thread_users tu2 ON tu1.thread_id = tu2.thread_id WHERE tu1.user_id = ? AND tu2.user_id = ?",
            [user1Id, user2Id]
        ) as Array<any>;

        if (existingThreadResult && existingThreadResult.length > 0) {
            const threadId = existingThreadResult[0].thread_id;
            const [threadResult] = await connection.query(
                "SELECT id, created_at FROM threads WHERE id = ?",
                [threadId]
            ) as Array<any>;

            await connection.end();
            res.status(200).send({
                thread: threadResult[0],
                users: [{ id: user1Id }, { id: user2Id }]
            });
            return;
        }

        const [threadInsert] = await connection.query(
            "INSERT INTO threads () VALUES ()"
        ) as Array<any>;

        const threadId = (threadInsert && (threadInsert as any).insertId) ? (threadInsert as any).insertId : null;

        if (!threadId) {
            await connection.end();
            res.status(500).send("Unable to create thread.");
            return;
        }

        await connection.query(
            "INSERT INTO thread_users (thread_id, user_id) VALUES (?, ?), (?, ?)",
            [threadId, user1Id, threadId, user2Id]
        );

        const [threadResult] = await connection.query(
            "SELECT id, created_at FROM threads WHERE id = ?",
            [threadId]
        ) as Array<any>;

        await connection.end();
        res.status(201).send({
            thread: threadResult[0],
            users: [{ id: user1Id }, { id: user2Id }]
        });
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error creating thread.");
    }
}
