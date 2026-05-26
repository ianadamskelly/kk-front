"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

// Mirror of store.AdminReview — the moderation panel needs the
// author + entity context so admins can decide without bouncing
// off to the product/course page.
interface AdminReview {
  id: number;
  userId: number;
  entityType: "product" | "course";
  entityId: number;
  rating: number;
  body: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorEmail: string;
  entityName: string;
}

type StatusFilter = "" | "pending" | "published" | "rejected";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= value ? "text-brand-500" : "text-ink/15"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<"" | "pending" | "published" | "rejected">(
    "pending",
  );
  const [items, setItems] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = `/api/admin/reviews${filter ? `?status=${filter}` : ""}`;
      const res = await adminFetch(url, getToken() || "");
      if (!res.ok) throw new Error("Failed to load reviews");
      setItems((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (
    id: number,
    next: "pending" | "published" | "rejected",
  ) => {
    const res = await adminFetch(`/api/admin/reviews/${id}/status`, getToken() || "", {
      method: "PUT",
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      alert("Could not update review status");
      return;
    }
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this review permanently?")) return;
    const res = await adminFetch(`/api/admin/reviews/${id}`, getToken() || "", {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Could not delete review");
      return;
    }
    setItems((list) => list.filter((r) => r.id !== id));
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Reviews
          </h1>
          <p className="text-sm text-ink/50">
            Verified-buyer reviews for products and courses. New submissions
            land here pending your approval.
          </p>
        </div>
      </div>

      <div className="mt-5 inline-flex rounded-full border border-ink/15 p-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFilter(t.value as typeof filter)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === t.value
                ? "bg-brand-500 text-white"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6">
          <SkeletonTableRows rows={4} columns={3} />
        </div>
      )}
      {error && !loading && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="⭐"
          title="No reviews"
          description={
            filter === "pending"
              ? "Nothing in the queue. Newly-submitted reviews appear here."
              : "No reviews match this filter."
          }
        />
      )}

      {!loading && items.length > 0 && (
        <ul className="mt-6 space-y-3">
          {items.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                    {r.entityType} · {r.entityName || `#${r.entityId}`}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {r.authorName}{" "}
                    <span className="text-xs font-normal text-ink/45">
                      ({r.authorEmail})
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span
                    className={
                      r.status === "published"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                        : r.status === "rejected"
                          ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                    }
                  >
                    {r.status}
                  </span>
                </div>
              </div>
              {r.body && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink/80">
                  {r.body}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {r.status !== "published" && (
                  <button
                    onClick={() => setStatus(r.id, "published")}
                    className="rounded-full bg-brand-500 px-4 py-1.5 font-semibold text-white hover:bg-brand-600"
                  >
                    Publish
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(r.id, "rejected")}
                    className="rounded-full border border-ink/15 px-4 py-1.5 text-ink/70 hover:bg-ink/5"
                  >
                    Reject
                  </button>
                )}
                {r.status !== "pending" && (
                  <button
                    onClick={() => setStatus(r.id, "pending")}
                    className="rounded-full border border-ink/15 px-4 py-1.5 text-ink/70 hover:bg-ink/5"
                  >
                    Send back to pending
                  </button>
                )}
                <button
                  onClick={() => remove(r.id)}
                  className="ml-auto rounded-full px-3 py-1.5 text-red-700 hover:bg-red-50"
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
