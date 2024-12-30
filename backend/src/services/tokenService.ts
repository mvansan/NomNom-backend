import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Hàm tạo access token
export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "15m", // Thời gian hết hạn của access token (15 phút)
  });
}

// Hàm tạo refresh token
export function generateRefreshToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" } // Thời gian hết hạn của refresh token (7 ngày)
  );
}

// Hàm làm mới access token từ refresh token
export function refreshAccessToken(refreshToken: string) {
  try {
    // Giải mã refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };

    // Tạo lại access token từ thông tin userId
    return generateAccessToken(decoded.userId);
  } catch (error) {
    return null;
  }
}

export function generateTokens(userId: string) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return { accessToken, refreshToken };
}
