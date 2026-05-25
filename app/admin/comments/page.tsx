"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch, Comment, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/comments", getToken() || "");
      if (!res.ok) throw new Error("Failed to load comments");
      setComments(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (comment: Comment) => {
    if (!confirm(`Delete this comment by ${comment.authorName}?`)) return;
    const res = await adminFetch(
      `/api/admin/comments/${comment.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) {
      setComments((current) => current.filter((c) => c.id !== comment.id));
    } else {
      alert("Could not delete the comment.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Comments
      </h1>
      <p className="text-sm text-ink/50">
        Reader comments across all insights. Delete any that are spam or
        unwanted.
      </p>

      {loading && <LoadingBlock label="Loading comments…" />}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      {!loading && !error && comments.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="💬"
          title="No comments yet"
          description="When readers leave comments on your insights they'll show up here for moderation."
        />
      )}

      {!loading && comments.length > 0 && (
        <ul className="mt-6 space-y-4">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-ink">{c.authorName}</span>
                <span className="shrink-0 text-xs text-ink/40">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">
                {c.body}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                <span className="text-xs text-ink/50">
                  on{" "}
                  {c.postSlug ? (
                    <Link
                      href={`/insights/${c.postSlug}`}
                      className="text-ink/70 hover:underline"
                    >
                      {c.postTitle}
                    </Link>
                  ) : (
                    c.postTitle
                  )}
                </span>
                <button
                  onClick={() => remove(c)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
