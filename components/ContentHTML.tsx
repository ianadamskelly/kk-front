// ContentHTML renders editor output safely.
//
// Long-form fields used to be plain text; they're now produced by TipTap as
// sanitized HTML. To stay backwards-compatible with the pre-existing plain
// text content (seed posts, projects, etc.), if the value has no HTML tags
// we fall back to `whitespace-pre-wrap` so paragraph breaks survive.

import { resolveContentImageUrls } from "@/lib/api";

const HTML_TAG_RE = /<[a-z][\s\S]*?>/i;

export default function ContentHTML({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;
  const isHTML = HTML_TAG_RE.test(html);
  if (isHTML) {
    const resolvedHTML = resolveContentImageUrls(html);
    return (
      <div
        className={`kk-prose ${className}`}
        // The HTML comes from our own admin (TipTap) — XSS surface is limited
        // to whatever an admin types. If we ever accept content from
        // untrusted sources, run it through a sanitizer here first.
        dangerouslySetInnerHTML={{ __html: resolvedHTML }}
      />
    );
  }
  return (
    <div className={`kk-prose whitespace-pre-wrap ${className}`}>{html}</div>
  );
}
