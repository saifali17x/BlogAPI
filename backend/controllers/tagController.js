import { prisma } from "../lib/prisma.js";
import { validationResult } from "express-validator";

// Get all tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({ tags });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: "Server error fetching tags" });
  }
};

// Get tag by slug with posts
export const getTagBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { published: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.json({ tag });
  } catch (error) {
    console.error("Get tag error:", error);
    res.status(500).json({ error: "Server error fetching tag" });
  }
};

// Create tag
export const createTag = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, slug } = req.body;

    // Check if slug or name already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { slug: slug || name.toLowerCase().replace(/\s+/g, "-") },
          { name },
        ],
      },
    });

    if (existingTag) {
      return res.status(400).json({
        error:
          existingTag.name === name
            ? "Tag name already exists"
            : "Tag slug already exists",
      });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    res.status(201).json({
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ error: "Server error creating tag" });
  }
};

// Update tag
export const updateTag = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, slug } = req.body;

    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // Check slug uniqueness if changing
    if (slug && slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });

    res.json({
      message: "Tag updated successfully",
      tag,
    });
  } catch (error) {
    console.error("Update tag error:", error);
    res.status(500).json({ error: "Server error updating tag" });
  }
};

// Delete tag (ADMIN only)
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({ error: "Server error deleting tag" });
  }
};
