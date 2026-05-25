"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAdminSession } from "@/lib/adminSession";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

interface Subscriber {
  id: number;
  email: string;
  name: string;
  tags: string[];
  source: string;
  userId: number | null;
  unsubscribedAt: string | null;
  createdAt: string;
}

const TAG_TONE: Record<string, string> = {
  signup: "bg-brand-50 text-brand-700",
  newsletter: "bg-sky-50 text-sky-700",
  shop: "bg-emerald-50 text-emerald-700",
  courses: "bg-violet-50 text-violet-700",
  course: "bg-violet-50 text-violet-700",
  membership: "bg-amber-50 text-amber-800",
  customer: "bg-ink/[0.06] text-ink/70",
  website: "bg-ink/[0.06] text-ink/70",
};

function tagClass(tag: string): string {
  return `inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
    TAG_TONE[tag] || "bg-ink/[0.06] text-ink/70"
  }`;
}

export default function AdminSubscribersPage() {
  const { can } = useAdminSession();
  const canManage = can("subscribers.manage");

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/subscribers", getToken() || "");
      if (!res.ok) throw new Error("Failed to load subscribers");
      setSubscribers((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of subscribers) {
      if (s.unsubscribedAt) continue;
      for (const t of s.tags) counts[t] = (counts[t] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [subscribers]);

  const filtered = useMemo(
    () => (filter ? subscribers.filter((s) => s.tags.includes(filter)) : subscribers),
    [filter, subscribers],
  );

  const remove = async (s: Subscriber) => {
    if (!confirm(`Remove ${s.email} from the list?`)) return;
    const res = await adminFetch(
      `/api/admin/subscribers/${s.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setSubscribers((list) => list.filter((x) => x.id !== s.id));
  };

  const activeTotal = subscribers.filter((s) => !s.unsubscribedAt).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Subscribers
          </h1>
          <p className="text-sm text-ink/50">
            Everyone on the mailing list. Tags show where they joined from —
            use them to target newsletters.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-ink">{activeTotal}</p>
          <p className="text-xs text-ink/55">active subscribers</p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {allTags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !filter
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-ink/15 text-ink/65 hover:border-brand-400"
            }`}
          >
            All · {subscribers.length}
          </button>
          {allTags.map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filter === tag
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-ink/15 text-ink/65 hover:border-brand-400"
              }`}
            >
              {tag} · {count}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6">
          <SkeletonTableRows rows={6} columns={4} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="✉️"
          title={
            subscribers.length === 0
              ? "No subscribers yet"
              : "No subscribers match this tag"
          }
          description={
            subscribers.length === 0
              ? "Subscribers will appear here as people sign up or buy. Every new account is added automatically."
              : "Try another tag or clear the filter."
          }
          action={
            subscribers.length > 0 && filter
              ? { onClick: () => setFilter(""), label: "Clear filter" }
              : undefined
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-ink/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{s.email}</p>
                    {s.name && (
                      <p className="text-xs text-ink/55">{s.name}</p>
                    )}
                    {s.unsubscribedAt && (
                      <span className="mt-1 inline-block rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink/55">
                        unsubscribed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.tags.length === 0 ? (
                        <span className="text-xs text-ink/40">—</span>
                      ) : (
                        s.tags.map((t) => (
                          <span key={t} className={tagClass(t)}>
                            {t}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/55">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {canManage && (
                      <button
                        onClick={() => remove(s)}
                        className="text-sm text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    )}
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
