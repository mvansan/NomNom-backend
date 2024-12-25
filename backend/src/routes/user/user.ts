import { Router } from "express";
import {
  loginByGoogle,
  login,
  signup,
  logout,
} from "../../controllers/user/user";

const router = Router();

// Đăng nhập qua Google
router.route("/login/google").get(loginByGoogle);

// Đăng nhập bình thường (email và mật khẩu)
router.route("/login").post(login);

// Đăng ký tài khoản mới
router.route("/signup").post(signup);

// Đăng xuất
router.route("/logout").delete(logout);

export default router;
