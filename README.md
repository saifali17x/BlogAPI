# Blog API Documentation

## Overview

This is a full-featured blog API with role-based authentication and authorization. It supports three user roles with different permission levels:

- **USER** - Can read posts, create comments, and manage their own profile
- **AUTHOR** - Can create and manage posts, plus all USER permissions
- **ADMIN** - Full system access, can manage all content and users

## Authentication

All protected routes require a JWT token sent in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint                | Auth     | Description                        |
| ------ | ----------------------- | -------- | ---------------------------------- |
| POST   | `/auth/register`        | Public   | Register a new user                |
| POST   | `/auth/login`           | Public   | Login and get JWT token            |
| GET    | `/auth/profile`         | Required | Get current user profile           |
| PUT    | `/auth/profile`         | Required | Update profile (name, bio, avatar) |
| POST   | `/auth/change-password` | Required | Change password                    |

### Post Routes (`/posts`)

| Method | Endpoint               | Auth     | Roles         | Description                            |
| ------ | ---------------------- | -------- | ------------- | -------------------------------------- |
| GET    | `/posts`               | Public   | -             | Get all published posts (with filters) |
| GET    | `/posts/:slug`         | Public   | -             | Get single post by slug                |
| POST   | `/posts`               | Required | AUTHOR, ADMIN | Create new post                        |
| PUT    | `/posts/:id`           | Required | AUTHOR, ADMIN | Update post (own or any for ADMIN)     |
| PATCH  | `/posts/:id/publish`   | Required | AUTHOR, ADMIN | Publish a post                         |
| PATCH  | `/posts/:id/unpublish` | Required | AUTHOR, ADMIN | Unpublish a post                       |
| DELETE | `/posts/:id`           | Required | ADMIN         | Delete post                            |

**Query Parameters for GET /posts:**

- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 10)
- `published` - Filter by published status (true/false)
- `authorId` - Filter by author ID
- `category` - Filter by category slug
- `tag` - Filter by tag slug
- `search` - Search in title, content, excerpt

### Comment Routes (`/comments`)

| Method | Endpoint                 | Auth     | Roles     | Description                           |
| ------ | ------------------------ | -------- | --------- | ------------------------------------- |
| GET    | `/comments/post/:postId` | Public   | -         | Get all comments for a post           |
| POST   | `/comments`              | Required | All       | Create a comment                      |
| PUT    | `/comments/:id`          | Required | All       | Update own comment                    |
| DELETE | `/comments/:id`          | Required | All/ADMIN | Delete own comment (or any for ADMIN) |

### Category Routes (`/categories`)

| Method | Endpoint            | Auth     | Roles | Description                         |
| ------ | ------------------- | -------- | ----- | ----------------------------------- |
| GET    | `/categories`       | Public   | -     | Get all categories with post counts |
| GET    | `/categories/:slug` | Public   | -     | Get category with all posts         |
| POST   | `/categories`       | Required | ADMIN | Create new category                 |
| PUT    | `/categories/:id`   | Required | ADMIN | Update category                     |
| DELETE | `/categories/:id`   | Required | ADMIN | Delete category                     |

### Tag Routes (`/tags`)

| Method | Endpoint      | Auth     | Roles         | Description                   |
| ------ | ------------- | -------- | ------------- | ----------------------------- |
| GET    | `/tags`       | Public   | -             | Get all tags with post counts |
| GET    | `/tags/:slug` | Public   | -             | Get tag with all posts        |
| POST   | `/tags`       | Required | AUTHOR, ADMIN | Create new tag                |
| PUT    | `/tags/:id`   | Required | AUTHOR, ADMIN | Update tag                    |
| DELETE | `/tags/:id`   | Required | ADMIN         | Delete tag                    |

## Request/Response Examples

### Register a New User

**Request:**

```json
POST /auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "role": "USER",
    "createdAt": "2026-01-10T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create a Post

**Request:**

```json
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Getting Started with Node.js",
  "slug": "getting-started-nodejs",
  "excerpt": "A beginner's guide to Node.js",
  "content": "Full post content here...",
  "coverImage": "https://example.com/image.jpg",
  "categories": [1, 2],
  "tags": [1, 3, 5]
}
```

**Response:**

```json
{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "title": "Getting Started with Node.js",
    "slug": "getting-started-nodejs",
    "excerpt": "A beginner's guide to Node.js",
    "content": "Full post content here...",
    "coverImage": "https://example.com/image.jpg",
    "published": false,
    "viewCount": 0,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "author": {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "avatar": null
    },
    "categories": [...],
    "tags": [...]
  }
}
```

### Create a Comment

**Request:**

```json
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great article! Very helpful.",
  "postId": 1
}
```

**Response:**

```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": 1,
    "content": "Great article! Very helpful.",
    "postId": 1,
    "authorId": 1,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "author": {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "avatar": null
    }
  }
}
```

## Role-Based Authorization Summary

### Public Access (No Auth Required)

- View all published posts
- View individual post with comments
- View categories and tags
- View posts by category or tag

### USER Role

- All public access
- Create, edit, delete own comments
- View and update own profile
- Change own password

### AUTHOR Role

- All USER permissions
- Create posts (initially unpublished)
- Edit and delete own posts
- Publish/unpublish own posts
- Create and edit tags

### ADMIN Role

- All system access
- Edit any post
- Delete any post or comment
- Manage categories (create, edit, delete)
- Delete tags
- Full user management

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized

```json
{
  "error": "Access token required"
}
```

### 403 Forbidden

```json
{
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Server error message"
}
```

## Setup Instructions

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blogdb"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Start the server:

```bash
npm start
```

## Testing the API

You can test the API using tools like:

- **Postman** - Import the endpoints and test manually
- **Thunder Client** (VS Code extension) - Test directly in VS Code
- **cURL** - Command line testing

Example cURL request:

```bash
# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get posts (with token)
curl -X GET http://localhost:3000/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Schema

The API uses PostgreSQL with Prisma ORM. Main models:

- **User** - User accounts with role-based access
- **Post** - Blog posts with rich content
- **Comment** - User comments on posts
- **Category** - Post categories (many-to-many)
- **Tag** - Post tags (many-to-many)

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication (7-day expiration)
- Role-based authorization middleware
- Input validation with express-validator
- Protected routes with authentication checks
- Owner-based permissions for user content
