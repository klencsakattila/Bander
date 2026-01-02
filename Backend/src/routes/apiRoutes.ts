<<<<<<< HEAD
import { Router } from "express"
import { root } from "../controllers/apiController"
=======
import { Router } from "express";
import root from "../components/user/userController";
import userRoutes from "../components/user/routes";
>>>>>>> cae43ffddcc2f23e0437a9340bd2b37c31e58463

const router: Router = Router();
router.get("/", root);
router.use("/users", userRoutes);

export default router;