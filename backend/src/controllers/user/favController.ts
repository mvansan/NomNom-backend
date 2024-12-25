import { Request, Response } from "express";
import Favorite from "../../models/user/fav";

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { user_id, dish_id } = req.body;
    await Favorite.addFavorite(user_id, dish_id);
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
    const { user_id } = req.params;
    const favorites = await Favorite.getFavorites(parseInt(user_id));
    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { user_id, dish_id } = req.body;
    await Favorite.removeFavorite(user_id, dish_id);
    res.status(200).json({
      success: true,
      message: "Dish removed from favorites successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};