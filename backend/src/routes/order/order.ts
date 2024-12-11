import { Router } from "express";
import {
  placeOrders,
  getOrders,
  confirmOrder,
} from "../../controllers/order/order";

const router = Router();

router.route("/:user_id").get(getOrders);

router.route("/place").post(placeOrders);

router.route("/confirm").post(confirmOrder);

export default router;
