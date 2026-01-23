import { Router } from "express";
import { getBandsLimit, getLatestBandPosts, getBandById, createBand, updateBand, addBandMember, deleteBand } from "./bandController";
//import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Band routes
router.get('/limit/:limit', getBandsLimit);
router.get('/post/limit/:limit', getLatestBandPosts);
router.get('/:id', getBandById);
router.post('/newband', createBand);
router.patch('/:id', updateBand);
router.put('/newuser', addBandMember);
router.delete('/:id', deleteBand);

export default router;