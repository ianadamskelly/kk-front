"use client";

import { useCallback, useEffect, useState } from "react";
import { useCustomer, customerFetch } from "@/lib/customer";
import { Order, formatPrice, formatDate } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";
import AccountShell from "@/components/account/AccountShell";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-brand-100 text-brand-700",
  confirmed: "bg-blue-100 text-blue-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-ink/10 text-ink/50",
};

export default function AccountOrdersPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { user } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await customerFetch(`/api/account/orders`);
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
        <p className="mt-1 text-sm text-ink/55">
          Every order you&apos;ve placed. Click an order to see its receipt.
        </p>
      </header>

      {loading ? (
        <LoadingBlock label="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="You haven't placed any orders yet. Have a look at what's in the shop."
          action={{ href: "/shop", label: "Browse the shop" }}
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-ink">Order #{o.id}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_TONE[o.status] || STATUS_TONE.pending
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <p className="text-xs text-ink/45">
                Placed on {formatDate(o.createdAt)}
              </p>
              <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
                {o.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="text-ink/70">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-ink">
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                <span className="text-sm text-ink/55">Total</span>
                <span className="text-base font-semibold text-ink">
                  {formatPrice(o.totalCents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
