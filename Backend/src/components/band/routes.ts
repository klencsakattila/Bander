import { Router } from "express";
import { getBandsLimit, getLatestBandPosts, getBandPostById, createBandPost, deleteBandPost, getBandById, createBand, updateBand, addBandMember, deleteBand } from "./bandController";
//import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Band Post routes
router.get('/post/limit/:limit', getLatestBandPosts);
router.get('/post/limit/:limit/:offset', getLatestBandPosts);
router.get('/post/:id', getBandPostById);
router.post('/post', createBandPost);
router.delete('/post/:id', deleteBandPost);


//Band routes
router.get('/limit/:limit', getBandsLimit);
router.get('/limit/:limit/:offset', getBandsLimit);
router.get('/:id', getBandById);
router.post('/newband', createBand);
router.patch('/:id', updateBand);
router.put('/newuser', addBandMember);
router.delete('/:id', deleteBand);

export default router;