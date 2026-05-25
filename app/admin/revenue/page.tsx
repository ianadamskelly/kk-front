"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch, formatPrice } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { LoadingBlock } from "@/components/Spinner";

interface RevenueSummary {
  shopCents: number;
  coursesCents: number;
  membershipsCents: number;
  servicesCents: number;
  totalCents: number;
}

const BUCKETS: {
  key: keyof Omit<RevenueSummary, "totalCents">;
  label: string;
  href: string;
  source: string;
}[] = [
  {
    key: "shopCents",
    label: "Shop",
    href: "/admin/orders",
    source: "Confirmed product orders (orders with kind=shop)",
  },
  {
    key: "coursesCents",
    label: "Courses",
    href: "/admin/orders",
    source: "Individual course purchases (orders with kind=course)",
  },
  {
    key: "membershipsCents",
    label: "Memberships",
    href: "/admin/memberships",
    source: "Monthly subscription payments (orders with kind=membership)",
  },
  {
    key: "servicesCents",
    label: "Services",
    href: "/admin/service-revenue",
    source: "Manually logged service income",
  },
];

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/revenue", getToken() || "");
        if (!res.ok) throw new Error("Failed to load revenue");
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Revenue</h1>
      <p className="text-sm text-ink/50">
        Total income broken down by source. Online figures sum confirmed
        payments; service income comes from manual entries.
      </p>

      {loading && <LoadingBlock label="Crunching the numbers…" />}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      {data && (
        <>
          <div className="mt-6 rounded-3xl border border-brand-200 bg-brand-50/40 p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Total income
            </p>
            <p className="mt-2 text-4xl font-semibold text-ink">
              {formatPrice(data.totalCents)}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {BUCKETS.map((b) => (
              <Link
                key={b.key}
                href={b.href}
                className="rounded-2xl border border-ink/10 bg-white p-5 transition hover:border-brand-200 hover:shadow-md"
              >
                <p className="text-sm text-ink/55">{b.label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatPrice(data[b.key])}
                </p>
                <p className="mt-1 text-xs text-ink/45">{b.source}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
