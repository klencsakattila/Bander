import { Router } from "express";
import { getUserById, signIn, getUsersLimit, signUp, updateUser, deleteUser, uploadUserProfileImage } from "./userController";
import { createImageUpload } from "../../middleware/upload";
import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Authentication routes
router.post('/register', signUp);
router.post('/login', signIn);

// User routes
router.get('/limit/:limit', verifyToken, getUsersLimit);
router.get('/limit/:limit/:offset', verifyToken, getUsersLimit);
router.get("/:id", verifyToken, getUserById);
router.patch("/:id", verifyToken, updateUser);
router.post("/:id/profile-image", verifyToken, createImageUpload("users").single("file"), uploadUserProfileImage);
router.delete("/:id", verifyToken, deleteUser);

export default router;
