import { Request, Response } from "express";
import pool from "../../config/db";

export default function root(_req: Request, res: Response) {
    res.status(200).send("The server is running properly.");
}

export const getUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid user id" });

  try {
    const [userRows]: any = await pool.query(
      "SELECT id, username, email, first_name, last_name, city, birth_date, created_at FROM users WHERE id = ?",
      [id]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};