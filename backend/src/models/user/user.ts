import db from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default class User {
  //==================================================================================
  static async loginByGoogle(
    email: string,
    name: string,
    picture: string
  ): Promise<any> {
    try {
      const checkUserQuery = "SELECT * FROM Users WHERE email = ?";
      const [userRows]: [any[], any[]] = await db.execute(checkUserQuery, [
        email,
      ]);

      if (userRows.length === 0) {
        const registerUserQuery =
          "INSERT INTO Users (email, username, password) VALUES (?, ?, ?)";
        await db.execute(registerUserQuery, [email, name, "google"]);
      }

      const user =
        userRows.length > 0 ? userRows[0] : { email, username: name };
      const token = jwt.sign({ userId: user.user_id }, "your_jwt_secret", {
        expiresIn: "1h",
      });

      return {
        user: {
          id: user.user_id,
          email: user.email,
          username: user.username,
          picture,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async signup(
    email: string,
    username: string,
    password: string
  ): Promise<any> {
    try {
      // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
      const checkUserQuery =
        "SELECT COUNT(*) AS count FROM Users WHERE email = ?";
      const [rows]: [any[], any[]] = await db.execute(checkUserQuery, [email]);

      if (rows[0].count > 0) {
        return { error: "User already exists" }; // Người dùng đã tồn tại
      }

      // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Thêm người dùng mới vào cơ sở dữ liệu
      const registerUserQuery =
        "INSERT INTO Users (email, username, password) VALUES (?, ?, ?)";
      const [result]: [any[], any[]] = await db.execute(registerUserQuery, [
        email,
        username,
        hashedPassword,
      ]);

      // Truy vấn lại thông tin người dùng để lấy user_id
      const [userResult]: [any[], any[]] = await db.execute(
        "SELECT user_id FROM Users WHERE email = ?",
        [email]
      );

      // Trả về chỉ user_id
      return userResult[0].user_id;
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async login(email: string, password: string): Promise<any> {
    try {
      const checkUserQuery = "SELECT * FROM Users WHERE email = ?";
      const [rows]: [any[], any[]] = await db.execute(checkUserQuery, [email]);

      if (rows.length === 0) {
        return { error: "Email address not registered" };
      }

      const isPasswordValid = await bcrypt.compare(password, rows[0].password);
      if (!isPasswordValid) {
        return { error: "Incorrect password" };
      }

      return {
        user: {
          id: rows[0].user_id,
          email: rows[0].email,
          username: rows[0].username,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async getUserProfile(userId: string) {
    try {
      const query = `SELECT Users.username, Users.email, Users.image, Users.image, Users.avatar, Users.address, Users.phone 
          FROM Users WHERE user_id = ?`;
      const [results] = await db.query(query, [userId]);
      return results;
    } catch (error) {
      throw error;
    }
  }
}
