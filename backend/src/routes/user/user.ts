import { Router } from "express";
import {
  refreshToken,
  loginByGoogle,
  login,
  signup,
  logout,
  getUserProfile,
  updateUserProfile,
  getUserById,
  updateUser,
} from "../../controllers/user/user";
import { authenticateToken } from "../../middleware/authMiddleware";
import multer from "multer";
import path from "path";
import { uploadFile } from "../../controllers/file/file";

const router = Router();

// Multer configuration
const upload = multer({
  dest: path.join(__dirname, "../uploads"),
  // Add any additional multer configurations here
});

router.post("/refresh_token", refreshToken);

router.route("/login/google").get(loginByGoogle);

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/logout").post(authenticateToken, logout);

router.route("/profile").get(authenticateToken, getUserProfile);
router.route("/profile").put(authenticateToken, updateUserProfile);

router.route("/info").get(authenticateToken, getUserById);
router.route("/info").put(authenticateToken, updateUser);
router.post("/files", upload.single("file"), uploadFile);
export default router;
