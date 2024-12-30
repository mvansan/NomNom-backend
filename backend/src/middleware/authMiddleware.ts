import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

// Tạo interface tùy chỉnh cho req
export interface CustomRequest extends Request {
  userId?: string;
}

// Middleware để xác thực token
export function authenticateToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void {
  // Lấy token từ header Authorization
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access Denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!decoded.userId) {
      res.status(400).json({ error: "User ID not found in token" });
      return;
    }

    req.userId = decoded.userId; // Lưu userId vào req
    next(); // Tiếp tục xử lý request
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
