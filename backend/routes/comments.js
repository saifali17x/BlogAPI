import express from "express";
import {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  createCommentValidation,
  updateCommentValidation,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/post/:postId", getCommentsByPost);

// Protected routes - any authenticated user can comment
router.post("/", authenticateToken, createCommentValidation, createComment);
router.put("/:id", authenticateToken, updateCommentValidation, updateComment);

// Delete - user can delete their own, or ADMIN can delete any
router.delete("/:id", authenticateToken, deleteComment);

export default router;
