import express from "express";
import {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from "../controllers/postController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  createPostValidation,
  updatePostValidation,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes - anyone can view published posts
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);

// Protected routes - only AUTHOR and ADMIN can create/edit posts
router.post(
  "/",
  authenticateToken,
  authorizeRole("AUTHOR", "ADMIN"),
  createPostValidation,
  createPost
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("AUTHOR", "ADMIN"),
  updatePostValidation,
  updatePost
);
router.patch(
  "/:id/publish",
  authenticateToken,
  authorizeRole("AUTHOR", "ADMIN"),
  publishPost
);
router.patch(
  "/:id/unpublish",
  authenticateToken,
  authorizeRole("AUTHOR", "ADMIN"),
  unpublishPost
);

// Delete - only ADMIN can delete posts
router.delete("/:id", authenticateToken, authorizeRole("ADMIN"), deletePost);

export default router;
