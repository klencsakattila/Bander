import { Router } from "express";
import { getBandsLimit, getLatestBandPosts, getBandById } from "./bandController";
import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// All endpoints require authentication
router.get('/limit/:limit', verifyToken, getBandsLimit);
router.get('/post/limit/:limit', verifyToken, getLatestBandPosts);
router.get('/:id', verifyToken, getBandById);

export default router;