"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// InsightsSearch is the debounced search input that drives the existing
// ?q= filter on /insights. Typing waits ~300ms before updating the URL
// so we don't hammer the API on every keystroke. Hitting Enter forces
// an immediate update; pressing Escape clears the input.

export default function InsightsSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const initial = search.get("q") || "";
  const [value, setValue] = useState(initial);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync if the user navigates via the chips below.
  useEffect(() => {
    setValue(initial);
  }, [initial]);

  const push = (q: string) => {
    const params = new URLSearchParams(search.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    // Reset to page 1 on any query change.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const onChange = (next: string) => {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(next), 300);
  };

  return (
    <form
      role="search"
      className="relative flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        push(value);
      }}
    >
      {/* Search icon */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="m20 20-3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.currentTarget.blur();
            onChange("");
          }
        }}
        placeholder="Search insights — topics, ideas, authors…"
        className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-brand-500"
        aria-label="Search insights"
      />

      {/* Clear button (only shown when there's text) */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-ink/45 hover:bg-ink/5 hover:text-ink/70"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
