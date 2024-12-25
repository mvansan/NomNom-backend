import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response } from "express";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../../uploads");

    // Kiểm tra nếu thư mục không tồn tại, tạo mới
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });

export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Vui lòng chọn file để tải lên",
      });
      return;
    }

    const fileUrl = `${
      process.env.BASE_URL || "http://localhost:5000"
    }/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Tải file lên thành công",
      data: {
        filename: req.file.filename,
        path: req.file.path,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải file lên",
    });
  }
};
