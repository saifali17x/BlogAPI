import { prisma } from "../lib/prisma.js";

// Toggle like on a post (like if not liked, unlike if already liked)
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId: req.user.id, postId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      const likeCount = await prisma.like.count({ where: { postId } });
      return res.json({ liked: false, likeCount });
    }

    await prisma.like.create({ data: { userId: req.user.id, postId } });
    const likeCount = await prisma.like.count({ where: { postId } });

    res.status(201).json({ liked: true, likeCount });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ error: "Server error toggling like" });
  }
};

// Get like count and whether the current user liked the post
export const getLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const [likeCount, userLike] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      req.user
        ? prisma.like.findUnique({
            where: { userId_postId: { userId: req.user.id, postId } },
          })
        : null,
    ]);

    res.json({ likeCount, liked: !!userLike });
  } catch (error) {
    console.error("Get like status error:", error);
    res.status(500).json({ error: "Server error fetching likes" });
  }
};
