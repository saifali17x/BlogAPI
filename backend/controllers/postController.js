import { prisma } from "../lib/prisma.js";
import { validationResult } from "express-validator";

const WORDS_PER_MINUTE = 200;

const calcReadingTime = (content) => {
  if (!content) return 1;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const postListInclude = {
  author: { select: { id: true, name: true, username: true, avatar: true } },
  categories: true,
  tags: true,
  _count: { select: { comments: true, likes: true } },
};

// Get all posts (with filters and pagination)
export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, authorId, category, tag, search, sortBy = "createdAt" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { published: true };

    if (authorId) where.authorId = parseInt(authorId);

    if (category) {
      where.categories = { some: { slug: category } };
    }

    if (tag) {
      where.tags = { some: { slug: tag } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sortBy === "popular"
        ? { viewCount: "desc" }
        : sortBy === "liked"
        ? { likes: { _count: "desc" } }
        : { createdAt: "desc" };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: postListInclude,
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
    console.error("Get posts error:", error);
    res.status(500).json({ error: "Server error fetching posts" });
  }
};

// Get single post by slug
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, username: true, bio: true, avatar: true } },
        categories: true,
        tags: true,
        _count: { select: { comments: true, likes: true } },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, username: true, avatar: true } },
            replies: {
              include: {
                author: { select: { id: true, name: true, username: true, avatar: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Non-blocking view count increment
    prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    res.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Server error fetching post" });
  }
};

// Get related posts by shared tags/categories
export const getRelatedPosts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 4 } = req.query;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: { tags: { select: { id: true } }, categories: { select: { id: true } } },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const tagIds = post.tags.map((t) => t.id);
    const categoryIds = post.categories.map((c) => c.id);

    const related = await prisma.post.findMany({
      where: {
        published: true,
        id: { not: post.id },
        OR: [
          ...(tagIds.length ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
          ...(categoryIds.length ? [{ categories: { some: { id: { in: categoryIds } } } }] : []),
        ],
      },
      take: parseInt(limit),
      orderBy: { publishedAt: "desc" },
      include: postListInclude,
    });

    res.json({ posts: related });
  } catch (error) {
    console.error("Get related posts error:", error);
    res.status(500).json({ error: "Server error fetching related posts" });
  }
};

// Get author's draft posts
export const getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, published } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { authorId: req.user.id };
    if (published !== undefined) where.published = published === "true";

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: "desc" },
        include: postListInclude,
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
    console.error("Get my posts error:", error);
    res.status(500).json({ error: "Server error fetching your posts" });
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, slug, excerpt, content, coverImage, categories, tags } = req.body;

    const finalSlug = slug || slugify(title);

    const existingPost = await prisma.post.findUnique({ where: { slug: finalSlug } });
    if (existingPost) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        coverImage,
        readingTime: calcReadingTime(content),
        authorId: req.user.id,
        categories: categories ? { connect: categories.map((id) => ({ id: parseInt(id) })) } : undefined,
        tags: tags ? { connect: tags.map((id) => ({ id: parseInt(id) })) } : undefined,
      },
      include: postListInclude,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Server error creating post" });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, slug, excerpt, content, coverImage, categories, tags } = req.body;

    const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to edit this post" });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.post.findUnique({ where: { slug } });
      if (slugExists) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content, readingTime: calcReadingTime(content) }),
        ...(coverImage !== undefined && { coverImage }),
        ...(categories && { categories: { set: [], connect: categories.map((id) => ({ id: parseInt(id) })) } }),
        ...(tags && { tags: { set: [], connect: tags.map((id) => ({ id: parseInt(id) })) } }),
      },
      include: postListInclude,
    });

    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Server error updating post" });
  }
};

// Publish post
export const publishPost = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: "Post not found" });

    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { published: true, publishedAt: new Date() },
    });

    res.json({ message: "Post published successfully", post });
  } catch (error) {
    console.error("Publish post error:", error);
    res.status(500).json({ error: "Server error publishing post" });
  }
};

// Unpublish post
export const unpublishPost = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: "Post not found" });

    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { published: false },
    });

    res.json({ message: "Post unpublished successfully", post });
  } catch (error) {
    console.error("Unpublish post error:", error);
    res.status(500).json({ error: "Server error unpublishing post" });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: "Post not found" });

    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await prisma.post.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Server error deleting post" });
  }
};
