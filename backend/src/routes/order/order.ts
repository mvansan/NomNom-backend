import { Router } from "express";
import {
  placeOrders,
  getOrders,
  confirmOrder,
  getOrdersHistory,
  rateDish,
} from "../../controllers/order/order";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.route("/").get(authenticateToken, getOrders);
router.route("/place").post(authenticateToken, placeOrders);
router.route("/confirm").post(authenticateToken, confirmOrder);
router.route("/history/:user_id").get(authenticateToken, getOrdersHistory);
router.route("/rate").post(authenticateToken, rateDish);

export default router;
