// TrustLogoStrip is the "as seen in / trusted by" row that appears
// beneath the home hero. Without real client logos to ship we use a
// set of abstract brand SVG marks paired with placeholder wordmarks.
// Each mark uses currentColor so it picks up the muted-ink tone of the
// surrounding text and feels like a unified strip rather than a
// rainbow of mismatched logos.
//
// Replace the entries below with real client logos when available.

import { type ReactNode } from "react";

interface BrandMark {
  name: string;
  glyph: ReactNode;
}

const MARKS: BrandMark[] = [
  {
    name: "Loomify",
    glyph: (
      <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
        <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
        <path d="M9 14h10M14 9v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Northwave",
    glyph: (
      <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
        <path
          d="M4 18c4-8 8 8 12 0s4 4 8-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Atlas&Co",
    glyph: (
      <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
        <path
          d="M4 22 14 4l10 18H4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="16" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Pixelroot",
    glyph: (
      <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
        <rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="15" y="15" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="15" y="4" width="9" height="9" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Verdant",
    glyph: (
      <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
        <path
          d="M14 4c6 4 8 8 8 12a8 8 0 0 1-16 0c0-4 2-8 8-12z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M14 6v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Karibu",
    glyph: (
      <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9 14h10M14 9l-3 5 3 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function TrustLogoStrip() {
  return (
    <div className="border-y border-ink/10 bg-cream/40 py-7">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-ink/40">
          Trusted by teams across Africa
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-ink/40">
          {MARKS.map((m) => (
            <span
              key={m.name}
              className="inline-flex items-center gap-2 text-base font-semibold tracking-tight transition hover:text-ink/70"
              aria-label={m.name}
            >
              {m.glyph}
              <span>{m.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
