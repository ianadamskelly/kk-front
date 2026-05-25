import Link from "next/link";
import { Course, imageUrl, formatPrice } from "@/lib/api";
import { ClockIcon } from "./icons/BrandIcons";

// LevelIcon: tiny bar-chart glyph that visually reads "difficulty".
function LevelIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="14" width="4" height="7" rx="1" fill="currentColor" />
      <rect x="10" y="9" width="4" height="12" rx="1" fill="currentColor" />
      <rect x="17" y="4" width="4" height="17" rx="1" fill="currentColor" />
    </svg>
  );
}
function LessonsIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// CourseCard meta strip uses tiny icons + a FREE / PAID chip in the top
// corner of the cover image, replacing the previous plain-text strip.
export default function CourseCard({ course }: { course: Course }) {
  const href = `/courses/${course.slug}`;
  const isFree = course.priceCents <= 0;
  const lessonCount = course.lessons?.length || 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={href} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink/5">
          {course.coverImage ? (
            <img
              src={imageUrl(course.coverImage)}
              alt={course.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
              <span className="text-4xl font-semibold text-brand-300">
                {course.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Level pill bottom-left */}
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-cream backdrop-blur-sm">
            <LevelIcon className="h-3 w-3" />
            {course.level}
          </span>
          {/* Price chip top-right */}
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
              isFree
                ? "bg-emerald-100 text-emerald-800"
                : "bg-brand-500 text-white"
            }`}
          >
            {isFree ? "Free" : formatPrice(course.priceCents)}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold leading-snug text-ink">
          <Link href={href} className="hover:text-brand-600">
            {course.title}
          </Link>
        </h3>
        {course.summary && (
          <p className="line-clamp-2 text-sm text-ink/60">{course.summary}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-ink/55">
          {course.duration && (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon />
              {course.duration}
            </span>
          )}
          {lessonCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <LessonsIcon />
              {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
            </span>
          )}
          {course.instructor && (
            <span className="text-ink/45">by {course.instructor}</span>
          )}
        </div>
      </div>
    </article>
  );
}
