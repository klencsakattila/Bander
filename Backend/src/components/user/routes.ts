import { Router } from "express";
import { getUserById, signIn, getUsersLimit, signUp, updateUser, deleteUser, uploadUserProfileImage } from "./userController";
import { createImageUpload } from "../../middleware/upload";
//import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Authentication routes
router.post('/register', signUp);
router.post('/login', signIn);

// User routes
router.get('/limit/:limit', getUsersLimit);
router.get('/limit/:limit/:offset', getUsersLimit);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.post("/:id/profile-image", createImageUpload("users").single("file"), uploadUserProfileImage);
router.delete("/:id", deleteUser);

export default router;
