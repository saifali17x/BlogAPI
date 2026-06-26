import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { postsAPI, categoriesAPI, tagsAPI } from "../services/api";

function PostCard({ post }) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className="card flex flex-col overflow-hidden group animate-fade-in"
    >
      {post.coverImage ? (
        <div className="h-40 overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl opacity-25">📝</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {post.categories?.length > 0 && (
          <span className="tag-pill bg-indigo-50 text-indigo-600 mb-2 self-start">
            {post.categories[0].name}
          </span>
        )}
        <h2 className="font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 flex-1">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
          <span className="font-medium text-slate-600">{post.author?.name || post.author?.username}</span>
          <span>·</span>
          {post.readingTime && <><span>{post.readingTime} min</span><span>·</span></>}
          <span>❤️ {post._count?.likes || 0}</span>
          <span>💬 {post._count?.comments || 0}</span>
          {post.tags?.slice(0, 2).map((tag) => (
            <span key={tag.id} className="ml-auto tag-pill bg-slate-100 text-slate-500">#{tag.name}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

const SORT_OPTIONS = [
  { value: "createdAt", label: "Latest" },
  { value: "popular", label: "Most viewed" },
  { value: "liked", label: "Most liked" },
];

export default function PostsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesAPI.getAll().then((d) => setCategories(d.categories || [])).catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, sortBy };
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await postsAPI.getAll(params);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
    setSearchParams({ ...(searchInput && { search: searchInput }), sortBy, ...(category && { category }) });
  };

  const handleSort = (val) => {
    setSortBy(val);
    setPage(1);
    setSearchParams({ ...(search && { search }), sortBy: val, ...(category && { category }) });
  };

  const handleCategory = (slug) => {
    const val = category === slug ? "" : slug;
    setCategory(val);
    setPage(1);
    setSearchParams({ ...(search && { search }), sortBy, ...(val && { category: val }) });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6 animate-slide-up">Explore stories</h1>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg animate-slide-up animation-delay-100">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 btn-gradient rounded-xl text-sm font-semibold shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 mt-4 animate-slide-up animation-delay-200">
            {/* Sort */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    sortBy === opt.value
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Category pills */}
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.slug)}
                className={`tag-pill transition-all ${
                  category === cat.slug
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {cat.name}
              </button>
            ))}

            {search && (
              <button
                onClick={() => { setSearch(""); setSearchInput(""); setPage(1); setSearchParams({ sortBy }); }}
                className="tag-pill bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
              >
                ✕ "{search}"
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="skeleton h-40 w-full" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No posts found</h3>
            <p className="text-slate-500 text-sm">Try a different search or filter</p>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-6">
              {pagination?.total} post{pagination?.total !== 1 ? "s" : ""}
              {search && <> for <strong>"{search}"</strong></>}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                      page === i + 1
                        ? "btn-gradient text-white shadow-sm"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
