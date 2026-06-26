import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostsList from "./pages/PostsList";
import PostDetail from "./pages/PostDetail";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no shared layout (full-screen split design) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Create/Edit post — no footer, custom header */}
          <Route
            path="/write"
            element={
              <ProtectedRoute requireAuth>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute requireAuth>
                <EditPost />
              </ProtectedRoute>
            }
          />

          {/* All other pages share Layout (Navbar + Footer) via Outlet */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<PostsList />} />
            <Route path="/posts/:slug" element={<PostDetail />} />
            <Route path="/author/:username" element={<Profile />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAuth>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <ProtectedRoute requireAuth>
                  <Bookmarks />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 page-enter">
      <div className="text-center">
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h2>
        <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 btn-gradient rounded-xl font-semibold text-sm shadow-sm"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
