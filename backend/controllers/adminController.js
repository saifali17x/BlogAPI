import { prisma } from "../lib/prisma.js";

// Dashboard statistics
export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
      totalLikes,
      recentPosts,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, username: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, username: true, email: true, role: true, createdAt: true },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        publishedPosts,
        draftPosts,
        totalComments,
        totalLikes,
      },
      recentPosts,
      recentUsers,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Server error fetching stats" });
  }
};

// List all users with pagination
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { posts: true, comments: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Server error fetching users" });
  }
};

// Update a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["USER", "AUTHOR", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${validRoles.join(", ")}` });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, name: true, username: true, email: true, role: true },
    });

    res.json({ message: "User role updated", user: updatedUser });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ error: "Server error updating user role" });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error deleting user" });
  }
};

// Get all posts including drafts (admin view)
export const getAllPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, published } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (published !== undefined) where.published = published === "true";

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, username: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Admin get posts error:", error);
    res.status(500).json({ error: "Server error fetching posts" });
  }
};
