import Link from "next/link";
import { LibraryResource, imageUrl, resolveFileURL } from "@/lib/api";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeEntity(entity: string): string {
  const numeric = entity.match(/^#(\d+)$/);
  if (numeric) return String.fromCodePoint(Number(numeric[1]));
  const hex = entity.match(/^#x([\da-f]+)$/i);
  if (hex) return String.fromCodePoint(Number.parseInt(hex[1], 16));
  return NAMED_ENTITIES[entity] ?? `&${entity};`;
}

function plainTextExcerpt(html: string): string {
  return html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&([^;\s]+);/g, (_match, entity: string) =>
      decodeEntity(entity),
    )
    .replace(/\s+/g, " ")
    .trim();
}

// LibraryCard renders one resource. `locked=true` (i.e. the requester is
// not an active member) replaces the "Open resource" link with a soft
// member-only badge + sign-in pointer, and dims the card image so the
// gate is obvious at a glance.
export default function LibraryCard({
  resource,
  locked = false,
}: {
  resource: LibraryResource;
  locked?: boolean;
}) {
  const hasLink = !locked && resource.url && resource.url !== "#";
  const description = plainTextExcerpt(resource.description);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      {resource.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink/5">
          <img
            src={imageUrl(resource.image)}
            alt={resource.title}
            className={`h-full w-full object-cover transition ${
              locked ? "opacity-70 grayscale-[40%] group-hover:grayscale-0" : ""
            }`}
          />
          {locked && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              🔒 Members
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
          {resource.type}
          {resource.category && (
            <span className="text-ink/40">· {resource.category}</span>
          )}
        </div>
        <h3 className="text-base font-semibold leading-snug text-ink">
          {resource.title}
        </h3>
        {description && (
          <p className="line-clamp-3 text-sm text-ink/60">
            {description}
          </p>
        )}
        <div className="mt-auto pt-3">
          {hasLink ? (
            <a
              href={resolveFileURL(resource.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Open resource →
            </a>
          ) : locked ? (
            <Link
              href="/membership?next=/library"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              Join to unlock →
            </Link>
          ) : (
            <span className="text-sm text-ink/40">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}
