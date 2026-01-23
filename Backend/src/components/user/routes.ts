import { Router } from "express";
import { getUserById, signIn, getUsersLimit, signUp, updateUser, deleteUser } from "./userController";
//import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Authentication routes
router.post('/register', signUp);
router.post('/login', signIn);

// User routes
router.get('/limit/:limit', getUsersLimit);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
