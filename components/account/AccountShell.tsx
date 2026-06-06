"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCustomer } from "@/lib/customer";
import { LoadingBlock } from "@/components/Spinner";

// AccountShell is the sidebar-layout container used by every /account/*
// page. It owns the auth redirect, picks up `useCustomer`, and renders
// the navigation + page content. Children render to the right of the
// sidebar at any width above `md`; below that the sidebar collapses to
// a horizontal scroller of pill links.

const NAV: { href: string; label: string; icon: string }[] = [
  { href: "/account", label: "Dashboard", icon: "🏠" },
  { href: "/account/orders", label: "My Orders", icon: "🧾" },
  { href: "/account/downloads", label: "My Downloads", icon: "⬇️" },
  { href: "/account/assets", label: "My Tools", icon: "✍️" },
  { href: "/account/courses", label: "My Courses", icon: "🎓" },
  { href: "/account/certificates", label: "My Certificates", icon: "🎖️" },
  { href: "/account/tickets", label: "Complaints", icon: "💬" },
  { href: "/account/testimonials", label: "Testimonials", icon: "⭐" },
  { href: "/account/profile", label: "Profile Settings", icon: "👤" },
];

export default function AccountShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useCustomer();

  // Redirect signed-out visitors to sign-in, preserving the page they
  // were trying to reach so they bounce back after authenticating.
  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/signin?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <LoadingBlock label="Loading your account…" />
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) + horizontal pills (mobile) */}
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="hidden md:block">
          <div className="mb-4 rounded-2xl border border-ink/10 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Account
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink">
              {user.name}
            </p>
            <p className="truncate text-xs text-ink/55">{user.email}</p>
          </div>
          <nav className="space-y-0.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                  isActive(item.href)
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-ink/65 hover:bg-ink/[0.03] hover:text-ink"
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-6 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>

        {/* Mobile: horizontal scroll of pill links */}
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive(item.href)
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-ink/15 bg-white text-ink/65 hover:border-brand-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
