// Spinner is a tiny, dependency-free SVG ring used in inline + block contexts.
// `size` matches Tailwind's sizing scale (sm = 1rem, md = 1.5rem, lg = 2.25rem).
// `label` defaults to an accessible "Loading" string.

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZE_PX: Record<NonNullable<SpinnerProps["size"]>, number> = {
  sm: 16,
  md: 24,
  lg: 36,
};

export default function Spinner({
  size = "md",
  className = "",
  label = "Loading",
}: SpinnerProps) {
  const px = SIZE_PX[size];
  return (
    <span
      role="status"
      aria-label={label}
      className={`kk-spin inline-block ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2.5"
        />
        <path
          d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// LoadingBlock fills its container with a centered spinner — good drop-in
// for "loading…" text that previously sat alone on a page.
export function LoadingBlock({
  label = "Loading",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-ink/50 ${className}`}
    >
      <Spinner size="lg" className="text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
