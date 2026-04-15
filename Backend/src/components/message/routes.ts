import { Router } from "express";
import { createMessage, deleteMessage } from "./messageController";
import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

router.post("/", verifyToken, createMessage);
router.delete("/:id", verifyToken, deleteMessage);

export default router;
