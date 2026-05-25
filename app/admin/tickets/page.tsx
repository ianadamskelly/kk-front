"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminFetch, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

interface Ticket {
  id: number;
  userId: number;
  subject: string;
  category: string;
  status: "open" | "replied" | "closed";
  lastReplyAt: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  messageCount: number;
}

const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  replied: "bg-sky-100 text-sky-800",
  closed: "bg-ink/10 text-ink/55",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "open", label: "Needs reply" },
  { value: "replied", label: "Awaiting customer" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/tickets", getToken() || "");
      if (res.ok) setTickets(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Support tickets
      </h1>
      <p className="text-sm text-ink/50">
        Customer-raised complaints and questions. Reply from the thread view.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? tickets.length
              : tickets.filter((t) => t.status === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-ink/15 text-ink/65 hover:border-brand-300"
              }`}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-6">
          <SkeletonTableRows rows={4} columns={4} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon="💬"
          title="Inbox zero"
          description="No tickets match this filter. Customers can raise tickets from their account dashboard."
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Last reply</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer hover:bg-ink/[0.02]"
                  onClick={() => {
                    window.location.href = `/admin/tickets/${t.id}`;
                  }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tickets/${t.id}`}
                      className="font-medium text-ink hover:text-brand-600"
                    >
                      {t.subject}
                    </Link>
                    <p className="text-xs text-ink/45">
                      {t.messageCount} message{t.messageCount === 1 ? "" : "s"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink/65">
                    <p>{t.userName}</p>
                    <p className="text-xs text-ink/45">{t.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/55">{t.category}</td>
                  <td className="px-4 py-3 text-ink/55">
                    {formatDate(t.lastReplyAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_TONE[t.status]}`}
                    >
                      {t.status}
                    </span>
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
