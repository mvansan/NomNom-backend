import { Request, Response } from "express";
import Favorite from "../../models/user/fav";

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dish_id } = req.body;
    await Favorite.addFavorite(userId, dish_id);
    res.status(200).json({
      success: true,
      message: "Dish added to favorites successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const favorites = await Favorite.getFavorites(parseInt(userId));
    res.status(200).json({
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { dish_id } = req.body;
    await Favorite.removeFavorite(userId, dish_id);
    res.status(200).json({
      success: true,
      message: "Dish removed from favorites successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};