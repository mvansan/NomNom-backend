import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import dishRoutes from "./routes/dishRoutes";
import dishesRoute from "./routes/dish/dish";
import cartRoute from "./routes/cart/cart";
import orderRoute from "./routes/order/order";
import {
  getDishesById,
  getFeedbackByDishId,
  updateAverageRate,
} from "./controllers/dishController";

dotenv.config();

const app = express();

// Middleware
app.use(cors());

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

app.use("/dish", dishesRoute);
app.use("/cart", cartRoute);
app.use("/order", orderRoute);
app.use("/api/dishes", dishRoutes);
app.get("/api/dishes/:id", getDishesById);
app.get("/api/dishes/feedback/:id", getFeedbackByDishId);
app.get("/api/dishes/rate/:id", updateAverageRate);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
