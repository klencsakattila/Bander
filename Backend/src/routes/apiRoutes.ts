import { Router } from "express";
import root from "../components/user/userController";
import userRoutes from "../components/user/routes";
import bandRoutes from "../components/band/routes";

const router: Router = Router();
router.get("/", root);
router.use("/users", userRoutes);
router.use("/bands", bandRoutes);

export default router;