import { resolveFileURL, type CourseResource } from "@/lib/api";

interface Props {
  resources: CourseResource[];
  /** Heading shown above the list. Hidden if "" / undefined. */
  title?: string;
  className?: string;
}

// resourceHref turns the stored URL into something the browser can
// open. External links go through as-is; uploaded files come back as
// signed /api/files/<token> paths (or legacy /uploads/...) on the
// backend host.
function resourceHref(url: string): string {
  return resolveFileURL(url) || "#";
}

// ResourceList renders a tidy list of attached resources on either the
// course landing page or inside a lesson. Returns null when empty so
// callers don't need to guard the section header themselves.
export default function ResourceList({ resources, title, className = "" }: Props) {
  if (!resources || resources.length === 0) return null;
  return (
    <section className={className}>
      {title && (
        <h3 className="text-sm font-semibold uppercase tracking-widest text-ink/50">
          {title}
        </h3>
      )}
      <ul className="mt-3 divide-y divide-ink/[0.06] rounded-2xl border border-ink/10 bg-white">
        {resources.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-ink">
              <span aria-hidden="true">{r.kind === "file" ? "📎" : "🔗"}</span>
              <span className="font-medium">{r.label}</span>
            </span>
            <a
              href={resourceHref(r.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              {r.kind === "file" ? "Download" : "Open"} →
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
