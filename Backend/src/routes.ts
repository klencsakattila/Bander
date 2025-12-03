import { Router } from "express";
import {root, getAllData, getDataById} from "./user/user_controller";
import { getAllBandData, getBandDataById } from "./band/band_controller";
import { getGiveNumberOfLatestPosts } from "./bandPost/post_controller";

const router: Router = Router()

router.get("/", root)
router.get("/user", getAllData)
router.get("/user/:id", getDataById)
router.get("/band", getAllBandData)
router.get("/band/:id", getBandDataById)
router.get("/band/post/:numberOfPosts", getGiveNumberOfLatestPosts)

export default router