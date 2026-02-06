import { Router } from "express";
import { getInstrumentById, createInstrument } from "./instrumentController";
import { verifyToken, ensureAdmin } from "../../middleware/auth";

const router: Router = Router();

router.get("/:id", getInstrumentById);
router.post("/", verifyToken, ensureAdmin, createInstrument);

export default router;
