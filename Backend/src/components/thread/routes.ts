import { Router } from "express";
import { getThreadById, createThread } from "./threadController";

const router: Router = Router();

router.get("/:id/:numberofmessages", getThreadById);
router.post("/", createThread);

export default router;
