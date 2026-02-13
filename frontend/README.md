# BlogAPI Frontend

A modern, responsive blog application built with React and Tailwind CSS.

## Tech Stack

- **React 19.2** - UI library
- **Vite 7.2** - Build tool and dev server
- **React Router 7.11** - Client-side routing
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **@tailwindcss/vite** - Tailwind CSS Vite plugin

## Features

- **User Authentication** - Login, register, and profile management
- **Post Browsing** - View all posts with search and pagination
- **Post Detail** - Read posts with comments
- **Comment System** - Create and delete comments
- **Author Dashboard** - Manage posts (for authors and admins)
- **Role-Based UI** - Different views for users, authors, and admins
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Clean Minimal Design** - Simple and easy to use interface

## Getting Started

### Prerequisites

- Node.js 16+
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

3. Start development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── PostsList.jsx
│   │   ├── PostDetail.jsx
│   │   └── Dashboard.jsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables
├── vite.config.js          # Vite configuration
└── package.json
```

## Routes

| Path           | Component  | Auth Required | Description                    |
| -------------- | ---------- | ------------- | ------------------------------ |
| `/`            | Home       | No            | Landing page                   |
| `/login`       | Login      | No            | Login page                     |
| `/register`    | Register   | No            | Registration page              |
| `/posts`       | PostsList  | No            | Browse all posts               |
| `/posts/:slug` | PostDetail | No            | View single post with comments |
| `/dashboard`   | Dashboard  | Yes (Author)  | Author/Admin dashboard         |

## Components

### Layout Components

- **Navbar** - Main navigation with auth state
- **Footer** - Site footer
- **Layout** - Wraps pages with navbar and footer
- **ProtectedRoute** - Guards routes based on auth and role

### Page Components

- **Home** - Landing page with hero and features
- **Login** - User login form
- **Register** - User registration form
- **PostsList** - Paginated post list with search
- **PostDetail** - Single post view with comments
- **Dashboard** - Author content management

## Context & State

### AuthContext

Provides authentication state and methods throughout the app:

```jsx
const {
  user, // Current user object
  token, // JWT token
  isAuthenticated, // Boolean auth status
  isAdmin, // Check if user is admin
  isAuthor, // Check if user is author
  login, // Login function
  register, // Register function
  logout, // Logout function
} = useAuth();
```

## API Integration

The `api.js` service provides methods for all API endpoints:

```javascript
// Authentication
authAPI.register(data);
authAPI.login(data);
authAPI.getProfile();
authAPI.updateProfile(data);
authAPI.changePassword(data);

// Posts
postsAPI.getAll(params);
postsAPI.getBySlug(slug);
postsAPI.create(data);
postsAPI.update(id, data);
postsAPI.publish(id);
postsAPI.unpublish(id);
postsAPI.delete(id);

// Comments
commentsAPI.getByPost(postId);
commentsAPI.create(data);
commentsAPI.update(id, data);
commentsAPI.delete(id);

// Categories
categoriesAPI.getAll();
categoriesAPI.getBySlug(slug);
categoriesAPI.create(data);
categoriesAPI.update(id, data);
categoriesAPI.delete(id);

// Tags
tagsAPI.getAll();
tagsAPI.getBySlug(slug);
tagsAPI.create(data);
tagsAPI.update(id, data);
tagsAPI.delete(id);
```

## Styling

The app uses Tailwind CSS 4 with a minimal, clean design:

- Simple borders and rounded corners
- Consistent spacing using Tailwind utilities
- Blue color scheme for primary actions
- Gray scale for neutral elements
- Responsive design with mobile-first approach

## Build & Deploy

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

The built files will be in the `dist/` directory.

## Environment Variables

| Variable     | Description     | Required |
| ------------ | --------------- | -------- |
| VITE_API_URL | Backend API URL | Yes      |

## License

MIT
