import { Request, Response } from "express";
import db from "../config/db";
import { Dish } from "../models/dish";

export const searchDishes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({
        success: false,
        message: "Tên món ăn (q) là bắt buộc và phải là chuỗi.",
      });
      return;
    }

    const query = `
      SELECT 
        Dishes.id, 
        Dishes.dish_name, 
        Dishes.price, 
        Dishes.average_rating, 
        Dishes.calories, 
        Dishes.img_url, 
        Category.id AS category_id,
        Restaurants.distance,
        Restaurants.res_address,
        Feedback.rating,
        Feedback.comment
      FROM Dishes 
      INNER JOIN Category ON Dishes.category_id = Category.id
      INNER JOIN Restaurants ON Dishes.restaurant_id = Restaurants.id
      LEFT JOIN Feedback ON Dishes.id = Feedback.dish_id
      WHERE Dishes.dish_name LIKE ?
    `;
    const [results] = await db.execute(query, [`%${q}%`]);

    const dishes: Dish[] = results as Dish[];

    if (dishes.length === 0) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn nào với từ khóa bạn nhập.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    console.error("Error searching dishes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tìm kiếm món ăn.",
    });
  }
};

export const getAllDishes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = `
      SELECT 
        Dishes.id, 
        Dishes.dish_name, 
        Dishes.price, 
        Dishes.average_rating, 
        Dishes.calories, 
        Dishes.img_url, 
        Category.id AS category_id,
        Restaurants.distance,
        Restaurants.res_address,
        Feedback.rating,
        Feedback.comment 
      FROM Dishes 
      INNER JOIN Category ON Dishes.category_id = Category.id
      INNER JOIN Restaurants ON Dishes.restaurant_id = Restaurants.id
      LEFT JOIN Feedback ON Dishes.id = Feedback.dish_id
      ORDER BY Dishes.average_rating DESC, Restaurants.distance ASC
    `;
    const [result] = await db.query(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting all dishes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách món ăn.",
    });
  }
};

// Chi tiết món ăn theo id
export const getDishesById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // Lấy id từ params

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Thiếu tham số id.",
      });
      return;
    }

    const query = `
      SELECT 
        Dishes.id, 
        Dishes.dish_name, 
        Dishes.price, 
        Dishes.calories, 
        Dishes.img_url, 
        Dishes.desrip, 
        Category.id AS category_id,
        Restaurants.distance,
        Restaurants.res_address
      FROM Dishes 
      INNER JOIN Category ON Dishes.category_id = Category.id
      INNER JOIN Restaurants ON Dishes.restaurant_id = Restaurants.id
      WHERE Dishes.id = ? -- Lọc theo id
      ORDER BY Dishes.average_rating DESC, Restaurants.distance ASC
    `;

    const [result] = await db.query(query, [id]); // Thêm giá trị id vào query

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting dish by id:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin món ăn.",
    });
  }
};

//Lấy danh sách đánh giá món ăn - feedback theo id món ăn và username
export const getFeedbackByDishId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // Lấy id từ params

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Thiếu tham số id.",
      });
      return;
    }

    const query = `
      SELECT 
        Feedback.id, 
        Feedback.rating, 
        Users.username AS username, 
        Feedback.comment
      FROM Feedback 
      INNER JOIN Users ON Feedback.user_id = Users.user_id
      WHERE Feedback.dish_id = ? -- Lọc theo id
    `;

    const [result] = await db.query(query, [id]); // Thêm giá trị id vào query

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting feedback by dish id:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin đánh giá món ăn.",
    });
  }
};

// Tính rate trung bình theo feedback của user
export const updateAverageRate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // Lấy id từ params

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Thiếu tham số id.",
      });
      return;
    }

    // Tính toán lại average_rating cho món ăn
    const averageRatingQuery = `
      SELECT 
        AVG(rating) AS average_rating
      FROM Feedback
      WHERE dish_id = ?
    `;
    const [averageRatingResult]: any = await db.query(averageRatingQuery, [id]);
    const averageRating = averageRatingResult[0].average_rating;

    // Cập nhật average_rating trong bảng Dish
    const updateDishQuery = `
      UPDATE Dishes
      SET average_rating = ?
      WHERE id = ?
    `;
    await db.query(updateDishQuery, [averageRating, id]);

    res.status(200).json({
      success: true,
      message: "average_rating đã được cập nhật.",
      average_rating: averageRating,
    });
  } catch (error) {
    console.error("Error updating average rating:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật average_rating.",
    });
  }
};
