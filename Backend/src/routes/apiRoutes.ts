import { Router } from "express";
import root from "../components/user/userController";
import userRoutes from "../components/user/routes";

const router: Router = Router();
router.get("/", root);
router.use("/users", userRoutes);

export default router;