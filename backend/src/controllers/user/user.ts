import { Request, Response } from "express";
import db from "../../config/db";
import axios from "axios"; // For making HTTP requests to Google
import User from "../../models/user/user";
import jwt from "jsonwebtoken";

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
    console.error("Error during Google login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const result = await User.login(email, password);

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    // Save token to cookie for subsequent requests
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Login successful",
      token: result.token,
    });
  } catch (error) {
    console.error("Error during login:", error);
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

    res.status(200).json({
      message: "User registered successfully",
      user: result,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//==================================================================================
export const logout = (req: Request, res: Response) => {
  try {
    const token =
      req.cookies.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "User not logged in" });
      return;
    }

    // Clear token from cookie
    res.clearCookie("token");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
