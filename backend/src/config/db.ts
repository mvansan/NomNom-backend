import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Tạo kết nối với MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "test",
  ssl: {
    rejectUnauthorized: false, // Bỏ qua việc xác minh chứng chỉ SSL tự ký
    // ca: process.env.CA_CERT,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
