import { Request, Response } from "express";
import Order from "../../models/order/order";
import Cart from "../../models/cart/cart";

//==================================================================================
export const placeOrders = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { dish_ids } = req.body;

    const orderPromises = dish_ids.map(async (dish_id: number) => {
      await Order.placeOrder(userId, dish_id);
    });
    await Promise.all(orderPromises);
    await Cart.clearCart(userId.toString());
    res.status(200).json({ message: "All orders placed successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const getOrders = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const orders = await Order.getOrders(parseInt(userId));
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

//==================================================================================
export const getOrdersHistory = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const orders = await Order.getOrdersHistory(parseInt(userId));
    res.status(200).json({
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const rateDish = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { order_id, dish_id, rating, comment } = req.body;
    await Order.rateDish(userId, order_id, dish_id, rating, comment);
    res.status(200).json({
      success: true,
      message: "Dish rated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
