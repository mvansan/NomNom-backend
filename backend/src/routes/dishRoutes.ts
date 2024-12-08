import { Router } from "express";
import {
  getAllDishes,
  getDishesById,
  searchDishes,
} from "../controllers/dishController";

const router = Router();

router.get("/search", searchDishes);
router.get("/", getAllDishes);
router.get("/:id", getDishesById);

export default router;
