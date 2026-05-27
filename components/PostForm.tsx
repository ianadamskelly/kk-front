"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, API_URL, Category, Post, imageUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";
import Spinner, { LoadingBlock } from "@/components/Spinner";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";
type PostStatus = "draft" | "scheduled" | "published";

const STATUS_OPTIONS: Array<{ value: PostStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

function toLocalDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

// PostForm powers both the "new post" and "edit post" screens.
export default function PostForm({ postId }: { postId?: number }) {
  const router = useRouter();
  const isEdit = postId !== undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await fetch(`${API_URL}/api/categories`);
        setCategories(catRes.ok ? await catRes.json() : []);

        if (isEdit) {
          const res = await adminFetch(
            `/api/admin/posts/${postId}`,
            getToken() || "",
          );
          if (!res.ok) throw new Error("Could not load the post");
          const post: Post = await res.json();
          setTitle(post.title);
          setExcerpt(post.excerpt);
          setContent(post.content);
          setCoverImage(post.coverImage);
          setStatus(post.status);
          setScheduledAt(toLocalDateTimeInput(post.scheduledAt));
          setCategoryId(post.categoryId ? String(post.categoryId) : "");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, postId]);

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch("/api/admin/upload", getToken() || "", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverImage(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (status === "scheduled" && !scheduledAt) {
        throw new Error("Choose when this post should publish.");
      }
      const body = JSON.stringify({
        title,
        excerpt,
        content,
        coverImage,
        status,
        scheduledAt:
          status === "scheduled" ? new Date(scheduledAt).toISOString() : null,
        categoryId: categoryId ? Number(categoryId) : null,
      });
      const res = isEdit
        ? await adminFetch(`/api/admin/posts/${postId}`, getToken() || "", {
            method: "PUT",
            body,
          })
        : await adminFetch("/api/admin/posts", getToken() || "", {
            method: "POST",
            body,
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/posts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <LoadingBlock label={isEdit ? "Loading post…" : "Setting up…"} />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {isEdit ? "Edit post" : "New post"}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="rounded-full border border-ink/15 px-5 py-2 text-sm text-ink/70 hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving && <Spinner size="sm" />}
            {saving ? "Saving…" : isEdit ? "Update post" : "Create post"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ===== Main column ===== */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink/10 bg-white p-6">
            <label className="text-sm font-medium text-ink/70">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="A clear, specific headline"
              className={`mt-1 ${inputClass} text-base`}
            />

            <label className="mt-5 block text-sm font-medium text-ink/70">
              Excerpt
            </label>
            <p className="text-xs text-ink/45">
              A short summary shown on insight cards and listings.
            </p>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className={`mt-1 ${inputClass}`}
            />
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white p-6">
            <label className="text-sm font-medium text-ink/70">Content</label>
            <p className="text-xs text-ink/45">
              Rich text — headings, lists, quotes, and links are all supported.
            </p>
            <div className="mt-2">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Tell the story…"
              />
            </div>
          </section>
        </div>

        {/* ===== Sidebar ===== */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-ink/10 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Publishing
            </h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-ink/60">
                  Status
                </label>
                <div
                  role="radiogroup"
                  aria-label="Post status"
                  className="mt-1 inline-flex flex-wrap items-center gap-1 rounded-full border border-ink/15 bg-white p-1"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={status === option.value}
                      onClick={() => setStatus(option.value)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                        status === option.value
                          ? option.value === "published"
                            ? "bg-brand-500 text-white"
                            : option.value === "scheduled"
                              ? "bg-blue-600 text-white"
                              : "bg-ink text-white"
                          : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {status === "scheduled" && (
                <div>
                  <label className="text-xs font-medium text-ink/60">
                    Publish at
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                  <p className="mt-1 text-xs text-ink/45">
                    Uses your local time and publishes automatically.
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-ink/60">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Cover image
            </h2>
            <p className="mt-1 text-xs text-ink/45">
              JPG, PNG, GIF, or WebP up to 10 MB.
            </p>
            {coverImage ? (
              <div className="mt-3">
                <img
                  src={imageUrl(coverImage)}
                  alt="Cover preview"
                  className="mb-2 aspect-[16/9] w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="text-xs text-red-700 hover:underline"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="mt-3 flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-ink/20 bg-ink/[0.02] text-xs text-ink/40">
                No image yet
              </div>
            )}
            <div className="mt-3 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                }}
                className="w-full text-xs"
              />
              {uploading && (
                <span className="inline-flex items-center gap-1.5 text-xs text-ink/50">
                  <Spinner size="sm" className="text-brand-500" />
                  Uploading…
                </span>
              )}
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}
