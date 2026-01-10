import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// Protected routes - only ADMIN can manage categories
router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  createCategoryValidation,
  createCategory
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  updateCategoryValidation,
  updateCategory
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  deleteCategory
);

export default router;
