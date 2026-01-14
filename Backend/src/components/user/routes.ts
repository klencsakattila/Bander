import { Router } from "express";
import { getUserById, signIn, getUsersLimit, signUp } from "./userController";
import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Public
router.post('/register', signUp);
router.post('/login', signIn);

// Protected - requires token in header ('x-access-token') or ?token query/body
router.get('/limit/:limit', verifyToken, getUsersLimit);
router.get("/:id", verifyToken, getUserById);

export default router;
