import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { postsAPI, commentsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function PostDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const data = await postsAPI.getBySlug(slug);
      setPost(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await commentsAPI.create({
        content: commentText,
        postId: post.id,
      });
      setCommentText("");
      fetchPost(); // Refresh to show new comment
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await commentsAPI.delete(commentId);
      fetchPost();
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

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Post not found"}
        </div>
        <Link
          to="/posts"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/posts"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to posts
      </Link>

      <article className="bg-white border rounded overflow-hidden">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-96 object-cover"
          />
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center text-gray-600 text-sm mb-4">
            <Link
              to={`/author/${post.author.username}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {post.author.name || post.author.username}
            </Link>
            <span className="mx-2">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{post.viewCount} views</span>
          </div>

          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 italic">{post.excerpt}</p>
          )}

          <div className="prose max-w-none mb-8">{post.content}</div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t">
              <span className="text-gray-600 mr-2">Tags:</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tags/${tag.slug}`}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({post.comments?.length || 0})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              rows="3"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>{" "}
            to leave a comment
          </div>
        )}

        <div className="space-y-6">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">
                      {comment.author.name || comment.author.username}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {(user?.id === comment.authorId ||
                    user?.role === "ADMIN") && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
