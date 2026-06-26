import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import categoryRoutes from "./routes/categories.js";
import tagRoutes from "./routes/tags.js";
import likeRoutes from "./routes/likes.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import adminRoutes from "./routes/admin.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(apiLimiter);

app.get("/", (_req, res) => {
  res.json({ message: "BlogAPI is running!" });
});

app.use("/auth", authLimiter, authRoutes);
// Like and bookmark routes must come before postRoutes to avoid /:slug catching "bookmarks"/"likes"
app.use("/posts", likeRoutes);
app.use("/posts", bookmarkRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/categories", categoryRoutes);
app.use("/tags", tagRoutes);
app.use("/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
