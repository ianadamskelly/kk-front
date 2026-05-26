import type { CSSProperties } from "react";
import type { Testimonial } from "@/lib/api";
import TestimonialCard from "./TestimonialCard";

interface Props {
  testimonials: Testimonial[];
  /** Seconds for one full loop. Lower = faster scroll. */
  durationSeconds?: number;
}

// TestimonialsMarquee renders a continuously scrolling horizontal
// strip of testimonial cards. The track holds two copies of the same
// set so the animation can wrap by translating -50% with no visual
// seam. CSS handles motion + reduced-motion preference + pause on
// hover; this component just wires up the markup.
export default function TestimonialsMarquee({
  testimonials,
  durationSeconds = 60,
}: Props) {
  if (testimonials.length === 0) return null;

  const style = {
    "--kk-marquee-duration": `${durationSeconds}s`,
  } as CSSProperties;

  return (
    // Mask the strip's edges so cards fade in/out instead of clipping
    // hard at the viewport edge. The pause-on-hover hook is on the
    // outer wrapper so the entire strip stops even when the cursor
    // is between cards.
    <div
      className="kk-marquee-pause group relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <ul
        className="kk-marquee gap-6 py-2"
        style={style}
        aria-label="Client testimonials"
      >
        {[...testimonials, ...testimonials].map((t, i) => (
          <li
            key={`${t.id}-${i}`}
            className="w-[320px] shrink-0 sm:w-[360px]"
            // Only the first copy is exposed to assistive tech — the
            // second is purely visual for the loop.
            aria-hidden={i >= testimonials.length}
          >
            <TestimonialCard testimonial={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
