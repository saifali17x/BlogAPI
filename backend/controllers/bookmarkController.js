import { prisma } from "../lib/prisma.js";

// Toggle bookmark on a post
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: req.user.id, postId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.json({ bookmarked: false });
    }

    await prisma.bookmark.create({ data: { userId: req.user.id, postId } });
    res.status(201).json({ bookmarked: true });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({ error: "Server error toggling bookmark" });
  }
};

// Get the current user's bookmarked posts
export const getUserBookmarks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          post: {
            include: {
              author: { select: { id: true, name: true, username: true, avatar: true } },
              categories: true,
              tags: true,
              _count: { select: { comments: true, likes: true } },
            },
          },
        },
      }),
      prisma.bookmark.count({ where: { userId: req.user.id } }),
    ]);

    res.json({
      bookmarks: bookmarks.map((b) => b.post),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ error: "Server error fetching bookmarks" });
  }
};

// Check whether the current user has bookmarked a post
export const getBookmarkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: req.user.id, postId } },
    });

    res.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error("Bookmark status error:", error);
    res.status(500).json({ error: "Server error checking bookmark" });
  }
};
