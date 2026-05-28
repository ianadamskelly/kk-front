"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useCustomer } from "@/lib/customer";
import NavDropdown, { type DropdownItem } from "./NavDropdown";

// Primary nav is intentionally shallow — 4 top-level items max, grouped
// where it makes sense (Work, Learn). The "Start a project" CTA covers
// the contact intent so /contact no longer needs a top-level slot.
// Everything else lives in the footer's Quick links.

const WORK_ITEMS: DropdownItem[] = [
  { href: "/about", label: "About", description: "Who we are and how we work" },
  {
    href: "/services",
    label: "Services",
    description: "Identity, platforms, content and growth",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    description: "Selected projects we've shipped",
  },
];

const LEARN_ITEMS: DropdownItem[] = [
  {
    href: "/courses",
    label: "Courses",
    description: "Project-based learning, lifetime access",
  },
  {
    href: "/library",
    label: "Library",
    description: "Members-only templates and guides",
  },
  {
    href: "/membership",
    label: "Membership",
    description: "Library from $1.90, full access $10",
  },
];

const SIMPLE_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/insights", label: "Insights" },
];

// Inline icon set so the header doesn't pull in an icon library for the
// two glyphs it needs.
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 7h14l-1.5 10a2 2 0 0 1-2 1.7H8.5A2 2 0 0 1 6.5 17L5 7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useCustomer();

  // Close the mobile sheet whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
          {SITE_NAME}
        </Link>

        {/* Primary nav — desktop only */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavDropdown label="Work" items={WORK_ITEMS} />
          <NavDropdown label="Learn" items={LEARN_ITEMS} />
          {SIMPLE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(item.href)
                  ? "text-sm font-medium text-brand-600"
                  : "text-sm font-medium text-ink/60 transition hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: account icon, cart icon, CTA */}
        <div className="flex items-center gap-2">
          <Link
            href={user ? "/account" : "/signin"}
            aria-label={user ? `${user.name} — account` : "Sign in"}
            title={user ? user.name : "Sign in"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:border-brand-400 hover:text-ink"
          >
            <UserIcon />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart (${count} item${count === 1 ? "" : "s"})`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:border-brand-400 hover:text-ink"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <Link
            href="/contact"
            className="hidden rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 sm:inline-block"
          >
            Start a project
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-ink/15 p-2 md:hidden"
          >
            <span className="block h-0.5 w-5 bg-ink" />
            <span className="mt-1 block h-0.5 w-5 bg-ink" />
            <span className="mt-1 block h-0.5 w-5 bg-ink" />
          </button>
        </div>
      </div>

      {/* Mobile sheet — mirrors the desktop structure but flattens each
          dropdown into a labelled section so everything is one tap away. */}
      {open && (
        <nav className="border-t border-ink/10 bg-cream md:hidden">
          <div className="space-y-4 px-4 py-4">
            <MobileSection label="Work" items={WORK_ITEMS} />
            <MobileSection label="Learn" items={LEARN_ITEMS} />
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-widest text-ink/40">
                Discover
              </p>
              <div className="mt-1 flex flex-col">
                {SIMPLE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-2 py-2 text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-brand-50 text-brand-600"
                        : "text-ink/70 hover:bg-ink/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/contact"
              className="block rounded-full bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Start a project
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileSection({
  label,
  items,
}: {
  label: string;
  items: DropdownItem[];
}) {
  return (
    <div>
      <p className="px-2 text-xs font-semibold uppercase tracking-widest text-ink/40">
        {label}
      </p>
      <div className="mt-1 flex flex-col">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-2 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
