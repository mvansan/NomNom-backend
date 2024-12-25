import { Router } from "express";
import {
  placeOrders,
  getOrders,
  confirmOrder,
  getOrdersHistory,
  rateDish,
} from "../../controllers/order/order";

const router = Router();

router.route("/:user_id").get(getOrders);

router.route("/place").post(placeOrders);

router.route("/confirm").post(confirmOrder);

router.route("/history/:user_id").get(getOrdersHistory);

router.route("/rate").post(rateDish);

export default router;
