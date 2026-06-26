import express from "express";
import {
  toggleBookmark,
  getUserBookmarks,
  getBookmarkStatus,
} from "../controllers/bookmarkController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All bookmark routes require authentication
router.get("/bookmarks", authenticateToken, getUserBookmarks);
router.get("/:id/bookmark", authenticateToken, getBookmarkStatus);
router.post("/:id/bookmark", authenticateToken, toggleBookmark);

export default router;
