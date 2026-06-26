import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  getPublicProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from "../middleware/authValidation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh-token", refreshToken);
router.get("/users/:username", getPublicProfile);

// Protected routes
router.post("/logout", authenticateToken, logout);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/change-password", authenticateToken, changePasswordValidation, changePassword);

export default router;
