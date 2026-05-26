"use client";

interface Props {
  value: string;
  onChange: (next: "draft" | "published") => void;
  /** Visual size. "sm" suits inline placement in a wider form row. */
  size?: "sm" | "md";
  className?: string;
}

// StatusToggle is the shared two-state Draft ⇄ Published pill used
// across the admin forms instead of a <select>. Behaves like a radio
// group under the hood — keyboard-accessible and properly labelled.
export default function StatusToggle({
  value,
  onChange,
  size = "md",
  className = "",
}: Props) {
  const v = value === "published" ? "published" : "draft";
  const sizeClass =
    size === "sm" ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5";

  return (
    <div
      role="radiogroup"
      aria-label="Status"
      className={`inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white p-1 ${className}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={v === "draft"}
        onClick={() => onChange("draft")}
        className={`rounded-full font-medium transition ${sizeClass} ${
          v === "draft"
            ? "bg-ink text-white"
            : "text-ink/60 hover:text-ink"
        }`}
      >
        Draft
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={v === "published"}
        onClick={() => onChange("published")}
        className={`rounded-full font-medium transition ${sizeClass} ${
          v === "published"
            ? "bg-brand-500 text-white"
            : "text-ink/60 hover:text-ink"
        }`}
      >
        Published
      </button>
    </div>
  );
}
