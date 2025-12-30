import { Router } from "express"
import { root } from "../controllers/apiController"

const router: Router = Router()
router.get('/',root)

export default router