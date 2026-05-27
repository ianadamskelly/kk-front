import type { CSSProperties } from "react";
import type { Testimonial } from "@/lib/api";
import TestimonialCard from "./TestimonialCard";

interface Props {
  testimonials: Testimonial[];
  /** Seconds for one full loop. Lower values scroll faster. */
  durationSeconds?: number;
}

// Two copies of the cards allow the strip to wrap continuously. The
// duplicated copy is visual only so testimonials are not announced twice.
export default function TestimonialsMarquee({
  testimonials,
  durationSeconds = 60,
}: Props) {
  if (testimonials.length === 0) return null;

  const style = {
    "--kk-marquee-duration": `${durationSeconds}s`,
  } as CSSProperties;

  return (
    <div
      className="kk-marquee-pause relative overflow-hidden"
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
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <li
            key={`${testimonial.id}-${index}`}
            className="w-[320px] shrink-0 sm:w-[360px]"
            aria-hidden={index >= testimonials.length}
          >
            <TestimonialCard testimonial={testimonial} />
          </li>
        ))}
      </ul>
    </div>
  );
}
