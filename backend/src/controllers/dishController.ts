import { Request, Response } from 'express';
import db from '../config/db';
import { Dish } from '../models/dish'; 

export const searchDishes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Tên món ăn (q) là bắt buộc và phải là chuỗi.',
      });
      return;
    }

    const query = `
      SELECT Dishes.dish_name, Dishes.price, Dishes.average_rating, 
             Dishes.calories, Dishes.img_url, Category.category 
      FROM Dishes 
      INNER JOIN Category ON Dishes.category_id = Category.id
      WHERE Dishes.dish_name LIKE ?
    `;
    const [results] = await db.execute(query, [`%${q}%`]);

    const dishes: Dish[] = results as Dish[];

    if (dishes.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn nào với từ khóa bạn nhập.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    console.error('Error searching dishes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tìm kiếm món ăn.',
    });
  }
};