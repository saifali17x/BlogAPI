import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="text-slate-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function PostRow({ post, onTogglePublish, onDelete }) {
  return (
    <div className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group">
      {/* Cover thumbnail */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        {post.coverImage ? (
          <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl opacity-30">📝</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Link
            to={`/posts/${post.slug}`}
            className="font-semibold text-slate-900 hover:text-indigo-600 truncate transition-colors"
          >
            {post.title}
          </Link>
          <span
            className={`tag-pill flex-shrink-0 ${
              post.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {post.published ? "Published" : "Draft"}
          </span>
        </div>
        <p className="text-slate-500 text-xs line-clamp-1">{post.excerpt || "No excerpt"}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
          <span>{new Date(post.updatedAt || post.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>👁 {post.viewCount || 0}</span>
          <span>·</span>
          <span>💬 {post._count?.comments || 0}</span>
          <span>·</span>
          <span>❤️ {post._count?.likes || 0}</span>
          {post.readingTime && <><span>·</span><span>{post.readingTime} min read</span></>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/edit/${post.id}`}
          className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => onTogglePublish(post)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            post.published
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "btn-gradient text-white"
          }`}
        >
          {post.published ? "Unpublish" : "Publish"}
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      const data = await postsAPI.getMyPosts();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleTogglePublish = async (post) => {
    try {
      if (post.published) await postsAPI.unpublish(post.id);
      else await postsAPI.publish(post.id);
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await postsAPI.delete(id);
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalViews = posts.reduce((a, p) => a + (p.viewCount || 0), 0);
  const totalLikes = posts.reduce((a, p) => a + (p._count?.likes || 0), 0);

  const filteredPosts = posts.filter((p) => {
    const matchFilter = filter === "all" || (filter === "published" ? p.published : !p.published);
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 page-enter">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700">{user?.name || user?.username}</span>
            </p>
          </div>
          <Link
            to="/write"
            className="flex items-center gap-2 px-5 py-2.5 btn-gradient rounded-xl font-semibold text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New post
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total posts" value={posts.length} icon="📝" color="bg-indigo-50" />
          <StatCard label="Published" value={posts.filter((p) => p.published).length} icon="🌟" color="bg-green-50" />
          <StatCard label="Total views" value={totalViews.toLocaleString()} icon="👁️" color="bg-blue-50" />
          <StatCard label="Total likes" value={totalLikes.toLocaleString()} icon="❤️" color="bg-pink-50" />
        </div>

        {/* Posts table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">My Posts</h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                />
              </div>
              {/* Filter tabs */}
              {["all", "published", "draft"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    filter === f ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-5">
                  <div className="skeleton w-16 h-16 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-4">✍️</div>
              <p className="font-semibold mb-2">
                {search || filter !== "all" ? "No posts match your filter" : "No posts yet"}
              </p>
              {!search && filter === "all" && (
                <Link to="/write" className="inline-block mt-3 px-5 py-2.5 btn-gradient rounded-xl text-sm font-semibold">
                  Write your first post
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onTogglePublish={handleTogglePublish}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
