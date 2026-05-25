"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, formatDate } from "@/lib/api";
import { useCustomer } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

interface Download {
  orderId: number;
  productId: number | null;
  productName: string;
  quantity: number;
  purchasedAt: string;
}

// "My Downloads" lists products from confirmed/fulfilled shop orders so
// the customer can find their purchases without scrolling through the
// orders list. Future-proofed for digital products: when a product has
// downloadable files attached, the link will resolve to those.
export default function AccountDownloadsPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { token } = useCustomer();
  const [items, setItems] = useState<Download[] | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/account/downloads`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => (r.ok ? ((await r.json()) as Download[]) : []))
      .then(setItems);
  }, [token]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">My downloads</h1>
        <p className="mt-1 text-sm text-ink/55">
          Products and digital resources from your confirmed orders.
        </p>
      </header>

      {items === null ? (
        <SkeletonTableRows rows={4} columns={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="⬇️"
          title="No downloads yet"
          description="When you buy a product or digital resource, it'll appear here for quick access."
          action={{ href: "/shop", label: "Visit the shop" }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Purchased</th>
                <th className="px-4 py-3 text-right">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {items.map((d, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {d.productName}
                    {d.quantity > 1 && (
                      <span className="ml-1 text-xs text-ink/45">
                        × {d.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/55">
                    {formatDate(d.purchasedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href="/account/orders"
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Order #{d.orderId} →
                    </Link>
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
