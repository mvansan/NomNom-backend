import { Router } from "express";
import {
  getCartItems,
  addToCart,
  deleteFromCart,
} from "../../controllers/cart/cart";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();
router
  .route("/")
  .get(authenticateToken, getCartItems)
  .post(authenticateToken, addToCart)
  .delete(authenticateToken, deleteFromCart);

export default router;
