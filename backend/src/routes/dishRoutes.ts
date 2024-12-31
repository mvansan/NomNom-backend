import { Router } from "express";
import {
  getAllDishes,
  getDishesById,
  searchDishes,
} from "../controllers/dishController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/search", searchDishes);
router.get("/", getAllDishes);
router.get("/:id", authenticateToken, getDishesById);

export default router;