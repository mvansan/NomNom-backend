import { Router } from "express";
import {
  getAllDishes,
  getDishesById,
  getFeedbackByDishId,
  searchDishes,
  updateAverageRate,
} from "../controllers/dishController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/search", searchDishes);
router.get("/", getAllDishes);
router.get("/:id", authenticateToken, getDishesById);
router.get("/feedback/:id", getFeedbackByDishId);
router.get("/rate/:id", updateAverageRate);

export default router;
