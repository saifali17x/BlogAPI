import express from "express";
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllPostsAdmin,
} from "../controllers/adminController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticateToken, authorizeRole("ADMIN"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/posts", getAllPostsAdmin);

export default router;
