import { Router } from "express";
import { getAllReport, getReportById, createReport, deleteReport, updateReportStatus } from "./reportController";
import { verifyToken, ensureAdmin } from "../../middleware/auth";

const router: Router = Router();

router.get("/", verifyToken, getAllReport);
router.get("/:id", getReportById);
router.post("/", createReport);
router.delete("/:id", deleteReport);
router.patch("/:id", verifyToken, ensureAdmin, updateReportStatus);

export default router;
