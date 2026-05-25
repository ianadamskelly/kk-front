"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

// FadeIn wraps content in an IntersectionObserver-driven reveal. Children
// start invisible + nudged down, then animate to their resting position
// the first time they enter the viewport. Subsequent scrolls do nothing.
//
// `delay` (ms) staggers nicely when several FadeIns sit side-by-side.
// `as` lets the wrapper take any element tag so it doesn't break
// document structure (e.g. <section>, <li>).

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  // Render-as element. Defaults to <div>; pass "section", "li", etc.
  as?: ElementType;
  // How much of the element must be visible before triggering.
  threshold?: number;
}

export default function FadeIn({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver isn't available (very old browsers, SSR
    // hydration weirdness), show immediately so content isn't stuck hidden.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-visible={visible || undefined}
      className={`kk-reveal ${className}`}
      style={{ ["--kk-reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
