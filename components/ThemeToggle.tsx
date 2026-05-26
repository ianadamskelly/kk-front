"use client";

import type { Theme } from "@/lib/theme";

interface Props {
  theme: Theme;
  onToggle: () => void;
  className?: string;
}

// ThemeToggle is a small icon button — sun in dark mode, moon in
// light mode — clicked to flip between the two. Stateless; the
// caller owns the theme state via lib/theme.
export default function ThemeToggle({ theme, onToggle, className = "" }: Props) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:border-brand-400 hover:text-ink ${className}`}
    >
      {isDark ? (
        // Sun
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
