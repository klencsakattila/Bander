import { Router } from "express";
import { getAllReport, getReportById, createReport, deleteReport, updateReportStatus } from "./reportController";
import { ensureAdmin } from "../../middleware/auth";

const router: Router = Router();

router.get("/", getAllReport);
router.get("/:id", getReportById);
router.post("/", createReport);
router.delete("/:id", ensureAdmin, deleteReport);
router.patch("/:id", ensureAdmin, updateReportStatus);

export default router;
