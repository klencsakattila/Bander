import { Router } from "express";
import { getInstrumentById, createInstrument, getAllInstruments } from "./instrumentController";
import { verifyToken, ensureAdmin } from "../../middleware/auth";

const router: Router = Router();

router.get("/", getAllInstruments);
router.get("/:id", getInstrumentById);
router.post("/", verifyToken, ensureAdmin, createInstrument);

export default router;
