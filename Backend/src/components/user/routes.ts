import { Router } from "express";
import { getUserById } from "./userController";

const router: Router = Router();
router.get("/:id", getUserById);

export default router;
