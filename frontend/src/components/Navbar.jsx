import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout, isAuthor } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-bold">
              BlogAPI
            </Link>
            <Link to="/" className="text-sm">
              Home
            </Link>
            <Link to="/posts" className="text-sm">
              Posts
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAuthor && (
                  <Link to="/dashboard" className="text-sm">
                    Dashboard
                  </Link>
                )}
                <span className="text-sm text-gray-600">{user?.username}</span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-gray-100 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
