import Link from "next/link";
import { Post, imageUrl, formatDate } from "@/lib/api";
import { estimateReadTime } from "@/lib/readtime";
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
} from "./icons/BrandIcons";

// PostCard meta line: category chip (tag icon), date (calendar icon),
// read-time (clock icon). Tiny icons earn their place by speeding scan
// over a long index page.
export default function PostCard({ post }: { post: Post }) {
  const href = `/insights/${post.slug}`;
  const date = post.publishedAt || post.createdAt;
  // Excerpt is short; fall back to body for a better read-time estimate.
  const readTime = estimateReadTime(post.content || post.excerpt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={href} className="block">
        <div className="aspect-[16/9] w-full overflow-hidden bg-ink/5">
          {post.coverImage ? (
            <img
              src={imageUrl(post.coverImage)}
              alt={post.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
              <span className="text-3xl font-semibold text-brand-300">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.categoryName && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
            <TagIcon className="h-3 w-3" />
            {post.categoryName}
          </span>
        )}
        <h3 className="text-lg font-semibold leading-snug text-ink">
          <Link href={href} className="hover:text-brand-600">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="line-clamp-3 text-sm text-ink/60">{post.excerpt}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-ink/45">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon />
            <time dateTime={date}>{formatDate(date)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            {readTime}
          </span>
        </div>
      </div>
    </article>
  );
}
