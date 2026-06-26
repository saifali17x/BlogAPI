import express from "express";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from "../controllers/postController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { createPostValidation, updatePostValidation } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:slug/related", getRelatedPosts);
router.get("/:slug", getPostBySlug);

// Any authenticated user can create and manage their own posts
router.get("/me/drafts", authenticateToken, getMyPosts);
router.post("/", authenticateToken, createPostValidation, createPost);
router.put("/:id", authenticateToken, updatePostValidation, updatePost);
router.patch("/:id/publish", authenticateToken, publishPost);
router.patch("/:id/unpublish", authenticateToken, unpublishPost);
router.delete("/:id", authenticateToken, deletePost);

export default router;
