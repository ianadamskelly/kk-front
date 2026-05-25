"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch, formatPrice } from "@/lib/api";
import { getToken } from "@/lib/auth";

const CARDS: { key: string; label: string; endpoint: string; href: string }[] =
  [
    { key: "posts", label: "Insights", endpoint: "/api/admin/posts", href: "/admin/posts" },
    { key: "services", label: "Services", endpoint: "/api/admin/services", href: "/admin/services" },
    { key: "projects", label: "Projects", endpoint: "/api/admin/projects", href: "/admin/projects" },
    { key: "team", label: "Team", endpoint: "/api/admin/team", href: "/admin/team" },
    { key: "testimonials", label: "Testimonials", endpoint: "/api/admin/testimonials", href: "/admin/testimonials" },
    { key: "products", label: "Products", endpoint: "/api/admin/products", href: "/admin/products" },
    { key: "orders", label: "Orders", endpoint: "/api/admin/orders", href: "/admin/orders" },
    { key: "courses", label: "Courses", endpoint: "/api/admin/courses", href: "/admin/courses" },
    { key: "memberships", label: "Members", endpoint: "/api/admin/memberships", href: "/admin/memberships" },
    { key: "library", label: "Library", endpoint: "/api/admin/library", href: "/admin/library" },
    { key: "submissions", label: "Messages", endpoint: "/api/admin/submissions", href: "/admin/submissions" },
  ];

interface RevenueSummary {
  shopCents: number;
  coursesCents: number;
  membershipsCents: number;
  servicesCents: number;
  totalCents: number;
}

const REVENUE_BUCKETS: {
  key: keyof Omit<RevenueSummary, "totalCents">;
  label: string;
  href: string;
  hint: string;
}[] = [
  { key: "shopCents", label: "Shop", href: "/admin/orders", hint: "Confirmed product orders" },
  { key: "coursesCents", label: "Courses", href: "/admin/orders", hint: "Individual course purchases" },
  { key: "membershipsCents", label: "Memberships", href: "/admin/memberships", hint: "Monthly subscriptions" },
  { key: "servicesCents", label: "Services", href: "/admin/service-revenue", hint: "Manually logged service income" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = getToken() || "";
      const result: Record<string, number> = {};
      await Promise.all(
        CARDS.map(async (card) => {
          try {
            const res = await adminFetch(card.endpoint, token);
            if (!res.ok) return;
            const data = await res.json();
            result[card.key] = Array.isArray(data)
              ? data.length
              : (data.total ?? 0);
          } catch {
            // Leave the count unset if the request fails.
          }
        }),
      );
      setCounts(result);
      try {
        const res = await adminFetch("/api/admin/revenue", token);
        if (res.ok) setRevenue(await res.json());
      } catch {
        // Leave revenue null if the request fails.
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Dashboard
      </h1>
      <p className="text-sm text-ink/50">
        Manage every part of the Kuza Kizazi website from here.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-ink/40">
        Revenue
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REVENUE_BUCKETS.map((b) => (
          <Link
            key={b.key}
            href={b.href}
            className="rounded-2xl border border-ink/10 bg-white p-5 transition hover:border-brand-200 hover:shadow-md"
          >
            <p className="text-sm text-ink/50">{b.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {loading || !revenue ? "…" : formatPrice(revenue[b.key])}
            </p>
            <p className="mt-1 text-xs text-ink/45">{b.hint}</p>
          </Link>
        ))}
      </div>
      {revenue && (
        <p className="mt-2 text-xs text-ink/45">
          Total income across all sources:{" "}
          <span className="font-semibold text-ink/70">
            {formatPrice(revenue.totalCents)}
          </span>
        </p>
      )}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink/40">
        Content
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-2xl border border-ink/10 bg-white p-6 transition hover:border-brand-200 hover:shadow-md"
          >
            <p className="text-sm text-ink/50">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">
              {loading ? "…" : (counts[card.key] ?? 0)}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink/40">
        Quick actions
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New insight
        </Link>
        <Link
          href="/admin/projects"
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
        >
          Add a project
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
        >
          Edit site settings
        </Link>
      </div>
    </div>
  );
}
