import { Request, Response } from 'express';
import { Pool } from 'mysql2/promise';
import { getFilteredDishes } from '../models/dishModel';

export async function getDishes(req: Request, res: Response, db: Pool) {
  try {
    const { category, minPrice, maxPrice, minCalories, maxCalories } = req.query;

    const filters = {
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minCalories: minCalories ? parseInt(minCalories as string) : undefined,
      maxCalories: maxCalories ? parseInt(maxCalories as string) : undefined,
    };

    const dishes = await getFilteredDishes(db, filters);
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
}
