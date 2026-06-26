import { prisma } from "../lib/prisma.js";
import { validationResult } from "express-validator";

const commentAuthorSelect = {
  select: { id: true, name: true, username: true, avatar: true },
};

// Get top-level comments for a post (with nested replies)
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId), parentId: null },
      include: {
        author: commentAuthorSelect,
        replies: {
          include: {
            author: commentAuthorSelect,
            replies: {
              include: { author: commentAuthorSelect },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Server error fetching comments" });
  }
};

// Create a comment or reply
export const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, postId, parentId } = req.body;

    const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
      });
      if (!parentComment || parentComment.postId !== parseInt(postId)) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId: req.user.id,
        ...(parentId && { parentId: parseInt(parentId) }),
      },
      include: {
        author: commentAuthorSelect,
        replies: { include: { author: commentAuthorSelect } },
      },
    });

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Server error creating comment" });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;

    const existing = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existing.authorId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to edit this comment" });
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: { author: commentAuthorSelect },
    });

    res.json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Server error updating comment" });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Server error deleting comment" });
  }
};
