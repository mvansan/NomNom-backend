import { Router } from "express";
import { addFavorite, getFavorites, removeFavorite } from "../controllers/user/favController";

const router = Router();

router.route("/").post(addFavorite).delete(removeFavorite);
router.route("/:user_id").get(getFavorites);

export default router;