import { Request, Response } from "express";
import axios from "axios"; // For making HTTP requests to Google
import db from "../../config/db";
import User from "../../models/user/user";
import {
  refreshAccessToken,
  generateTokens,
} from "../../services/tokenService";
import dotenv from "dotenv";

dotenv.config();
//==================================================================================
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
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin người dùng.",
    });
  }
};

//==================================================================================
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
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật thông tin người dùng.",
    });
  }
};

//==================================================================================
export const loginByGoogle = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.query;

    const googleResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { email, name, picture } = googleResponse.data;

    // Gọi phương thức trong model để xử lý đăng nhập bằng Google
    const result = await User.loginByGoogle(email, name, picture);

    res.status(200).json({
      name: result.user.username,
      email: result.user.email,
      picture: result.user.picture,
      token: result.token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const result = await User.login(email, password);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(result.user.id);

    // Lưu Refresh Token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Cookie chỉ có thể truy cập từ phía server
      secure: process.env.NODE_ENV === "production", // Chỉ gửi cookie qua HTTPS khi ở production
      // secure: false,
      sameSite: "strict", // Không cho phép cookie qua cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie tồn tại 7 ngày
    });

    res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      res
        .status(400)
        .json({ error: "email, username and password are required" });
      return;
    }

    // Call signup method from User model and receive result
    const result = await User.signup(email, username, password);

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const getUserProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.getUserProfile(userId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const refreshToken = (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token is required" });
      return;
    }

    // Giải mã và xác thực refresh token, sau đó tạo mới access token
    const newAccessToken = refreshAccessToken(refreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const addToFavorite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id, dish_id } = req.body;

    // Validate required fields
    if (!user_id || !dish_id) {
      res.status(400).json({
        success: false,
        message: "user_id và dish_id là bắt buộc.",
      });
      return;
    }

    // Check if favorite already exists
    const checkQuery = `
      SELECT * FROM Favorite_dish 
      WHERE user_id = ? AND dish_id = ?
    `;
    const [existing] = await db.query(checkQuery, [user_id, dish_id]);
    const favorites = existing as any[];

    if (favorites.length > 0) {
      // Update existing favorite
      const updateQuery = `
        UPDATE Favorite_dish 
        SET is_favorite = ? 
        WHERE user_id = ? AND dish_id = ?
      `;
      await db.query(updateQuery, [
        !favorites[0].is_favorite,
        user_id,
        dish_id,
      ]);

      res.status(200).json({
        success: true,
        message: favorites[0].is_favorite
          ? "Đã xóa khỏi yêu thích"
          : "Đã thêm vào yêu thích",
      });
    } else {
      // Insert new favorite
      const insertQuery = `
        INSERT INTO Favorite_dish (user_id, dish_id, is_favorite) 
        VALUES (?, ?, true)
      `;
      await db.query(insertQuery, [user_id, dish_id]);

      res.status(201).json({
        success: true,
        message: "Đã thêm vào yêu thích",
      });
    }
  } catch (error) {
    console.error("Error managing favorite:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thêm/xóa yêu thích.",
    });
  }
};
