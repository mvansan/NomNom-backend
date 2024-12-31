import { Request, Response } from "express";
import axios from "axios"; // For making HTTP requests to Google
import db from "../../config/db";
import User from "../../models/user/user";
import {
  refreshAccessToken,
  generateTokens,
} from "../../services/tokenService";
import { CustomRequest } from "../../middleware/authMiddleware";
import dotenv from "dotenv";

dotenv.config();
//==================================================================================
export const getUserById = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.userId; // Lấy userId từ req.userId (được xác thực trong middleware)

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID không có trong token.",
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

    const [result] = await db.query(query, [userId]);

    const users = result as any[];
    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với ID này.",
      });
      return;
    }

    // Lọc bỏ thông tin nhạy cảm nếu cần
    const user = users[0];
    delete user.password; // Loại bỏ password nếu không cần thiết

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
  req: CustomRequest, // Sử dụng CustomRequest với userId
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId; // Lấy userId từ token

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "Không có userId trong token.",
      });
      return;
    }

    const { username, password, email, address, phone } = req.body;

    // Kiểm tra nếu ít nhất một trường cần cập nhật tồn tại
    if (!username && !password && !email && !address && !phone) {
      res.status(400).json({
        success: false,
        message: "Cần ít nhất một trường để cập nhật.",
      });
      return;
    }

    // Tạo câu lệnh SQL cập nhật động
    let updateQuery = "UPDATE Users SET ";
    const updateValues = [];
    const updates = [];

    // Thêm các trường cần cập nhật vào câu lệnh SQL
    if (username) {
      updates.push("username = ?");
      updateValues.push(username);
    }
    // if (password) {
    //   updates.push("password = ?");
    //   updateValues.push(password);
    // }
    if (email) {
      updates.push("email = ?");
      updateValues.push(email);
    }
    if (address) {
      updates.push("address = ?");
      updateValues.push(address);
    }
    if (phone) {
      updates.push("phone = ?");
      updateValues.push(phone);
    }

    updateQuery += updates.join(", ");
    updateQuery += " WHERE user_id = ?";
    updateValues.push(userId); // Dùng userId từ token để cập nhật

    // Thực thi câu lệnh SQL cập nhật
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
      httpOnly: true,
      secure: true, // Yêu cầu HTTPS (hoạt động trên BE đã deploy)
      sameSite: "none", // Cho phép cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
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
