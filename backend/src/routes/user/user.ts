import { Router } from "express";
import {
  loginByGoogle,
  login,
  signup,
  logout,
  getUserProfile,
} from "../../controllers/user/user";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.route("/login/google").get(loginByGoogle);

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/logout").delete(authenticateToken, logout);

router.get("/profile", authenticateToken, getUserProfile);

export default router;
