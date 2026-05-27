"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminFetch,
  formatDate,
  formatDateTime,
  Post,
  PostList,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/posts", getToken() || "");
      if (!res.ok) throw new Error("Failed to load posts");
      const data: PostList = await res.json();
      setPosts(data.posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const res = await adminFetch(
      `/api/admin/posts/${post.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) {
      setPosts((current) => current.filter((p) => p.id !== post.id));
    } else {
      alert("Could not delete the post.");
    }
  };

  const statusClass = (status: Post["status"]) => {
    switch (status) {
      case "published":
        return "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800";
      case "scheduled":
        return "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800";
      default:
        return "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800";
    }
  };

  const dateLabel = (post: Post) => {
    if (post.status === "scheduled") {
      return post.scheduledAt
        ? `Scheduled for ${formatDateTime(post.scheduledAt)}`
        : "Scheduled";
    }
    return formatDate(post.publishedAt || post.createdAt);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Insights / Posts
          </h1>
          <p className="text-sm text-ink/50">
            Create, edit, and publish articles for the Insights blog.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New post
        </Link>
      </div>

      {loading && (
        <div className="mt-6">
          <SkeletonTableRows rows={5} columns={5} />
        </div>
      )}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="✍️"
          title="No posts yet"
          description="Write your first article to populate the Insights blog."
          action={{ href: "/admin/posts/new", label: "+ New post" }}
        />
      )}

      {!loading && posts.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
                  <td className="px-4 py-3 text-ink/60">
                    {p.categoryName || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusClass(p.status)}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/50">
                    {dateLabel(p)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/posts/${p.id}/edit`}
                      className="text-ink/70 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => remove(p)}
                      className="ml-4 text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
