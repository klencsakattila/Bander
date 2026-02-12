import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../../config/config";

const REPORT_STATUSES = ["open", "reviewing", "resolved"];

export async function getAllReport(_req: Request, res: Response) {
    const connection = await mysql.createConnection(config.database);

    try {
        const [result] = await connection.query(
            "SELECT * FROM reports ORDER BY created_at DESC, id DESC"
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
        res.status(500).send("Error fetching reports.");
    }
}

export async function getReportById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).send("Invalid report id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [result] = await connection.query(
            "SELECT * FROM reports WHERE id = ?",
            [id]
        ) as Array<any>;

        if (!result || result.length === 0) {
            await connection.end();
            res.status(404).send("Report not found.");
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
        res.status(500).send("Error fetching report.");
    }
}

export async function createReport(req: Request, res: Response) {
    const { reporter_id, reported_user_id, reported_band_id, reported_post_id, report_message } = req.body || {};

    if (!reporter_id || !report_message) {
        res.status(400).send("Reporter ID and report message are required.");
        return;
    }

    const reporterId = parseInt(reporter_id);
    const reportedUserId = reported_user_id !== undefined && reported_user_id !== null ? parseInt(reported_user_id) : null;
    const reportedBandId = reported_band_id !== undefined && reported_band_id !== null ? parseInt(reported_band_id) : null;
    const reportedPostId = reported_post_id !== undefined && reported_post_id !== null ? parseInt(reported_post_id) : null;

    if (isNaN(reporterId)) {
        res.status(400).send("Invalid reporter id.");
        return;
    }

    if (reportedUserId !== null && isNaN(reportedUserId)) {
        res.status(400).send("Invalid reported user id.");
        return;
    }

    if (reportedBandId !== null && isNaN(reportedBandId)) {
        res.status(400).send("Invalid reported band id.");
        return;
    }

    if (reportedPostId !== null && isNaN(reportedPostId)) {
        res.status(400).send("Invalid reported post id.");
        return;
    }

    if (reportedUserId === null && reportedBandId === null && reportedPostId === null) {
        res.status(400).send("At least one target (user, band, or post) is required.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [reporterCheck] = await connection.query(
            "SELECT id FROM users WHERE id = ?",
            [reporterId]
        ) as Array<any>;

        if (!reporterCheck || reporterCheck.length === 0) {
            await connection.end();
            res.status(404).send("Reporter not found.");
            return;
        }

        if (reportedUserId !== null) {
            const [userCheck] = await connection.query(
                "SELECT id FROM users WHERE id = ?",
                [reportedUserId]
            ) as Array<any>;

            if (!userCheck || userCheck.length === 0) {
                await connection.end();
                res.status(404).send("Reported user not found.");
                return;
            }
        }

        if (reportedBandId !== null) {
            const [bandCheck] = await connection.query(
                "SELECT id FROM bands WHERE id = ?",
                [reportedBandId]
            ) as Array<any>;

            if (!bandCheck || bandCheck.length === 0) {
                await connection.end();
                res.status(404).send("Reported band not found.");
                return;
            }
        }

        if (reportedPostId !== null) {
            const [postCheck] = await connection.query(
                "SELECT id FROM posts WHERE id = ?",
                [reportedPostId]
            ) as Array<any>;

            if (!postCheck || postCheck.length === 0) {
                await connection.end();
                res.status(404).send("Reported post not found.");
                return;
            }
        }

        const [result] = await connection.query(
            "INSERT INTO reports (reporter_id, reported_user_id, reported_band_id, reported_post_id, report_message, report_status) VALUES (?, ?, ?, ?, ?, ?)",
            [
                reporterId,
                reportedUserId,
                reportedBandId,
                reportedPostId,
                report_message,
                "open"
            ]
        ) as Array<any>;

        const insertId = (result && (result as any).insertId) ? (result as any).insertId : null;

        if (!insertId) {
            await connection.end();
            res.status(500).send("Unable to create report.");
            return;
        }

        const [reportResult] = await connection.query(
            "SELECT * FROM reports WHERE id = ?",
            [insertId]
        ) as Array<any>;

        await connection.end();
        res.status(201).send(reportResult[0]);
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error creating report.");
    }
}

export async function deleteReport(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).send("Invalid report id.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [reportCheck] = await connection.query(
            "SELECT id FROM reports WHERE id = ?",
            [id]
        ) as Array<any>;

        if (!reportCheck || reportCheck.length === 0) {
            await connection.end();
            res.status(404).send("Report not found.");
            return;
        }

        await connection.query(
            "DELETE FROM reports WHERE id = ?",
            [id]
        );

        await connection.end();
        res.status(200).send({ message: "Report deleted successfully." });
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error deleting report.");
    }
}

export async function updateReportStatus(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    const { report_status } = req.body || {};

    if (isNaN(id)) {
        res.status(400).send("Invalid report id.");
        return;
    }

    if (!report_status || !REPORT_STATUSES.includes(report_status)) {
        res.status(400).send("Invalid report status.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    try {
        const [reportCheck] = await connection.query(
            "SELECT id FROM reports WHERE id = ?",
            [id]
        ) as Array<any>;

        if (!reportCheck || reportCheck.length === 0) {
            await connection.end();
            res.status(404).send("Report not found.");
            return;
        }

        await connection.query(
            "UPDATE reports SET report_status = ? WHERE id = ?",
            [report_status, id]
        );

        const [reportResult] = await connection.query(
            "SELECT * FROM reports WHERE id = ?",
            [id]
        ) as Array<any>;

        await connection.end();
        res.status(200).send(reportResult[0]);
    } catch (err) {
        console.log(err);
        try {
            await connection.end();
        } catch (closeErr) {
            // Ignore close errors
        }
        res.status(500).send("Error updating report status.");
    }
}
