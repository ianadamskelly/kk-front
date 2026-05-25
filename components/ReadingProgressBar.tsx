"use client";

import { useEffect, useState } from "react";

// ReadingProgressBar draws a thin brand-orange bar across the top of
// the viewport that fills as the user scrolls through the page. Used on
// long-form pages (blog posts, lessons) to give a subtle sense of
// position without taking up real estate.

export default function ReadingProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const tick = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) {
        setPct(0);
        return;
      }
      setPct(Math.min(100, Math.max(0, (window.scrollY / max) * 100)));
    };
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      // Sticks just under the (sticky) site header so it doesn't get
      // covered. z-30 sits below the header (z-40) but above content.
      className="sticky top-[65px] z-30 h-[3px] w-full bg-transparent"
    >
      <div
        className="h-full bg-brand-500 transition-[width] duration-100 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
