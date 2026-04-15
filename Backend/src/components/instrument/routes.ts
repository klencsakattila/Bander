import { Router } from "express";
import { getInstrumentById, createInstrument, getAllInstruments } from "./instrumentController";
import { verifyToken, ensureAdmin } from "../../middleware/auth";

const router: Router = Router();

router.get("/", verifyToken, getAllInstruments);
router.get("/:id", verifyToken, getInstrumentById);
router.post("/", verifyToken, ensureAdmin, createInstrument);

export default router;
