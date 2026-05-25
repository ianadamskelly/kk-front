import Link from "next/link";

// Breadcrumbs renders a simple separator-joined trail. The last item is
// rendered as plain text (current page) — no link.
interface Crumb {
  href?: string;
  label: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-ink/55">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className="transition hover:text-brand-600"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-medium text-ink/75" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {c.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-ink/30">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
