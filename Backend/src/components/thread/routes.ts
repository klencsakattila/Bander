import { Router } from "express";
import { getThreadById, createThread } from "./threadController";
import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

router.get("/:id/:numberofmessages", verifyToken, getThreadById);
router.post("/", verifyToken, createThread);

export default router;
