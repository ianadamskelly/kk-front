import Link from "next/link";
import { type ReactNode } from "react";

// EmptyState is the consistent "nothing here yet" panel used across the app.
// Pass a glyph (emoji or small SVG), a title, a one-line description, and
// optionally a primary action. Variants tune the visual weight: `card`
// (bordered card with dashed border) for inside content panels; `inline`
// for compact contexts that already sit inside a card.

type Variant = "card" | "inline";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?:
    | { href: string; label: string }
    | { onClick: () => void; label: string };
  secondaryAction?:
    | { href: string; label: string }
    | { onClick: () => void; label: string };
  variant?: Variant;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "card",
  className = "",
}: Props) {
  const wrapper =
    variant === "card"
      ? "rounded-2xl border border-dashed border-ink/15 bg-ink/[0.02] p-10 text-center"
      : "py-8 text-center";

  return (
    <div className={`${wrapper} kk-fade-up ${className}`}>
      {icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl text-brand-500">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink/55">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {action && renderAction(action, "primary")}
          {secondaryAction && renderAction(secondaryAction, "secondary")}
        </div>
      )}
    </div>
  );
}

function renderAction(
  a:
    | { href: string; label: string }
    | { onClick: () => void; label: string },
  tone: "primary" | "secondary",
) {
  const cls =
    tone === "primary"
      ? "rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
      : "rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/5";
  if ("href" in a) {
    return (
      <Link key={a.label} href={a.href} className={cls}>
        {a.label}
      </Link>
    );
  }
  return (
    <button key={a.label} type="button" onClick={a.onClick} className={cls}>
      {a.label}
    </button>
  );
}
