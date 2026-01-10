import express from "express";
import {
  getAllTags,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  createTagValidation,
  updateTagValidation,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllTags);
router.get("/:slug", getTagBySlug);

// Protected routes - AUTHOR and ADMIN can manage tags
router.post(
  "/",
  authenticateToken,
  authorizeRole("AUTHOR", "ADMIN"),
  createTagValidation,
  createTag
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("AUTHOR", "ADMIN"),
  updateTagValidation,
  updateTag
);
router.delete("/:id", authenticateToken, authorizeRole("ADMIN"), deleteTag);

export default router;
