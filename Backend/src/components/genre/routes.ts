import { Router } from "express";
import { getGenreById, createGenre, getAllGenres } from "./genreController";
import { verifyToken, ensureAdmin } from "../../middleware/auth";

const router: Router = Router();

router.get("/", verifyToken, getAllGenres);
router.get("/:id", verifyToken, getGenreById);
router.post("/", verifyToken, ensureAdmin, createGenre);

export default router;