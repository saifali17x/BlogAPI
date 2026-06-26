import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
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

export default function CreatePost() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    categoryIds: [],
    tagIds: [],
  });
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    Promise.all([categoriesAPI.getAll(), tagsAPI.getAll()]).then(([c, t]) => {
      setCategories(c.categories || []);
      setTags(t.tags || []);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && !slugManual ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSlugChange = (e) => {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const submit = async (publish) => {
    setError("");
    const setter = publish ? setPublishing : setSaving;
    setter(true);
    try {
      const payload = {
        title: form.title,
        ...(form.slug && { slug: form.slug }),
        ...(form.excerpt && { excerpt: form.excerpt }),
        ...(form.content && { content: form.content }),
        ...(form.coverImage && { coverImage: form.coverImage }),
        categories: form.categoryIds,
        tags: form.tagIds,
      };
      const data = await postsAPI.create(payload);
      if (publish) await postsAPI.publish(data.post.id);
      navigate(publish ? `/posts/${data.post.slug}` : "/dashboard");
    } catch (err) {
      setError(err.message || "Failed to save post");
    } finally {
      setter(false);
    }
  };

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

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
            <h1 className="font-bold text-slate-900 text-sm">New post</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                preview ? "bg-slate-200 text-slate-700" : "border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {preview ? "← Edit" : "Preview"}
            </button>
            <button
              onClick={() => submit(false)}
              disabled={!form.title || saving}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button
              onClick={() => submit(true)}
              disabled={!form.title || publishing}
              className="px-4 py-1.5 text-xs font-semibold btn-gradient rounded-lg disabled:opacity-40"
            >
              {publishing ? "Publishing..." : "Publish →"}
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
            {preview ? (
              /* Preview mode */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {form.coverImage && (
                  <img src={form.coverImage} alt="Cover" className="w-full h-60 object-cover" onError={(e) => e.target.style.display='none'} />
                )}
                <div className="p-8">
                  {form.categoryIds.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {categories.filter((c) => form.categoryIds.includes(c.id)).map((c) => (
                        <span key={c.id} className="tag-pill bg-indigo-50 text-indigo-600">{c.name}</span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{form.title || "Untitled"}</h1>
                  {form.excerpt && <p className="text-lg text-slate-500 italic mb-6 border-l-4 border-indigo-200 pl-4">{form.excerpt}</p>}
                  <div className="text-xs text-slate-400 mb-6 flex gap-3">
                    <span>{wordCount} words</span>
                    <span>·</span>
                    <span>{readingTime} min read</span>
                  </div>
                  <div className="prose-content whitespace-pre-wrap">{form.content || <span className="text-slate-400 italic">No content yet...</span>}</div>
                  {form.tagIds.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-8 pt-6 border-t border-slate-100">
                      {tags.filter((t) => form.tagIds.includes(t.id)).map((t) => (
                        <span key={t.id} className="tag-pill bg-slate-100 text-slate-600">#{t.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Editor mode */
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5 animate-fade-in">
                  {/* Cover image preview */}
                  {form.coverImage && (
                    <div className="relative rounded-xl overflow-hidden h-40">
                      <img
                        src={form.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display='none'}
                      />
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, coverImage: "" }))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
                      >
                        ✕
                      </button>
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
                      placeholder="Your post title..."
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
                        placeholder="auto-generated"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono bg-slate-50"
                        value={form.slug}
                        onChange={handleSlugChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Excerpt</label>
                    <textarea
                      name="excerpt"
                      placeholder="A short summary of your post (optional)..."
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
                    rows={20}
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
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5 animate-slide-up">
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

            {/* Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 text-xs text-slate-600 space-y-2 animate-slide-up animation-delay-100">
              <p className="font-semibold text-slate-700">Writing tips</p>
              <p>• A catchy title gets 3× more clicks</p>
              <p>• Add a cover image to stand out</p>
              <p>• Use the excerpt for search previews</p>
              <p>• Save as draft first, then publish</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
