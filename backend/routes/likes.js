import express from "express";
import { toggleLike, getLikeStatus } from "../controllers/likeController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:id/likes", optionalAuth, getLikeStatus);
router.post("/:id/like", authenticateToken, toggleLike);

export default router;
