# BlogAPI Backend

A robust RESTful API for a blog platform built with Node.js, Express, and Prisma ORM.

## Tech Stack

- **Node.js** & **Express** - Server framework
- **Prisma ORM** - Database ORM with PostgreSQL
- **JWT** - Authentication & authorization
- **bcrypt** - Password hashing
- **express-validator** - Input validation

## Features

- **Role-Based Access Control** - Three user roles (USER, AUTHOR, ADMIN)
- **JWT Authentication** - Secure token-based auth with 7-day expiration
- **CRUD Operations** - Posts, comments, categories, and tags
- **Validation** - Comprehensive input validation on all routes
- **Pagination & Filtering** - Efficient data querying
- **Slug Generation** - SEO-friendly URLs for posts

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. (Optional) Seed the database:

```bash
node lib/script.js
```

### Running the Server

Development mode:

```bash
npm start
```

The API will be available at `http://localhost:3000`

## Database Schema

### Models

- **User** - User accounts with roles (USER, AUTHOR, ADMIN)
- **Post** - Blog posts with title, content, slug, and published status
- **Comment** - Comments on posts
- **Category** - Post categories
- **Tag** - Post tags

### Relationships

- Users can create multiple posts (AUTHOR/ADMIN)
- Users can write multiple comments
- Posts can have multiple comments, categories, and tags
- Many-to-many relationships between posts and categories/tags

## API Overview

### Authentication Routes (`/auth`)

| Method | Endpoint           | Auth     | Description       |
| ------ | ------------------ | -------- | ----------------- |
| POST   | `/register`        | Public   | Register new user |
| POST   | `/login`           | Public   | Login user        |
| GET    | `/profile`         | Required | Get user profile  |
| PUT    | `/profile`         | Required | Update profile    |
| POST   | `/change-password` | Required | Change password   |

### Post Routes (`/posts`)

| Method | Endpoint         | Auth     | Roles         | Description      |
| ------ | ---------------- | -------- | ------------- | ---------------- |
| GET    | `/`              | Public   | -             | Get all posts    |
| GET    | `/:slug`         | Public   | -             | Get post by slug |
| POST   | `/`              | Required | AUTHOR, ADMIN | Create post      |
| PUT    | `/:id`           | Required | AUTHOR, ADMIN | Update post      |
| PATCH  | `/:id/publish`   | Required | AUTHOR, ADMIN | Publish post     |
| PATCH  | `/:id/unpublish` | Required | AUTHOR, ADMIN | Unpublish post   |
| DELETE | `/:id`           | Required | ADMIN         | Delete post      |

### Comment Routes (`/comments`)

| Method | Endpoint        | Auth     | Description            |
| ------ | --------------- | -------- | ---------------------- |
| GET    | `/post/:postId` | Public   | Get post comments      |
| POST   | `/`             | Required | Create comment         |
| PUT    | `/:id`          | Required | Update own comment     |
| DELETE | `/:id`          | Required | Delete own comment/any |

### Category Routes (`/categories`)

| Method | Endpoint | Auth     | Roles | Description          |
| ------ | -------- | -------- | ----- | -------------------- |
| GET    | `/`      | Public   | -     | Get all categories   |
| GET    | `/:slug` | Public   | -     | Get category by slug |
| POST   | `/`      | Required | ADMIN | Create category      |
| PUT    | `/:id`   | Required | ADMIN | Update category      |
| DELETE | `/:id`   | Required | ADMIN | Delete category      |

### Tag Routes (`/tags`)

| Method | Endpoint | Auth     | Roles | Description     |
| ------ | -------- | -------- | ----- | --------------- |
| GET    | `/`      | Public   | -     | Get all tags    |
| GET    | `/:slug` | Public   | -     | Get tag by slug |
| POST   | `/`      | Required | ADMIN | Create tag      |
| PUT    | `/:id`   | Required | ADMIN | Update tag      |
| DELETE | `/:id`   | Required | ADMIN | Delete tag      |

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Project Structure

```
backend/
├── app.js                 # Express app setup
├── controllers/           # Route controllers
│   ├── authController.js
│   ├── postController.js
│   ├── commentController.js
│   ├── categoryController.js
│   └── tagController.js
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── authValidation.js # Auth input validation
│   └── validation.js     # General validation rules
├── routes/                # API routes
│   ├── auth.js
│   ├── posts.js
│   ├── comments.js
│   ├── categories.js
│   └── tags.js
├── prisma/
│   └── schema.prisma     # Database schema
└── lib/
    ├── prisma.js         # Prisma client
    └── script.js         # Database seeding
```

## Environment Variables

| Variable     | Description                  | Required |
| ------------ | ---------------------------- | -------- |
| DATABASE_URL | PostgreSQL connection string | Yes      |
| JWT_SECRET   | Secret key for JWT signing   | Yes      |
| PORT         | Server port (default: 3000)  | No       |

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message here"
}
```

HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## License

MIT
