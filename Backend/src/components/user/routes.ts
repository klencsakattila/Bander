import { Router } from "express";
import { getUserById, signIn, getUsersLimit, signUp } from "./userController";
//import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

router.post('/register', signUp);
router.post('/login', signIn);

router.get('/limit/:limit', getUsersLimit);
router.get("/:id", getUserById);

export default router;
