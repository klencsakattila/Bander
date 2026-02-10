import { Router } from "express";
import { getGenreById, createGenre, getAllGenres } from "./genreController";
import { verifyToken, ensureAdmin } from "../../middleware/auth";

const router: Router = Router();

router.get("/", getAllGenres);
router.get("/:id", getGenreById);
router.post("/", verifyToken, ensureAdmin, createGenre);

export default router;
