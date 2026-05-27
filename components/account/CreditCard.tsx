"use client";

import { useEffect, useState } from "react";
import { formatPrice, formatDate } from "@/lib/api";
import { customerFetch } from "@/lib/customer";

interface CreditTx {
  id: number;
  amountCents: number;
  reason: string;
  note: string;
  createdAt: string;
}

interface CreditData {
  balanceCents: number;
  transactions: CreditTx[];
}

const REASON_LABELS: Record<string, string> = {
  referral_reward: "Referral reward",
  order_spend: "Spent at checkout",
  admin_grant: "Admin grant",
  refund: "Refund",
};

// CreditCard shows the customer's store-credit balance and recent ledger
// entries. The balance is also applied at checkout — this is the
// transparency surface.
export default function CreditCard() {
  const [data, setData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerFetch(`/api/account/credit`)
      .then(async (res) => (res.ok ? ((await res.json()) as CreditData) : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink/55">
        Loading store credit…
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Store credit
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            Apply your balance to any purchase at checkout — shop, courses,
            membership.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-ink">
            {formatPrice(data.balanceCents)}
          </p>
          <p className="text-xs text-ink/55">available</p>
        </div>
      </div>

      {data.transactions.length === 0 ? (
        <p className="mt-4 text-sm text-ink/55">
          No transactions yet. Refer a friend or wait for a credit from us.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/[0.06] border-t border-ink/[0.06]">
          {data.transactions.slice(0, 8).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-ink">
                  {REASON_LABELS[t.reason] || t.reason}
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
    </div>
  );
}
