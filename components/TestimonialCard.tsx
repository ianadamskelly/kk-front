import { Testimonial } from "@/lib/api";

// TestimonialCard layers a giant brand-100 quotation glyph behind the
// quote text. The quote sits in front of it so the mark reads as
// decoration rather than copy. Hover lifts the card slightly to
// reinforce that the whole tile is a single unit.
export default function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const initial = (testimonial.author?.charAt(0) || "•").toUpperCase();
  return (
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Big decorative quote mark behind everything */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[140px] leading-none text-brand-100 transition group-hover:text-brand-200"
      >
        &ldquo;
      </span>

      <blockquote className="relative z-10 flex-1 text-sm leading-relaxed text-ink/80">
        {testimonial.quote}
      </blockquote>

      <figcaption className="relative z-10 mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {testimonial.author}
          </p>
          <p className="truncate text-xs text-ink/50">
            {[testimonial.role, testimonial.company].filter(Boolean).join(", ")}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
