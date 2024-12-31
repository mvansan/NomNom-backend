import { Router } from "express";
import {
  refreshToken,
  loginByGoogle,
  login,
  signup,
  logout,
  getUserProfile,
  getUserById,
  updateUser,
} from "../../controllers/user/user";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.post("/refresh_token", refreshToken);

router.route("/login/google").get(loginByGoogle);

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/logout").post(authenticateToken, logout);

router.route("/profile").get(authenticateToken, getUserProfile);

router.route("/info").get(authenticateToken, getUserById);

router.route("/info").put(authenticateToken, updateUser);

export default router;
