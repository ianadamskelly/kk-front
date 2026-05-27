"use client";

import { useCallback, useEffect, useState } from "react";
import { type Review, type ReviewsResponse } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";

interface Props {
  entityType: "product" | "course";
  /** Slug used in the public list endpoint URL. */
  entitySlug: string;
  /** Numeric id used when submitting a new review. */
  entityId: number;
  /** Human label used in the empty state, e.g. "this product" / "this course". */
  noun?: string;
}

// Stars renders rating as a row of filled / empty stars. interactive=true
// lets the user click to pick a value (for the write form).
function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const interactive = !!onChange;
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={interactive ? () => onChange?.(n) : undefined}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className={`text-lg leading-none ${
            n <= value ? "text-brand-500" : "text-ink/20"
          } ${interactive ? "cursor-pointer hover:scale-110 transition" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function relativeDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Reviews({
  entityType,
  entitySlug,
  entityId,
  noun = entityType === "product" ? "this product" : "this course",
}: Props) {
  const { user } = useCustomer();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const path =
    entityType === "product"
      ? `/api/products/${entitySlug}/reviews`
      : `/api/courses/${entitySlug}/reviews`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // customerFetch always includes credentials so a signed-in
      // viewer's session cookie is sent and the server can attach
      // `mine` (their own review) to the response.
      const res = await customerFetch(path);
      const json = (await res.json()) as ReviewsResponse;
      setData(json);
      if (json.mine) {
        setRating(json.mine.rating);
        setBody(json.mine.body);
      }
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating < 1) {
      setError("Please pick a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await customerFetch(`/api/account/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          rating,
          body,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not save your review");
      // Re-fetch so the list (and the "your review is pending" banner) refresh.
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your review");
    } finally {
      setSubmitting(false);
    }
  };

  const removeOwn = async () => {
    if (!data?.mine || !user) return;
    if (!confirm("Delete your review?")) return;
    await customerFetch(`/api/account/reviews/${data.mine.id}`, {
      method: "DELETE",
    });
    setRating(0);
    setBody("");
    load();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/50">
        Loading reviews…
      </div>
    );
  }
  if (!data) return null;

  const summary = data.summary;
  const showForm = !!user && data.canReview;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
        <div className="flex items-center gap-2 text-sm text-ink/60">
          <Stars value={Math.round(summary.averageRating)} />
          <span className="font-medium text-ink">
            {summary.count > 0 ? summary.averageRating.toFixed(1) : "—"}
          </span>
          <span className="text-ink/45">
            ({summary.count} review{summary.count === 1 ? "" : "s"})
          </span>
        </div>
      </header>

      {/* Write / edit form (verified buyers only). */}
      {showForm && (
        <form
          onSubmit={submit}
          className="space-y-3 rounded-2xl border border-ink/10 bg-white p-5"
        >
          <p className="text-sm font-semibold text-ink">
            {data.mine ? "Update your review" : "Write a review"}
          </p>
          {data.mine?.status === "pending" && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Your review is awaiting moderation. It&apos;ll appear publicly once
              approved.
            </p>
          )}
          {data.mine?.status === "rejected" && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              Your last submission wasn&apos;t approved. Feel free to revise and
              try again.
            </p>
          )}
          <div>
            <Stars value={rating} onChange={setRating} />
          </div>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`What did you think of ${noun}?`}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {submitting ? "Saving…" : data.mine ? "Update review" : "Post review"}
            </button>
            {data.mine && (
              <button
                type="button"
                onClick={removeOwn}
                className="text-sm text-red-700 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {!showForm && !user && (
        <p className="text-sm text-ink/55">
          Sign in and complete a purchase to leave a review.
        </p>
      )}
      {!showForm && user && !data.canReview && !data.mine && (
        <p className="text-sm text-ink/55">
          Verified buyers can leave a review. Reviews appear here once approved.
        </p>
      )}

      {/* Public list */}
      {data.reviews.length === 0 ? (
        <p className="text-sm text-ink/50">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="space-y-4">
          {data.reviews.map((r: Review) => (
            <li
              key={r.id}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-sm font-medium text-ink">
                    {r.authorName || "Anonymous"}
                  </span>
                </div>
                <time className="text-xs text-ink/45">
                  {relativeDate(r.createdAt)}
                </time>
              </div>
              {r.body && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">
                  {r.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
