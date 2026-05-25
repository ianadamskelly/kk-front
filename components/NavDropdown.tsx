"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// NavDropdown is the click-to-open menu used in the primary nav for
// groups like "Work" and "Learn". Click toggles, Escape closes, click
// outside closes. Route changes also close it (handled via pathname
// effect) so the menu doesn't linger after a link click.

interface DropdownItem {
  href: string;
  label: string;
  description?: string;
}

interface Props {
  label: string;
  items: DropdownItem[];
}

export default function NavDropdown({ label, items }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Auto-close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Click-outside + Escape to close.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // A dropdown is "active" if any of its child routes match the URL.
  const isActive = items.some((i) =>
    i.href === "/" ? pathname === "/" : pathname.startsWith(i.href.split("#")[0]),
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1 text-sm font-medium transition ${
          isActive || open
            ? "text-brand-600"
            : "text-ink/60 hover:text-ink"
        }`}
      >
        {label}
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M2 4 l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="kk-fade-up absolute left-0 top-full z-50 mt-3 min-w-64 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lg ring-1 ring-ink/5"
        >
          <ul className="py-2">
            {items.map((item) => (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  className="block px-4 py-2.5 transition hover:bg-brand-50"
                  onClick={() => setOpen(false)}
                >
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-ink/55">
                      {item.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export type { DropdownItem };
