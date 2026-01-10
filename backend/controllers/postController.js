import { prisma } from "../lib/prisma.js";
import { validationResult } from "express-validator";

// Get all posts (with filters and pagination)
export const getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      published,
      authorId,
      category,
      tag,
      search,
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    // Filter by published status (public only sees published)
    if (published !== undefined) {
      where.published = published === "true";
    } else {
      // Default: only show published posts to non-authenticated users
      where.published = true;
    }

    // Filter by author
    if (authorId) {
      where.authorId = parseInt(authorId);
    }

    // Filter by category
    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      };
    }

    // Filter by tag
    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    // Search in title and content
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          categories: true,
          tags: true,
          _count: {
            select: {
              comments: true,
            },
          },
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
        pages: Math.ceil(total / limit),
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
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            avatar: true,
          },
        },
        categories: true,
        tags: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Server error fetching post" });
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, slug, excerpt, content, coverImage, categories, tags } =
      req.body;

    // Check if slug already exists
    if (slug) {
      const existingPost = await prisma.post.findUnique({
        where: { slug },
      });

      if (existingPost) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    // Create post with relations
    const post = await prisma.post.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
        excerpt,
        content,
        coverImage,
        authorId: req.user.id,
        categories: categories
          ? {
              connect: categories.map((id) => ({ id: parseInt(id) })),
            }
          : undefined,
        tags: tags
          ? {
              connect: tags.map((id) => ({ id: parseInt(id) })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Server error creating post" });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, slug, excerpt, content, coverImage, categories, tags } =
      req.body;

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only the author or ADMIN can edit
    if (existingPost.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this post" });
    }

    // Check slug uniqueness if changing
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(coverImage !== undefined && { coverImage }),
        ...(categories && {
          categories: {
            set: [],
            connect: categories.map((id) => ({ id: parseInt(id) })),
          },
        }),
        ...(tags && {
          tags: {
            set: [],
            connect: tags.map((id) => ({ id: parseInt(id) })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Server error updating post" });
  }
};

// Publish post
export const publishPost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });

    res.json({
      message: "Post published successfully",
      post,
    });
  } catch (error) {
    console.error("Publish post error:", error);
    res.status(500).json({ error: "Server error publishing post" });
  }
};

// Unpublish post
export const unpublishPost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        published: false,
      },
    });

    res.json({
      message: "Post unpublished successfully",
      post,
    });
  } catch (error) {
    console.error("Unpublish post error:", error);
    res.status(500).json({ error: "Server error unpublishing post" });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only ADMIN can delete (enforced by route middleware)
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Server error deleting post" });
  }
};
