import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { postsAPI, commentsAPI, likesAPI, bookmarksAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function CommentItem({ comment, user, onDelete, onReply, depth = 0 }) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(replyText, comment.postId, comment.id);
      setReplyText("");
      setShowReply(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">
              {comment.author.name || comment.author.username}
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-500 text-xs">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && depth === 0 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                {showReply ? "Cancel" : "Reply"}
              </button>
            )}
            {(user?.id === comment.authorId || user?.role === "ADMIN") && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-700 text-sm">{comment.content}</p>

        {showReply && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500"
              rows="2"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </form>
        )}
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          user={user}
          onDelete={onDelete}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function PostDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const [postData, relatedData] = await Promise.all([
        postsAPI.getBySlug(slug),
        postsAPI.getRelated(slug).catch(() => ({ posts: [] })),
      ]);
      setPost(postData.post);
      setRelatedPosts(relatedData.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Fetch like/bookmark status once we have the post id
  useEffect(() => {
    if (!post) return;

    likesAPI.getStatus(post.id).then((d) => {
      setLikeCount(d.likeCount);
      setLiked(d.liked);
    }).catch(() => {});

    if (isAuthenticated) {
      bookmarksAPI.getStatus(post.id).then((d) => setBookmarked(d.bookmarked)).catch(() => {});
    }
  }, [post, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    setLikeLoading(true);
    try {
      const data = await likesAPI.toggle(post.id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      alert(err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return;
    setBookmarkLoading(true);
    try {
      const data = await bookmarksAPI.toggle(post.id);
      setBookmarked(data.bookmarked);
    } catch (err) {
      alert(err.message);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await commentsAPI.create({ content: commentText, postId: post.id });
      setCommentText("");
      fetchPost();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (content, postId, parentId) => {
    await commentsAPI.create({ content, postId, parentId });
    fetchPost();
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
        <Link to="/posts" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to posts
        </Link>
      </div>
    );
  }

  const totalComments =
    (post.comments?.length || 0) +
    (post.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/posts" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to posts
      </Link>

      <article className="bg-white border rounded-lg overflow-hidden shadow-sm">
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full h-80 object-cover" />
        )}

        <div className="p-6 md:p-8">
          {/* Categories */}
          {post.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-sm mb-4">
            <Link
              to={`/author/${post.author.username}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {post.author.name || post.author.username}
            </Link>
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            )}
            {post.readingTime && <span>{post.readingTime} min read</span>}
            <span>{post.viewCount} views</span>
          </div>

          {/* Like / Bookmark bar */}
          <div className="flex items-center gap-4 py-4 mb-6 border-t border-b border-gray-100">
            <button
              onClick={handleLike}
              disabled={likeLoading || !isAuthenticated}
              title={isAuthenticated ? (liked ? "Unlike" : "Like") : "Sign in to like"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${liked ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{liked ? "♥" : "♡"}</span>
              <span>{likeCount}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${bookmarked ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                  disabled:opacity-50`}
              >
                <span>{bookmarked ? "🔖" : "🏷️"}</span>
                <span>{bookmarked ? "Saved" : "Save"}</span>
              </button>
            )}

            <span className="ml-auto text-gray-500 text-sm">{totalComments} comment{totalComments !== 1 ? "s" : ""}</span>
          </div>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 italic border-l-4 border-blue-200 pl-4">{post.excerpt}</p>
          )}

          <div className="prose max-w-none mb-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t">
              <span className="text-gray-500 text-sm mr-1">Tags:</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tags/${tag.slug}`}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Author card */}
      <div className="mt-8 bg-white border rounded-lg p-6 flex items-start gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {(post.author.name || post.author.username || "?")[0].toUpperCase()}
        </div>
        <div>
          <Link
            to={`/author/${post.author.username}`}
            className="font-semibold text-gray-900 hover:text-blue-600"
          >
            {post.author.name || post.author.username}
          </Link>
          {post.author.bio && (
            <p className="text-gray-600 text-sm mt-1">{post.author.bio}</p>
          )}
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Posts</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                to={`/posts/${related.slug}`}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group"
              >
                {related.coverImage && (
                  <img src={related.coverImage} alt={related.title} className="w-full h-32 object-cover rounded mb-3" />
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 text-sm leading-snug">
                  {related.title}
                </h3>
                {related.readingTime && (
                  <p className="text-gray-400 text-xs mt-1">{related.readingTime} min read</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({totalComments})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows="3"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>{" "}
            to leave a comment
          </div>
        )}

        <div className="space-y-4">
          {post.comments?.length > 0 ? (
            post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                user={user}
                onDelete={handleDeleteComment}
                onReply={handleReply}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
