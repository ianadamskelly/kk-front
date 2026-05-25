"use client";

import { useEffect, useRef, useState } from "react";
import { Stat } from "@/lib/api";

// StatsBand renders the band of stats used on the home + about pages.
// The numeric portion of each value counts up from zero the first time
// the band scrolls into view, leaving any prefix / suffix ("+", "k",
// "%") untouched. Respects prefers-reduced-motion by skipping the
// animation and rendering the final value immediately.

interface Props {
  stats: Stat[];
  variant?: "dark" | "light";
}

export default function StatsBand({ stats, variant = "dark" }: Props) {
  if (stats.length === 0) return null;
  const dark = variant === "dark";
  return (
    <div
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-2xl lg:grid-cols-4 ${
        dark ? "bg-cream/10" : "bg-ink/10"
      }`}
    >
      {stats.map((s) => (
        <div
          key={s.id}
          className={`p-6 text-center ${dark ? "bg-ink" : "bg-white"}`}
        >
          <div
            className={`text-3xl font-semibold tracking-tight sm:text-4xl ${
              dark ? "text-brand-400" : "text-brand-600"
            }`}
          >
            <CountUp value={s.value} />
          </div>
          <div
            className={`mt-1 text-sm ${dark ? "text-cream/60" : "text-ink/55"}`}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// CountUp parses the digits out of e.g. "472+" or "$12k", animates them
// from zero to the target, and re-renders the original prefix/suffix
// around the live number. If no digits are found we render the value
// verbatim.
function CountUp({
  value,
  durationMs = 1200,
}: {
  value: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const [display, setDisplay] = useState<string>(value);

  useEffect(() => {
    if (!match) return;
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr.replace(",", "."));
    if (!isFinite(target)) return;

    // Honour the user's accessibility setting — skip the animation.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      setDisplay(`${prefix}${numStr}${suffix}`);
      return;
    }

    // Start at zero until we're in view.
    setDisplay(`${prefix}0${suffix}`);

    const el = ref.current;
    if (!el) return;

    let started = false;
    let rafId = 0;

    const start = () => {
      if (started) return;
      started = true;
      const startTs = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTs) / durationMs);
        // Ease-out cubic so the count slows as it lands.
        const eased = 1 - Math.pow(1 - t, 3);
        const current = target * eased;
        const formatted = Number.isInteger(target)
          ? Math.round(current).toString()
          : current.toFixed(numStr.includes(".") ? 1 : 0);
        setDisplay(`${prefix}${formatted}${suffix}`);
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return () => cancelAnimationFrame(rafId);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            start();
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      obs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
