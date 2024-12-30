import { Request, Response } from "express";
import Cart from "../../models/cart/cart";

//==================================================================================
export const getCartItems = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const data = await Cart.getCartItems(userId);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const addToCart = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { dish_id, quantity } = req.body;
    const result = await Cart.addToCart(userId, dish_id, quantity);
    res.status(200).json({
      message: "Item added to cart successfully",
      totalDish: result,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const deleteFromCart = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { dish_id } = req.query;

    if (!dish_id) {
      res.status(400).json({
        error: "User ID and dish ID are required",
      });
    } else {
      await Cart.deleteFromCart(userId.toString(), dish_id.toString());
      res.status(200).json({ message: "Item deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
