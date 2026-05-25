"use client";

import { useEffect, useState } from "react";
import { adminFetch, formatPrice, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

interface MembershipRow {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: "active" | "expired" | "cancelled";
  startedAt: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  totalPaidCents: number;
}

function isActive(m: MembershipRow): boolean {
  return m.status === "active" && new Date(m.currentPeriodEnd) > new Date();
}

const TONE = {
  active: "bg-emerald-100 text-emerald-800",
  expired: "bg-ink/10 text-ink/50",
  cancelled: "bg-amber-100 text-amber-800",
};

export default function AdminMembershipsPage() {
  const [rows, setRows] = useState<MembershipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/memberships", getToken() || "");
        if (!res.ok) throw new Error("Failed to load members");
        setRows((await res.json()) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeCount = rows.filter(isActive).length;
  const lifetimeCents = rows.reduce((sum, m) => sum + m.totalPaidCents, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Members</h1>
      <p className="text-sm text-ink/50">
        Everyone who has ever subscribed. Renewals extend the current period
        end forward by 30 days.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-sm text-ink/50">Active right now</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {loading ? "…" : activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-sm text-ink/50">Total subscribers</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {loading ? "…" : rows.length}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-sm text-ink/50">Lifetime revenue</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {loading ? "…" : formatPrice(lifetimeCents)}
          </p>
        </div>
      </div>

      {loading && <LoadingBlock label="Loading members…" />}
      {error && <p className="mt-8 text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="⭐"
          title="No members yet"
          description="Customers who subscribe to the membership plan will appear here."
        />
      )}

      {rows.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-left text-xs uppercase tracking-widest text-ink/45">
              <tr>
                <th className="px-4 py-2.5">Member</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Renews through</th>
                <th className="px-4 py-2.5">Started</th>
                <th className="px-4 py-2.5 text-right">Lifetime paid</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const effective = isActive(m)
                  ? "active"
                  : m.status === "cancelled"
                    ? "cancelled"
                    : "expired";
                return (
                  <tr key={m.id} className="border-t border-ink/5">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {m.userName || "—"}
                      </p>
                      <a
                        href={`mailto:${m.userEmail}`}
                        className="text-xs text-ink/55 hover:text-brand-600"
                      >
                        {m.userEmail}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[effective]}`}
                      >
                        {effective}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {formatDate(m.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-3 text-ink/55">
                      {formatDate(m.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {formatPrice(m.totalPaidCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
