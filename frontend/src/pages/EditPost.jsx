import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postsAPI, categoriesAPI, tagsAPI } from "../services/api";

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

function TagSelector({ selected, onChange, items, label }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(active ? selected.filter((id) => id !== item.id) : [...selected, item.id])}
              className={`tag-pill transition-all ${
                active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {item.name}
            </button>
          );
        })}
        {items.length === 0 && <span className="text-xs text-slate-400 italic">None available</span>}
      </div>
    </div>
  );
}

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [originalSlug, setOriginalSlug] = useState("");
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", coverImage: "", categoryIds: [], tagIds: [],
  });
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      postsAPI.getMyPosts(),
      categoriesAPI.getAll(),
      tagsAPI.getAll(),
    ]).then(([myPosts, cats, ts]) => {
      const post = (myPosts.posts || []).find((p) => p.id === parseInt(id));
      if (!post) { navigate("/dashboard"); return; }
      setOriginalSlug(post.slug);
      setPublished(post.published);
      setForm({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        coverImage: post.coverImage || "",
        categoryIds: (post.categories || []).map((c) => c.id),
        tagIds: (post.tags || []).map((t) => t.id),
      });
      setCategories(cats.categories || []);
      setTags(ts.tags || []);
    }).catch(() => navigate("/dashboard")).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (newPublished) => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug !== originalSlug ? form.slug : undefined,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage || undefined,
        categories: form.categoryIds,
        tags: form.tagIds,
      };
      await postsAPI.update(id, payload);

      if (newPublished !== published) {
        if (newPublished) await postsAPI.publish(id);
        else await postsAPI.unpublish(id);
        setPublished(newPublished);
      }

      setSuccess("Post saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 page-enter">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-bold text-slate-900 text-sm">Edit post</h1>
            <span className={`tag-pill ${published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {published ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {success && (
              <span className="text-xs text-green-600 font-semibold animate-fade-in">✓ {success}</span>
            )}
            {published ? (
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-40"
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => handleSave(false)}
                disabled={!form.title || saving}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save draft"}
              </button>
            )}
            <button
              onClick={() => handleSave(true)}
              disabled={!form.title || saving}
              className="px-4 py-1.5 text-xs font-semibold btn-gradient rounded-lg disabled:opacity-40"
            >
              {saving ? "Saving..." : published ? "Save changes" : "Publish →"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-scale-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              {form.coverImage && (
                <div className="relative rounded-xl overflow-hidden h-40">
                  <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, coverImage: "" }))}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
                  >✕</button>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cover image URL</label>
                <input
                  name="coverImage"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                  value={form.coverImage}
                  onChange={handleChange}
                />
              </div>

              <div>
                <textarea
                  name="title"
                  placeholder="Post title..."
                  rows={2}
                  className="w-full text-3xl font-extrabold text-slate-900 placeholder-slate-300 focus:outline-none resize-none bg-transparent leading-tight"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-slate-400 text-sm">/posts/</span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono bg-slate-50"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Excerpt</label>
                <textarea
                  name="excerpt"
                  placeholder="A short summary..."
                  rows={2}
                  maxLength={500}
                  className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-slate-50"
                  value={form.excerpt}
                  onChange={handleChange}
                />
                <p className="text-right text-xs text-slate-400 mt-1">{form.excerpt.length}/500</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content</label>
              <textarea
                name="content"
                placeholder="Write your story here..."
                rows={22}
                className="mt-2 w-full text-slate-800 text-sm leading-relaxed focus:outline-none resize-none placeholder-slate-300"
                value={form.content}
                onChange={handleChange}
              />
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>~{readingTime} min read</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
              <TagSelector
                label="Categories"
                items={categories}
                selected={form.categoryIds}
                onChange={(ids) => setForm((p) => ({ ...p, categoryIds: ids }))}
              />
              <div className="border-t border-slate-100" />
              <TagSelector
                label="Tags"
                items={tags}
                selected={form.tagIds}
                onChange={(ids) => setForm((p) => ({ ...p, tagIds: ids }))}
              />
            </div>

            {published && (
              <Link
                to={`/posts/${originalSlug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View live post
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
