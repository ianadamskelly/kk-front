import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/api";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Creative Agency in Nairobi`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Kuza Kizazi is a Nairobi creative agency crafting brands, websites, animation, and digital experiences that move people.",
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
