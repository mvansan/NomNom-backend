import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "path";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user/user";
import dishRoutes from "./routes/dishRoutes";
import dishesRoute from "./routes/dish/dish";
import cartRoute from "./routes/cart/cart";
import orderRoute from "./routes/order/order";
import favoriteRoute from "./routes/favoriteRoutes";
import {
  getDishesById,
  getFeedbackByDishId,
  updateAverageRate,
} from "./controllers/dishController";
import { upload, uploadFile } from "./controllers/file/file";
import {
  getUserById,
  updateUser,
  addToFavorite,
} from "./controllers/user/user";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Use routes
app.use("/dish", dishesRoute);

// Kết nối MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    ca: process.env.CA_CERT,
  },
});

// API kiểm tra kết nối
app.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ message: "Kết nối thành công!", result: rows });
  } catch (error) {
    res.status(500).json({ message: "Lỗi kết nối MySQL", error });
  }
});

app.use("/user", userRoute);
app.use("/dish", dishesRoute);
app.use("/cart", cartRoute);
app.use("/order", orderRoute);
app.use("/favorite", favoriteRoute);
app.use("/api/dishes", dishRoutes);
app.get("/api/dishes/:id", getDishesById);
app.post("/api/dishes/favorite", addToFavorite);
app.get("/api/dishes/feedback/:id", getFeedbackByDishId);
app.get("/api/dishes/rate/:id", updateAverageRate);

app.get("/api/user/:id", getUserById);
app.put("/api/user/:id", updateUser);

app.post("/api/files", upload.single("file"), uploadFile);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
