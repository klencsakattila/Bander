import { Router } from "express";
import root from "../components/user/userController";
import userRoutes from "../components/user/routes";
import bandRoutes from "../components/band/routes";
import reportRoutes from "../components/report/routes";
import instrumentRoutes from "../components/instrument/routes";
import genreRoutes from "../components/genre/routes";
import threadRoutes from "../components/thread/routes";
import messageRoutes from "../components/message/routes";

const router: Router = Router();
router.get("/", root);
router.use("/users", userRoutes);
router.use("/bands", bandRoutes);
router.use("/reports", reportRoutes);
router.use("/instrument", instrumentRoutes);
router.use("/genres", genreRoutes);
router.use("/thread", threadRoutes);
router.use("/message", messageRoutes);

export default router;