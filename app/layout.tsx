import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/api";

const DESCRIPTION =
  "Kuza Kizazi is a Nairobi creative agency crafting brands, websites, animation, and digital experiences that move people.";

export const metadata: Metadata = {
  // metadataBase makes every `images: "/og.png"`, `alternates.canonical:
  // "/insights"`, etc. resolve to absolute URLs — required for Open
  // Graph + Twitter cards to render correctly when shared.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Creative Agency in Nairobi`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  // The site map + robots files (app/sitemap.ts, app/robots.ts) are
  // the source of truth for crawler instructions; this is the in-head
  // hint that mirrors them.
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_KE",
    title: `${SITE_NAME} — Creative Agency in Nairobi`,
    description: DESCRIPTION,
    url: SITE_URL,
    // Per-page metadata can override `images` for richer link previews.
    // The /icon.svg mark is the fallback.
    images: [{ url: "/icon.svg", width: 64, height: 64, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Creative Agency in Nairobi`,
    description: DESCRIPTION,
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      {/*
        suppressHydrationWarning swallows the mismatch warning some browser
        extensions trigger by injecting attributes (e.g. cz-shortcut-listen)
        into <body> before React hydrates. Hydration still happens normally.
      */}
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-cream text-ink antialiased"
      >
        {children}
      </body>
    </html>
  );
}
