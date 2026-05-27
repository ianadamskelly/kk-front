"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice, formatDate, imageUrl } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

interface DashboardData {
  stats: {
    coursesCount: number;
    ordersCount: number;
    openTicketsCount: number;
    creditCents: number;
    membershipStatus: "guest" | "member" | "expired";
    membershipActive: boolean;
    periodEnd: string | null;
  };
  continueLearning: {
    id: number;
    slug: string;
    title: string;
    coverImage: string;
    level: string;
    duration: string;
  } | null;
  recentActivity: {
    kind: string;
    title: string;
    subtitle: string;
    href: string;
    timestamp: string;
  }[];
}

export default function AccountDashboardPage() {
  return (
    <AccountShell>
      <Dashboard />
    </AccountShell>
  );
}

function Dashboard() {
  const { user } = useCustomer();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    customerFetch(`/api/account/dashboard`)
      .then(async (r) => (r.ok ? ((await r.json()) as DashboardData) : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingBlock label="Loading dashboard…" />;
  if (!data) return <p className="text-sm text-red-600">Couldn&apos;t load dashboard.</p>;

  const s = data.stats;
  const statusLabel =
    s.membershipStatus === "member"
      ? "MEMBER"
      : s.membershipStatus === "expired"
        ? "EXPIRED"
        : "BASIC";
  const statusTone =
    s.membershipStatus === "member"
      ? "bg-emerald-100 text-emerald-800"
      : s.membershipStatus === "expired"
        ? "bg-amber-100 text-amber-800"
        : "bg-ink/10 text-ink/65";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Main column */}
      <div className="space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Welcome back,{" "}
            <span className="font-semibold text-ink">{user?.name}</span>!
          </p>
        </header>

        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Courses" value={String(s.coursesCount)} sub="Enrolled" />
          <Stat
            label="Credit"
            value={formatPrice(s.creditCents)}
            sub="Available"
          />
          <Stat
            label="Orders"
            value={String(s.ordersCount)}
            sub="All time"
          />
          <Stat
            label="Status"
            value={statusLabel}
            tone={statusTone}
            sub={
              s.periodEnd && s.membershipActive
                ? `until ${formatDate(s.periodEnd)}`
                : s.membershipStatus === "expired"
                  ? "renew now"
                  : "free tier"
            }
          />
        </div>

        {/* Continue Learning */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-ink/65">
            <span className="inline-block h-3 w-1 rounded-full bg-brand-500" />
            Continue Learning
          </h2>
          <div className="mt-3 rounded-2xl border border-ink/10 bg-white p-6">
            {data.continueLearning ? (
              <Link
                href={`/courses/${data.continueLearning.slug}`}
                className="flex items-center gap-4 transition hover:opacity-90"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                  {data.continueLearning.coverImage ? (
                    <img
                      src={imageUrl(data.continueLearning.coverImage)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 font-semibold text-brand-400">
                      {data.continueLearning.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {data.continueLearning.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/55">
                    {data.continueLearning.level}
                    {data.continueLearning.duration &&
                      ` · ${data.continueLearning.duration}`}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-brand-600">
                    Resume course →
                  </p>
                </div>
              </Link>
            ) : (
              <EmptyState
                variant="inline"
                icon="🎓"
                title="Ready to start?"
                description="Explore our curriculum and find your next breakthrough."
                action={{ href: "/courses", label: "Explore courses" }}
              />
            )}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-ink/65">
            <span className="inline-block h-3 w-1 rounded-full bg-brand-500" />
            Recent Activity
          </h2>
          <div className="mt-3 rounded-2xl border border-ink/10 bg-white p-6">
            {data.recentActivity.length === 0 ? (
              <p className="text-center text-sm text-ink/40">
                NO RECENT UPDATES
              </p>
            ) : (
              <ul className="divide-y divide-ink/[0.06]">
                {data.recentActivity.map((a, i) => (
                  <li key={i} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={a.href}
                      className="flex items-center justify-between gap-3 transition hover:opacity-80"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {a.title}
                        </p>
                        <p className="text-xs text-ink/55">{a.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink/45">
                        {formatDate(a.timestamp)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Sidebar: Library + Resource Center */}
      <aside className="space-y-4">
        <LibraryCard membershipActive={s.membershipActive} />
        <ResourceCenter
          membershipActive={s.membershipActive}
          openTickets={s.openTicketsCount}
        />
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
        {label}
      </p>
      <p
        className={`mt-1 inline-block text-xl font-semibold ${
          tone ? `rounded-md px-2 py-0.5 text-sm ${tone}` : "text-ink"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}
    </div>
  );
}

function LibraryCard({ membershipActive }: { membershipActive: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-ink p-6 text-white">
      <div className="flex items-baseline justify-between">
        <p className="text-base font-semibold">Digital Library</p>
        <Link
          href="/library"
          className="text-xs font-bold uppercase tracking-widest text-brand-300 hover:text-brand-200"
        >
          Explore →
        </Link>
      </div>
      <div className="mt-5 flex flex-col items-center text-center">
        <span className="text-3xl">📚</span>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/55">
          {membershipActive ? "Library unlocked" : "Library is locked"}
        </p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-white/60">
        Your premium assets and resources are synchronised across your devices.
      </p>
      <Link
        href={membershipActive ? "/library" : "/membership"}
        className="mt-5 block rounded-full bg-brand-500 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white transition hover:bg-brand-600"
      >
        {membershipActive ? "Open library" : "Become a member"}
      </Link>
    </div>
  );
}

function ResourceCenter({
  membershipActive,
  openTickets,
}: {
  membershipActive: boolean;
  openTickets: number;
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-base">
          🧰
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Resource Center</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
            Growth &amp; support
          </p>
        </div>
      </div>
      {!membershipActive && (
        <Link
          href="/membership"
          className="mt-4 block rounded-2xl bg-brand-500 p-4 text-white transition hover:bg-brand-600"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Limited access
          </p>
          <p className="mt-0.5 text-base font-semibold">
            Upgrade to Membership 🚀
          </p>
        </Link>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
        <Link
          href="/account/tickets"
          className="rounded-xl border border-ink/10 bg-white px-3 py-3 font-semibold text-ink/65 hover:border-brand-300"
        >
          💬 Support
          {openTickets > 0 && (
            <span className="ml-1 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] text-white">
              {openTickets}
            </span>
          )}
        </Link>
        <Link
          href="/insights"
          className="rounded-xl border border-ink/10 bg-white px-3 py-3 font-semibold text-ink/65 hover:border-brand-300"
        >
          📰 Guide
        </Link>
      </div>
      <Link
        href="/about"
        className="mt-2 block rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-ink/65 hover:border-brand-300"
      >
        Our methodology
      </Link>
    </div>
  );
}
