import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postsAPI.getAll({
        authorId: user.id,
        published: undefined,
      });
      setPosts(data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      if (post.published) {
        await postsAPI.unpublish(post.id);
      } else {
        await postsAPI.publish(post.id);
      }
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;

    try {
      await postsAPI.delete(postId);
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <Link
          to="/dashboard/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Post
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Posts
          </h3>
          <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Published</h3>
          <p className="text-3xl font-bold text-green-600">
            {posts.filter((p) => p.published).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {posts.filter((p) => !p.published).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">You haven't created any posts yet.</p>
            <Link
              to="/dashboard/posts/new"
              className="text-blue-600 hover:underline"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/posts/${post.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {post.title}
                      </Link>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{post.viewCount} views</span>
                      <span className="mx-2">•</span>
                      <span>{post._count?.comments || 0} comments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/dashboard/posts/${post.id}/edit`}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {post.published ? "Unpublish" : "Publish"}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
