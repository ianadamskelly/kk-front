"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatPrice, formatDate, Order } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

const STATUSES = ["pending", "confirmed", "fulfilled", "cancelled"];

const STATUS_TONE: Record<string, string> = {
  pending: "bg-brand-100 text-brand-700",
  confirmed: "bg-blue-100 text-blue-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-ink/10 text-ink/50",
};

const KIND_FILTERS = [
  { value: "all", label: "All" },
  { value: "shop", label: "Shop" },
  { value: "course", label: "Courses" },
  { value: "membership", label: "Memberships" },
];

const KIND_TONE: Record<string, string> = {
  shop: "bg-amber-100 text-amber-800",
  course: "bg-violet-100 text-violet-800",
  membership: "bg-emerald-100 text-emerald-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/orders", getToken() || "");
      if (!res.ok) throw new Error("Failed to load orders");
      setOrders((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (order: Order, status: string) => {
    const res = await adminFetch(
      `/api/admin/orders/${order.id}`,
      getToken() || "",
      { method: "PUT", body: JSON.stringify({ status }) },
    );
    if (res.ok) {
      setOrders((list) =>
        list.map((o) =>
          o.id === order.id
            ? { ...o, status: status as Order["status"] }
            : o,
        ),
      );
    }
  };

  const remove = async (order: Order) => {
    if (!confirm(`Delete order #${order.id}?`)) return;
    const res = await adminFetch(
      `/api/admin/orders/${order.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setOrders((list) => list.filter((o) => o.id !== order.id));
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Orders</h1>
      <p className="text-sm text-ink/50">
        Purchase requests placed through the shop checkout.
      </p>

      <div className="mt-5 inline-flex rounded-full border border-ink/15 p-1">
        {KIND_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setKindFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              kindFilter === f.value
                ? "bg-brand-500 text-white"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <LoadingBlock label="Loading orders…" />}
      {error && <p className="mt-8 text-red-600">{error}</p>}
      {(() => {
        const visible = orders.filter(
          (o) => kindFilter === "all" || (o.kind || "shop") === kindFilter,
        );
        if (!loading && !error && visible.length === 0) {
          return (
            <EmptyState
              className="mt-8"
              icon="📦"
              title="No orders in this view"
              description="Confirmed orders will appear here once customers complete a purchase."
            />
          );
        }
        if (loading || visible.length === 0) return null;
        return (
          <ul className="mt-6 space-y-4">
            {visible.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    Order #{order.id} · {order.customerName}
                  </p>
                  <p className="text-sm text-ink/60">
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="hover:text-brand-600"
                    >
                      {order.customerEmail}
                    </a>
                    {order.customerPhone && ` · ${order.customerPhone}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      KIND_TONE[order.kind || "shop"] || KIND_TONE.shop
                    }`}
                  >
                    {order.kind || "shop"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_TONE[order.status] || STATUS_TONE.pending
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
                {order.items.map((item) => (
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

              {order.note && (
                <p className="mt-2 rounded-lg bg-ink/[0.03] px-3 py-2 text-sm text-ink/65">
                  Note: {order.note}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                <span className="text-xs text-ink/40">
                  {formatDate(order.createdAt)}
                </span>
                <span className="text-base font-semibold text-ink">
                  {formatPrice(order.totalCents)}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <select
                  value={order.status}
                  onChange={(e) => setStatus(order, e.target.value)}
                  className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remove(order)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
            ))}
          </ul>
        );
      })()}
    </div>
  );
}
