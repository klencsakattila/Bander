import { Router } from "express";
import { getBandsLimit, getLatestBandPosts, getBandPostById, createBandPost, deleteBandPost, getBandById, createBand, updateBand, addBandMember, deleteBand, uploadBandProfileImage, uploadBandBannerImage, uploadBandPostImage } from "./bandController";
import { createImageUpload } from "../../middleware/upload";
//import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Band Post routes
router.get('/post/limit/:limit', getLatestBandPosts);
router.get('/post/limit/:limit/:offset', getLatestBandPosts);
router.get('/post/:id', getBandPostById);
router.post('/post', createBandPost);
router.post('/post/:id/image', createImageUpload("bands/posts").single("file"), uploadBandPostImage);
router.delete('/post/:id', deleteBandPost);


//Band routes
router.get('/limit/:limit', getBandsLimit);
router.get('/limit/:limit/:offset', getBandsLimit);
router.get('/:id', getBandById);
router.post('/newband', createBand);
router.post('/:id/profile-image', createImageUpload("bands/profile").single("file"), uploadBandProfileImage);
router.post('/:id/banner-image', createImageUpload("bands/banner").single("file"), uploadBandBannerImage);
router.patch('/:id', updateBand);
router.put('/newuser', addBandMember);
router.delete('/:id', deleteBand);

export default router;