import { Request, Response } from "express";
import Dish from "../../models/dish/dish";

export const getDishes = async (req: Request, res: Response) => {
  try {
    const { category_ids, minPrice, maxPrice, minCalo, maxCalo } = req.body;

    const data = await Dish.getDishes(
      category_ids,
      minPrice,
      maxPrice,
      minCalo,
      maxCalo
    );
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};