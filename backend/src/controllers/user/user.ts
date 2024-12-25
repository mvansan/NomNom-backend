import { Request, Response } from "express";
import db from "../../config/db";

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Thiếu tham số id.",
      });
      return;
    }

    const query = `
      SELECT 
        Users.user_id, 
        Users.username, 
        Users.password,
        Users.email, 
        Users.image, 
        Users.avatar, 
        Users.address, 
        Users.phone
      FROM Users 
      WHERE Users.user_id = ?
    `;
    const [result] = await db.query(query, [id]);

    const users = result as any[];

    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với ID này.",
      });
      return;
    }

    // Lọc bỏ thông tin nhạy cảm (nếu cần)
    const user = users[0];
    delete user.password; // Loại bỏ trường password khỏi phản hồi nếu không cần

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user by id:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin người dùng.",
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Thiếu tham số id.",
      });
      return;
    }

    if (!username && !email) {
      res.status(400).json({
        success: false,
        message: "Cần ít nhất một trường để cập nhật.",
      });
      return;
    }

    let updateQuery = "UPDATE Users SET ";
    const updateValues = [];
    const updates = [];

    if (username) {
      updates.push("username = ?");
      updateValues.push(username);
    }
    if (email) {
      updates.push("email = ?");
      updateValues.push(email);
    }

    updateQuery += updates.join(", ");
    updateQuery += " WHERE user_id = ?";
    updateValues.push(id);

    const [result] = await db.query(updateQuery, updateValues);

    if ((result as any).affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với ID này.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công.",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật thông tin người dùng.",
    });
  }
};
