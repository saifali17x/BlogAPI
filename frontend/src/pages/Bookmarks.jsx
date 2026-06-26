import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookmarksAPI } from "../services/api";

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    bookmarksAPI.getAll({ page, limit: 9 })
      .then((d) => { setPosts(d.bookmarks || []); setPagination(d.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-50 page-enter">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 animate-slide-up">
            <span className="text-2xl">🔖</span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Saved posts</h1>
              <p className="text-slate-500 text-sm mt-0.5">Posts you've bookmarked for later</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="skeleton h-36 w-full" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No bookmarks yet</h3>
            <p className="text-slate-500 text-sm mb-6">Save posts while reading to find them here later.</p>
            <Link to="/posts" className="inline-block px-5 py-2.5 btn-gradient rounded-xl text-sm font-semibold">
              Explore posts →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.slug}`}
                  className="card block overflow-hidden group animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {post.coverImage ? (
                    <div className="h-36 overflow-hidden">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                      <span className="text-3xl opacity-20">📝</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-snug">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100">
                      <span className="font-medium text-slate-600 truncate">{post.author?.name || post.author?.username}</span>
                      {post.readingTime && <><span>·</span><span>{post.readingTime} min</span></>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button onClick={() => setPage(page - 1)} disabled={page === 1} className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors">←</button>
                <span className="text-sm text-slate-600 px-3">Page {page} of {pagination.pages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page === pagination.pages} className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors">→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
