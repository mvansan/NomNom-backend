import { Request, Response } from "express";
import Cart from "../../models/cart/cart";

//==================================================================================
export const getCartItems = async (req: Request, res: Response) => {
  try {
    const user_id = req.query.user_id as string;
    const data = await Cart.getCartItems(user_id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { user_id, dish_id, quantity } = req.body;
    const result = await Cart.addToCart(user_id, dish_id, quantity);
    res.status(200).json({
      message: "Item added to cart successfully",
      totalDish: result,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const deleteFromCart = async (req: Request, res: Response) => {
  try {
    const { user_id, dish_id } = req.query;

    if (!user_id || !dish_id) {
      res.status(400).json({
        error: "User ID and dish ID are required",
      });
    } else {
      await Cart.deleteFromCart(user_id.toString(), dish_id.toString());
      res.status(200).json({ message: "Item deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//==================================================================================
export const clearCart = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      res.status(400).json({ error: "User ID is required" });
    } else {
      await Cart.clearCart(user_id.toString());
    }

    res.status(200).json({ message: "Cart emptied successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
