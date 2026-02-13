import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireAuthor = false,
}) => {
  const { isAuthenticated, isAdmin, isAuthor, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireAuthor && !isAuthor) {
    return <Navigate to="/" replace />;
  }

  return children;
};
