"use client";

import { useEffect, useState } from "react";
import { API_URL, formatPrice, formatDate } from "@/lib/api";

interface Referee {
  userId: number;
  name: string;
  email: string;
  joinedAt: string;
  rewarded: boolean;
  rewardedAt: string | null;
}

interface ReferralData {
  code: string;
  shareUrl: string;
  rewardCents: number;
  referees: Referee[];
  totalReferrals: number;
  rewardedCount: number;
}

// ReferralsCard shows the customer's referral link plus the people
// they've referred. The list is read-only — backend handles the reward
// flow when a referee makes their first paid order.
export default function ReferralsCard({ token }: { token: string }) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/account/referrals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => (res.ok ? ((await res.json()) as ReferralData) : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [token]);

  const copy = () => {
    if (!data) return;
    navigator.clipboard
      ?.writeText(data.shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => alert(data.shareUrl));
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink/55">
        Loading referrals…
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Refer friends, earn credit
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            Share your link. When someone signs up and makes their first paid
            purchase, you get {formatPrice(data.rewardCents)} in store credit.
          </p>
        </div>
        <div className="text-right text-xs text-ink/55">
          <p className="text-2xl font-semibold text-ink">
            {data.rewardedCount}
          </p>
          <p>rewarded</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-ink/5 px-3 py-2 text-xs text-ink/75">
          {data.shareUrl}
        </code>
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-brand-500 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p className="mt-1 text-xs text-ink/45">
        Your code: <span className="font-mono">{data.code}</span> ·{" "}
        {data.totalReferrals} total signup{data.totalReferrals === 1 ? "" : "s"}
      </p>

      {data.referees.length > 0 && (
        <ul className="mt-5 divide-y divide-ink/[0.06] border-t border-ink/[0.06]">
          {data.referees.map((r) => (
            <li
              key={r.userId}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {r.name || r.email}
                </p>
                <p className="text-xs text-ink/45">
                  Joined {formatDate(r.joinedAt)}
                </p>
              </div>
              {r.rewarded ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                  Reward earned
                </span>
              ) : (
                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink/55">
                  Awaiting first purchase
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
