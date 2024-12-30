import { Router } from "express";
import { getDishes } from "../../controllers/dish/dish";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.route("/").post(authenticateToken, getDishes);

export default router;
