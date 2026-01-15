import { Router } from "express";
import { getBandsLimit, getLatestBandPosts, getBandById } from "./bandController";
//import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// All endpoints require authentication
router.get('/limit/:limit', getBandsLimit);
router.get('/post/limit/:limit', getLatestBandPosts);
router.get('/:id', getBandById);

export default router;