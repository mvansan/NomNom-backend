import { Request, Response } from "express";
import axios from "axios"; // For making HTTP requests to Google
import db from "../../config/db";
import User from "../../models/user/user";
import jwt from "jsonwebtoken";

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
