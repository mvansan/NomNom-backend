import { Router } from "express";
import {
  getAllDishes,
  getDishesById,
  searchDishes,
} from "../controllers/dishController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/search", authenticateToken, searchDishes);
router.get("/", authenticateToken, getAllDishes);
router.get("/:id", authenticateToken, getDishesById);

export default router;
