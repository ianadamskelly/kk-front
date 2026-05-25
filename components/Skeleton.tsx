// Skeleton primitives for placeholder UI while content loads. They rely on
// the .kk-skeleton shimmer animation defined in globals.css.

interface SkeletonProps {
  className?: string;
}

export function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`kk-skeleton h-3 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`kk-skeleton rounded-full ${className}`}
      aria-hidden="true"
    />
  );
}

// SkeletonTableRows renders N rows of placeholder cells for table-style
// admin lists.
export function SkeletonTableRows({
  rows = 4,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="divide-y divide-ink/[0.06] overflow-hidden rounded-2xl border border-ink/10 bg-white">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid items-center gap-3 px-4 py-3.5"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: columns }).map((_, j) => (
            <SkeletonLine key={j} className={j === 0 ? "w-3/4" : "w-1/2"} />
          ))}
        </div>
      ))}
    </div>
  );
}

// SkeletonCards renders N card-shaped placeholders for grid layouts.
export function SkeletonCards({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  const grid =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-4 ${grid}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-ink/10 bg-white"
        >
          <div className="kk-skeleton aspect-[16/10] w-full" />
          <div className="space-y-2 p-4">
            <SkeletonLine className="w-1/3" />
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
