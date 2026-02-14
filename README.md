# BlogAPI

A full-stack blog platform with role-based authentication, built with Node.js, Express, React, and Prisma ORM.

## Overview

BlogAPI is a modern blogging platform that allows users to create, read, and interact with blog posts. It features a robust backend API with JWT authentication and a clean, responsive React frontend.

## 🌐 Live Demo

**[https://blog-api-opal-seven.vercel.app/](https://blog-api-opal-seven.vercel.app/)**

### Key Features

- 🔐 **Role-Based Access Control** - Three user roles (USER, AUTHOR, ADMIN)
- ✍️ **Post Management** - Create, edit, publish, and delete blog posts
- 💬 **Comment System** - Users can comment on posts
- 🏷️ **Categories & Tags** - Organize posts with categories and tags
- 🔍 **Search & Filtering** - Find posts easily with search and filters
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Clean UI** - Minimalistic, user-friendly interface

## Tech Stack

### Backend

- **Node.js** & **Express** - RESTful API server
- **Prisma ORM** - Database management with PostgreSQL
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation

### Frontend

- **React 19** - UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **Context API** - State management

## Getting Started

### Prerequisites

- Node.js 16 or higher
- PostgreSQL database (or use Neon/Supabase)
- npm or yarn

### Installation

1. **Clone the repository:**

```bash
git clone git@github.com:saifali17x/BlogAPI.git
cd BlogAPI
```

2. **Set up the backend:**

```bash
cd backend
npm install

# Create .env file
echo 'DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
PORT=3000' > .env

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
node lib/script.js

# Start backend server
npm start
```

3. **Set up the frontend:**

```bash
cd ../frontend
npm install

# Create .env file
echo 'VITE_API_URL=http://localhost:3000' > .env

# Start frontend dev server
npm run dev
```

4. **Access the application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## User Roles & Permissions

### USER (Default)

- View published posts
- Create and manage own comments
- Update own profile

### AUTHOR

- All USER permissions
- Create and manage own posts
- Publish/unpublish own posts

### ADMIN

- All AUTHOR permissions
- Delete any post or comment
- Manage categories and tags
- Full system access

## API Endpoints

### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/profile` - Get current user profile (authenticated)
- `PUT /auth/profile` - Update profile (authenticated)
- `POST /auth/change-password` - Change password (authenticated)

### Posts (`/posts`)

- `GET /posts` - Get all published posts (public, with pagination & filters)
- `GET /posts/:slug` - Get single post by slug (public)
- `POST /posts` - Create new post (AUTHOR, ADMIN)
- `PUT /posts/:id` - Update post (AUTHOR, ADMIN)
- `PATCH /posts/:id/publish` - Publish post (AUTHOR, ADMIN)
- `PATCH /posts/:id/unpublish` - Unpublish post (AUTHOR, ADMIN)
- `DELETE /posts/:id` - Delete post (ADMIN)

### Comments (`/comments`)

- `GET /comments/post/:postId` - Get comments for a post (public)
- `POST /comments` - Create comment (authenticated)
- `PUT /comments/:id` - Update own comment (authenticated)
- `DELETE /comments/:id` - Delete own comment or any (ADMIN)

### Categories (`/categories`)

- `GET /categories` - Get all categories (public)
- `GET /categories/:slug` - Get category by slug (public)
- `POST /categories` - Create category (ADMIN)
- `PUT /categories/:id` - Update category (ADMIN)
- `DELETE /categories/:id` - Delete category (ADMIN)

### Tags (`/tags`)

- `GET /tags` - Get all tags (public)
- `GET /tags/:slug` - Get tag by slug (public)
- `POST /tags` - Create tag (ADMIN)
- `PUT /tags/:id` - Update tag (ADMIN)
- `DELETE /tags/:id` - Delete tag (ADMIN)

## Project Structure

```
BlogAPI/
├── backend/                # Backend API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & validation middleware
│   ├── routes/             # API routes
│   ├── prisma/            # Database schema & migrations
│   ├── lib/               # Utilities (Prisma client, seeding)
│   ├── app.js             # Express app
│   └── package.json
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API integration
│   │   └── App.jsx        # Main app
│   ├── public/            # Static assets
│   └── package.json
│
└── README.md             # This file
```

## Authentication Flow

1. User registers or logs in via `/auth/register` or `/auth/login`
2. Backend validates credentials and returns a JWT token
3. Frontend stores token in localStorage
4. Token is included in Authorization header for protected requests
5. Backend verifies token on each protected route

## Database Schema

### Key Models

**User**

- id, email, username, password (hashed)
- name, bio, avatar
- role (USER, AUTHOR, ADMIN)
- createdAt, updatedAt

**Post**

- id, title, slug, content, excerpt
- coverImage, published
- authorId, viewCount
- createdAt, updatedAt
- Relations: author, comments, categories, tags

**Comment**

- id, content
- authorId, postId
- createdAt, updatedAt
- Relations: author, post

**Category & Tag**

- id, name, slug, description
- Relations: posts (many-to-many)

## Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Start development server
npm start
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## Features in Detail

### Authentication

- JWT-based authentication with 7-day expiration
- bcrypt password hashing with 10 salt rounds
- Role-based access control (RBAC)
- Protected routes with middleware

### Posts

- Create, read, update, delete operations
- Draft and published states
- SEO-friendly slug generation
- Full-text search capability
- Pagination and filtering
- View count tracking

### Comments

- Nested comment threads
- Edit and delete own comments
- Admin can moderate all comments
- Timestamps for all comments

### Categories & Tags

- Organize posts by topic
- Many-to-many relationships
- Admin-only management
- SEO-friendly slugs

## API Response Format

### Success Response

```json
{
  "user": {...},
  "token": "jwt_token_here"
}
```

### Error Response

```json
{
  "error": "Error message here"
}
```

### Validation Error

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Testing

To test the API, you can use:

- **Postman** - Import the API endpoints
- **curl** - Command-line testing
- **Frontend App** - Full integration testing

Example curl request:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "newuser",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123"
  }'
```

## Deployment

### Backend Deployment

1. Set up PostgreSQL database (e.g., Railway, Neon, Supabase)
2. Set environment variables
3. Run database migrations
4. Deploy to platform (Heroku, Railway, Render, etc.)

### Frontend Deployment

1. Update `VITE_API_URL` to production API URL
2. Build the app: `npm run build`
3. Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with ❤️ using Node.js, Express, React, and Prisma**
| ------ | ------------- | -------- | ------------- | ----------------------------- |
| GET | `/tags` | Public | - | Get all tags with post counts |
| GET | `/tags/:slug` | Public | - | Get tag with all posts |
| POST | `/tags` | Required | AUTHOR, ADMIN | Create new tag |
| PUT | `/tags/:id` | Required | AUTHOR, ADMIN | Update tag |
| DELETE | `/tags/:id` | Required | ADMIN | Delete tag |

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
