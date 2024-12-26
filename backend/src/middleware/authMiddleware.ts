import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Tạo interface tùy chỉnh cho req
interface CustomRequest extends Request {
  userId?: number;
}

// Middleware để xác thực token
export function authenticateToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void {
  // Lấy token từ cookie hoặc header Authorization
  const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access Denied" });
    return;
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { userId: number };
    req.userId = decoded.userId; // Lưu userId vào req
    next(); // Tiếp tục xử lý request
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
