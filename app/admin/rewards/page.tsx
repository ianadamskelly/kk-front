"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatPrice, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAdminSession } from "@/lib/adminSession";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

interface ReferralRow {
  userId: number;
  name: string;
  email: string;
  referralCode: string;
  total: number;
  rewarded: number;
}

interface CreditTx {
  id: number;
  userId: number;
  amountCents: number;
  reason: string;
  relatedUserId: number | null;
  relatedOrderId: number | null;
  note: string;
  createdAt: string;
}

interface Overview {
  rewardCents: number;
  topReferrers: ReferralRow[];
  recentCredit: CreditTx[];
}

const REASON_LABELS: Record<string, string> = {
  referral_reward: "Referral reward",
  order_spend: "Spent at checkout",
  admin_grant: "Admin grant",
  refund: "Refund",
};

export default function AdminRewardsPage() {
  const { can } = useAdminSession();
  const canTuneSettings = can("settings.manage");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rewardInput, setRewardInput] = useState("");
  const [savingReward, setSavingReward] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/rewards", getToken() || "");
      if (!res.ok) throw new Error("Failed to load rewards");
      const data: Overview = await res.json();
      setOverview(data);
      setRewardInput(String(data.rewardCents / 100));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveReward = async () => {
    setSavingReward(true);
    try {
      const cents = Math.round(Number(rewardInput || 0) * 100);
      // Fetch current settings, patch our key, send the whole map back —
      // matches how /admin/settings works elsewhere in the app.
      const cur = await adminFetch("/api/admin/settings", getToken() || "");
      const map = cur.ok ? await cur.json() : {};
      map.referral_reward_cents = String(cents);
      const res = await adminFetch("/api/admin/settings", getToken() || "", {
        method: "PUT",
        body: JSON.stringify(map),
      });
      if (res.ok) {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
        load();
      }
    } finally {
      setSavingReward(false);
    }
  };

  if (loading)
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <LoadingBlock label="Loading rewards…" />
      </div>
    );
  if (error || !overview)
    return (
      <p className="mx-auto max-w-3xl px-6 py-12 text-red-600">
        {error || "Couldn't load rewards"}
      </p>
    );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Referrals &amp; store credit
      </h1>
      <p className="text-sm text-ink/50">
        Every customer gets a referral link. When their referee&apos;s first
        paid order is confirmed, they earn store credit they can spend on
        anything you sell.
      </p>

      <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
          Referral reward
        </h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium text-ink/70">
              KSh per successful referral
            </label>
            <input
              type="number"
              min={0}
              value={rewardInput}
              disabled={!canTuneSettings || savingReward}
              onChange={(e) => setRewardInput(e.target.value)}
              className="mt-1 w-40 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          {canTuneSettings && (
            <button
              onClick={saveReward}
              disabled={savingReward}
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {savingReward ? "Saving…" : "Save reward"}
            </button>
          )}
          {savedFlash && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Saved
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-ink/45">
          Currently {formatPrice(overview.rewardCents)} per successful referral.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-ink/45">
          Top referrers
        </h2>
        {overview.topReferrers.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon="🤝"
            title="No referrals yet"
            description="Share the love — every user can find their referral link on their account page."
          />
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3 text-right">Referrals</th>
                  <th className="px-4 py-3 text-right">Rewarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.06]">
                {overview.topReferrers.map((r) => (
                  <tr key={r.userId}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{r.name || "—"}</p>
                      <p className="text-xs text-ink/55">{r.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/65">
                      {r.referralCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink/85">
                      {r.total}
                    </td>
                    <td className="px-4 py-3 text-right text-ink/65">
                      {r.rewarded}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-ink/45">
          Recent credit activity
        </h2>
        {overview.recentCredit.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon="💰"
            title="No credit transactions yet"
            description="Earnings, spends, and grants will land here as they happen."
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {overview.recentCredit.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">
                    {REASON_LABELS[t.reason] || t.reason}{" "}
                    <span className="text-ink/45">· user #{t.userId}</span>
                  </p>
                  <p className="text-xs text-ink/45">
                    {formatDate(t.createdAt)}
                    {t.note && ` · ${t.note}`}
                  </p>
                </div>
                <span
                  className={`font-semibold ${t.amountCents >= 0 ? "text-emerald-700" : "text-red-700"}`}
                >
                  {t.amountCents >= 0 ? "+" : ""}
                  {formatPrice(Math.abs(t.amountCents))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
