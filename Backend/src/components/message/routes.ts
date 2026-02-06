import { Router } from "express";
import { createMessage, deleteMessage } from "./messageController";

const router: Router = Router();

router.post("/", createMessage);
router.delete("/:id", deleteMessage);

export default router;
