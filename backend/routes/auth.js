import express from "express";
import {
  register,
  login,
  getProfile,
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

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  changePassword
);

export default router;
