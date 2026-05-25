"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, Comment, formatDate } from "@/lib/api";
import EmptyState from "./EmptyState";
import { LoadingBlock } from "./Spinner";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/posts/${encodeURIComponent(slug)}/comments`,
      );
      if (res.ok) setComments(await res.json());
    } catch {
      // Leave the list empty if the request fails.
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/posts/${encodeURIComponent(slug)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorName: name, body }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not post comment");
      setComments((current) => [data, ...current]);
      setName("");
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 border-t border-ink/10 pt-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">
        Comments{!loading && ` (${comments.length})`}
      </h2>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
          placeholder="Your name"
          className={inputClass}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={2000}
          rows={4}
          placeholder="Write a comment…"
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post comment"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          <LoadingBlock label="Loading comments…" />
        ) : comments.length === 0 ? (
          <EmptyState
            icon="💭"
            title="No comments yet"
            description="Be the first to share your thoughts."
          />
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-ink">{c.authorName}</span>
                <span className="shrink-0 text-xs text-ink/40">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">
                {c.body}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
