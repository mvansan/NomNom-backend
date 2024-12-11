import { Request, Response } from "express";
import Order from "../../models/order/order";
import Cart from "../../models/cart/cart";

//==================================================================================
export const placeOrders = async (req: Request, res: Response) => {
  try {
    const { user_id, dish_ids } = req.body;

    const orderPromises = dish_ids.map(async (dish_id: number) => {
      await Order.placeOrder(user_id, dish_id);
    });
    await Promise.all(orderPromises);
    await Cart.clearCart(user_id.toString());
    res.status(200).json({ message: "All orders placed successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.getOrders(parseInt(user_id));
    res.status(200).json({
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { order_ids } = req.body;
    const confirmPromises = order_ids.map(async (dish_id: number) => {
      await Order.confirmOrder(dish_id);
    });
    await Promise.all(confirmPromises);
    res.status(200).json({ message: "All orders confirmed successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
