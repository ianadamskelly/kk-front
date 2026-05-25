import { type ReactNode } from "react";

// AuthLayout is the reusable split-screen frame for /signin, /register
// and the future password-reset page. Form goes on the left, an
// illustration + tagline panel sits on the right. Below `lg` the
// illustration collapses to a compact header so the form stays the
// primary action on small screens.

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  illustration: ReactNode;
  tagline?: string;
  children: ReactNode;
}

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  illustration,
  tagline,
  children,
}: Props) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
      {/* Form column */}
      <div className="order-2 lg:order-1">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-md text-sm text-ink/55">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </div>

      {/* Illustration column */}
      <div className="order-1 lg:order-2">
        <div className="mx-auto max-w-md lg:max-w-full">
          <div className="relative">
            <div className="kk-fade-up">{illustration}</div>
          </div>
          {tagline && (
            <p className="mt-5 text-center text-sm font-medium text-ink/55 lg:text-base">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
