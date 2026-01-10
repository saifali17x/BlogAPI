import { prisma } from "../lib/prisma.js";
import { validationResult } from "express-validator";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Server error fetching categories" });
  }
};

// Get category by slug with posts
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
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

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ category });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ error: "Server error fetching category" });
  }
};

// Create category (ADMIN only)
export const createCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, slug, description } = req.body;

    // Check if slug or name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: slug || name.toLowerCase().replace(/\s+/g, "-") },
          { name },
        ],
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        error:
          existingCategory.name === name
            ? "Category name already exists"
            : "Category slug already exists",
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
      },
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Server error creating category" });
  }
};

// Update category (ADMIN only)
export const updateCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, slug, description } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check slug uniqueness if changing
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Server error updating category" });
  }
};

// Delete category (ADMIN only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Optional: Prevent deleting categories with posts
    if (existingCategory._count.posts > 0) {
      return res.status(400).json({
        error: `Cannot delete category with ${existingCategory._count.posts} posts`,
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Server error deleting category" });
  }
};
