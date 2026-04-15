import { Router } from "express";
import { getBandsLimit, getLatestBandPosts, getBandPostById, createBandPost, deleteBandPost, getBandById, createBand, updateBand, addBandMember, deleteBand, uploadBandProfileImage, uploadBandBannerImage, uploadBandPostImage } from "./bandController";
import { createImageUpload } from "../../middleware/upload";
import { verifyToken } from "../../middleware/auth";

const router: Router = Router();

// Band Post routes
router.get('/post/limit/:limit', verifyToken, getLatestBandPosts);
router.get('/post/limit/:limit/:offset', verifyToken, getLatestBandPosts);
router.get('/post/:id', verifyToken, getBandPostById);
router.post('/post', verifyToken, createBandPost);
router.post('/post/:id/image', verifyToken, createImageUpload("bands/posts").single("file"), uploadBandPostImage);
router.delete('/post/:id', verifyToken, deleteBandPost);


//Band routes
router.get('/limit/:limit', verifyToken, getBandsLimit);
router.get('/limit/:limit/:offset', verifyToken, getBandsLimit);
router.get('/:id', verifyToken, getBandById);
router.post('/newband', verifyToken, createBand);
router.post('/:id/profile-image', verifyToken, createImageUpload("bands/profile").single("file"), uploadBandProfileImage);
router.post('/:id/banner-image', verifyToken, createImageUpload("bands/banner").single("file"), uploadBandBannerImage);
router.patch('/:id', verifyToken, updateBand);
router.put('/newuser', verifyToken, addBandMember);
router.delete('/:id', verifyToken, deleteBand);

export default router;