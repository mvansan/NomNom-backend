import { Router } from "express";
import {
  getCartItems,
  addToCart,
  deleteFromCart,
  clearCart,
} from "../../controllers/cart/cart";

const router = Router();

router.route("/").get(getCartItems).post(addToCart).delete(deleteFromCart);

router.delete("/clear", clearCart);

export default router;
