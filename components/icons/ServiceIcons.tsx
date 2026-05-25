// ServiceIcons maps a service's slug/title fragment to a proper SVG
// icon, replacing the single-character text glyphs the seed initially
// shipped with. Falls back to a generic spark icon when no match —
// admins can keep adding new services without us having to wire up new
// icons immediately.

import { type ReactNode } from "react";

interface IconProps {
  className?: string;
}

function Branding({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function GraphicDesign({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 17.5 14 6.5l3.5 3.5L6.5 21H3v-3.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m15 5.5 1.5-1.5a2 2 0 0 1 2.8 0L21 5.7a2 2 0 0 1 0 2.8L19.5 10 15 5.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WebDev({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="6.5" r="0.7" fill="currentColor" />
      <circle cx="8.5" cy="6.5" r="0.7" fill="currentColor" />
      <path d="M9 13l-2 2 2 2M15 13l2 2-2 2M13 12l-2 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnimationVideo({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m17 9 4-2v10l-4-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 9v6l5-3z" fill="currentColor" />
    </svg>
  );
}

function Photo({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Merch({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 5h12l3 5-3 3v8H6v-8L3 10l3-5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 5a2 2 0 1 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SocialPresence({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 10.5 7-3.5M8.5 13.5l7 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Marketing({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 13V9a1 1 0 0 1 1-1h4l9-4v16L8 16H4a1 1 0 0 1-1-1v-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M17 9a3 3 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Spark({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v6m0 6v6m-9-9h6m6 0h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// Match a service to its icon by keyword. Order matters — the most
// specific match should come first (e.g. "graphic design" before
// "design").
const MATCHERS: { test: RegExp; render: (p: IconProps) => ReactNode }[] = [
  { test: /graphic\s*design|design$/i, render: GraphicDesign },
  { test: /brand/i, render: Branding },
  { test: /web|develop/i, render: WebDev },
  { test: /animation|video|motion/i, render: AnimationVideo },
  { test: /photo/i, render: Photo },
  { test: /merch|print|apparel/i, render: Merch },
  { test: /online presence|social|community/i, render: SocialPresence },
  { test: /market/i, render: Marketing },
];

// ServiceIcon picks an SVG by matching the service title (or slug).
// Falls back to the spark icon when nothing matches.
export default function ServiceIcon({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  for (const m of MATCHERS) {
    if (m.test.test(title)) {
      return <>{m.render({ className })}</>;
    }
  }
  return <Spark className={className} />;
}
