import { Router } from "express";
import root from "../components/user/userController";
import userRoutes from "../components/user/routes";
<<<<<<< HEAD
=======
import bandRoutes from "../components/band/routes";
>>>>>>> c3bee8633277148cae04c0b093848140e94f13ed

const router: Router = Router();
router.get("/", root);
router.use("/users", userRoutes);
router.use("/bands", bandRoutes);

export default router;