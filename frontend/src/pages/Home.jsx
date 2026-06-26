import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function PostCard({ post, delay = 0 }) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className="card block overflow-hidden group animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {post.coverImage ? (
        <div className="h-44 overflow-hidden bg-slate-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
          <span className="text-4xl opacity-30">📝</span>
        </div>
      )}
      <div className="p-5">
        {post.categories?.length > 0 && (
          <span className="tag-pill bg-indigo-50 text-indigo-600 mb-2">
            {post.categories[0].name}
          </span>
        )}
        <h3 className="font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
          <span className="font-medium text-slate-600">
            {post.author?.name || post.author?.username}
          </span>
          <div className="flex items-center gap-3">
            {post.readingTime && <span>{post.readingTime} min read</span>}
            <span>♥ {post._count?.likes || 0}</span>
            <span>💬 {post._count?.comments || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="text-center animate-slide-up">
      <div className="text-3xl mb-2 animate-float">{icon}</div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      postsAPI.getAll({ limit: 3, sortBy: "liked" }),
      postsAPI.getAll({ limit: 6 }),
    ])
      .then(([featured, latest]) => {
        setFeaturedPosts(featured.posts);
        setLatestPosts(latest.posts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="hero-gradient text-white py-24 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Open platform for writers &amp; readers
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
            Where great ideas{" "}
            <span className="underline decoration-purple-400 decoration-4 underline-offset-4">
              come to life
            </span>
          </h1>

          <p className="text-lg text-indigo-200 mb-10 animate-slide-up animation-delay-100 max-w-xl mx-auto">
            Discover insightful stories, share your expertise, and connect with curious minds around the world.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up animation-delay-200">
            <Link
              to="/posts"
              className="px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20"
            >
              Explore stories
            </Link>
            {isAuthenticated ? (
              <Link
                to="/write"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
              >
                Write a post →
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
              >
                Start writing free →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────── */}
      <section className="bg-white border-b border-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <StatCard icon="✍️" label="Writers worldwide" value="1K+" />
          <StatCard icon="📖" label="Stories published" value="5K+" />
          <StatCard icon="🌍" label="Readers monthly" value="20K+" />
        </div>
      </section>

      {/* ── Featured posts ────────────────────────── */}
      {!loading && featuredPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Most loved posts</h2>
              <p className="text-slate-500 text-sm mt-1">Handpicked by the community</p>
            </div>
            <Link to="/posts?sortBy=liked" className="text-indigo-600 text-sm font-semibold hover:underline">
              See all →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post, i) => (
              <PostCard key={post.id} post={post} delay={i * 100} />
            ))}
          </div>
        </section>
      )}

      {/* ── Latest posts ─────────────────────────── */}
      {!loading && latestPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Latest stories</h2>
              <p className="text-slate-500 text-sm mt-1">Fresh from the community</p>
            </div>
            <Link to="/posts" className="text-indigo-600 text-sm font-semibold hover:underline">
              Browse all →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post, i) => (
              <PostCard key={post.id} post={post} delay={i * 80} />
            ))}
          </div>
        </section>
      )}

      {/* Skeleton loader */}
      {loading && (
        <section className="max-w-6xl mx-auto px-4 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="skeleton h-44 w-full" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-5/6" />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── CTA banner ───────────────────────────── */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16 px-4 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-3">Ready to share your story?</h2>
          <p className="text-indigo-200 mb-8 max-w-md mx-auto">
            Join thousands of writers who share their ideas every day. It's free.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Create free account →
          </Link>
        </section>
      )}

      {/* ── Features ─────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-12">
            Everything you need to write and grow
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "✍️", title: "Rich Editor", desc: "Write beautiful posts with formatting support, cover images, and excerpts." },
              { icon: "💬", title: "Threaded Comments", desc: "Engage in conversations with nested replies and real-time updates." },
              { icon: "❤️", title: "Likes & Bookmarks", desc: "Save your favourite posts and show appreciation for great writing." },
              { icon: "🏷️", title: "Tags & Categories", desc: "Organise and discover content through smart tagging and categories." },
              { icon: "👁️", title: "Reading Stats", desc: "Track view counts and reading time estimated for every post." },
              { icon: "🔒", title: "Secure Auth", desc: "JWT with refresh tokens keeps sessions safe and smooth." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
