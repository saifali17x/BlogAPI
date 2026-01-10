import { body } from "express-validator";

// Post validation
export const createPostValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Slug must be between 3 and 200 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Excerpt must not exceed 500 characters"),
  body("content").optional().trim(),
  body("coverImage")
    .optional()
    .trim()
    .isURL()
    .withMessage("Cover image must be a valid URL"),
  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

export const updatePostValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Slug must be between 3 and 200 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Excerpt must not exceed 500 characters"),
  body("content").optional().trim(),
  body("coverImage")
    .optional()
    .trim()
    .isURL()
    .withMessage("Cover image must be a valid URL"),
  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

// Comment validation
export const createCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),
  body("postId")
    .notEmpty()
    .withMessage("Post ID is required")
    .isInt({ min: 1 })
    .withMessage("Post ID must be a valid integer"),
];

export const updateCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),
];

// Category validation
export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug must be between 2 and 100 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

export const updateCategoryValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug must be between 2 and 100 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

// Tag validation
export const createTagValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tag name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Tag name must be between 2 and 50 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Slug must be between 2 and 50 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
];

export const updateTagValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Tag name must be between 2 and 50 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Slug must be between 2 and 50 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
];
