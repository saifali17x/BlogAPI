import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authAPI.getPublicProfile(username)
      .then((d) => setProfile(d.user))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">User not found</h2>
          <p className="text-slate-500 mb-6">{error || "This profile doesn't exist."}</p>
          <Link to="/posts" className="px-5 py-2.5 btn-gradient rounded-xl text-sm font-semibold">
            Browse posts →
          </Link>
        </div>
      </div>
    );
  }

  const initials = (profile.name || profile.username || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 page-enter">
      {/* Profile hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 animate-slide-up">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                {initials}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {profile.name || profile.username}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">@{profile.username}</p>
              {profile.bio && (
                <p className="text-slate-600 mt-3 max-w-md text-sm leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start text-sm text-slate-500">
                <span><strong className="text-slate-900">{profile._count?.posts || 0}</strong> posts</span>
                <span className="text-slate-300">·</span>
                <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {profile.posts?.length > 0 ? (
          <>
            <h2 className="font-bold text-slate-900 mb-6">Published stories</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {profile.posts.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.slug}`}
                  className="card block overflow-hidden group animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
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
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                      {post.readingTime && <span>{post.readingTime} min read</span>}
                      <span>❤️ {post._count?.likes || 0}</span>
                      <span>💬 {post._count?.comments || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-4">✍️</div>
            <p className="text-slate-500">No published posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
