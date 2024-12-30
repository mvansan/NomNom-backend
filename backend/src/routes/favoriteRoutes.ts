import { Router } from "express";
import { addFavorite, getFavorites, removeFavorite } from "../controllers/user/favController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.route("/").post(authenticateToken, addFavorite).delete(authenticateToken, removeFavorite);
router.route("/").get(authenticateToken, getFavorites);

export default router;