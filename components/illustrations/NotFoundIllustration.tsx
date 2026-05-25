// NotFoundIllustration: a stylised "lost compass" surrounded by
// scattered breadcrumbs. Communicates "wrong path" without leaning on
// stock imagery, sharp at any size, brand-aligned.

export default function NotFoundIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      role="img"
      aria-label="An illustration of a compass with scattered dots — the page wasn't found."
    >
      <defs>
        <linearGradient id="kk-404-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3ee" />
          <stop offset="100%" stopColor="#ffe2d6" />
        </linearGradient>
        <linearGradient id="kk-404-needle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fa7d4f" />
          <stop offset="100%" stopColor="#ef5a28" />
        </linearGradient>
      </defs>

      <rect x="20" y="20" width="440" height="440" rx="48" fill="url(#kk-404-bg)" />

      {/* Dashed orbit */}
      <circle
        cx="240"
        cy="240"
        r="170"
        fill="none"
        stroke="#fa7d4f"
        strokeWidth="2"
        strokeDasharray="4 8"
        opacity="0.45"
      />

      {/* Compass body */}
      <g transform="translate(240 240)">
        {/* Outer ring */}
        <circle r="120" fill="#fff" stroke="#ef5a28" strokeWidth="6" />
        {/* Inner cream */}
        <circle r="100" fill="#fff3ee" />
        {/* Cardinal ticks (N E S W) */}
        <g stroke="#18181b" strokeWidth="3" strokeLinecap="round">
          <line x1="0" y1="-95" x2="0" y2="-80" />
          <line x1="0" y1="80" x2="0" y2="95" />
          <line x1="-95" y1="0" x2="-80" y2="0" />
          <line x1="80" y1="0" x2="95" y2="0" />
        </g>
        {/* Cardinal letters */}
        <g
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="700"
          fontSize="14"
          fill="#18181b"
        >
          <text x="0" y="-100" textAnchor="middle">N</text>
          <text x="0" y="115" textAnchor="middle">S</text>
          <text x="-108" y="5" textAnchor="middle">W</text>
          <text x="108" y="5" textAnchor="middle">E</text>
        </g>
        {/* Compass needle (slanted, indicating "lost") */}
        <g transform="rotate(-32)">
          <path d="M 0 -70 L 14 0 L 0 70 L -14 0 Z" fill="url(#kk-404-needle)" />
          <path d="M 0 -70 L 14 0 L -14 0 Z" fill="#fff" opacity="0.18" />
        </g>
        {/* Centre cap */}
        <circle r="8" fill="#18181b" />
        <circle r="3" fill="#fa7d4f" />
      </g>

      {/* 404 text floating top-right */}
      <g transform="translate(330 110) rotate(8)">
        <rect x="-40" y="-26" width="120" height="52" rx="14" fill="#18181b" />
        <text
          x="20"
          y="10"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="800"
          fontSize="32"
          fill="#fa7d4f"
          letterSpacing="2"
        >
          404
        </text>
      </g>

      {/* Scattered breadcrumbs */}
      <circle cx="95" cy="120" r="14" fill="#ffc4ab" />
      <circle cx="380" cy="380" r="14" fill="#ef5a28" />
      <circle cx="100" cy="380" r="10" fill="#fa7d4f" />
      <circle cx="100" cy="240" r="6" fill="#ef5a28" />
      <circle cx="395" cy="240" r="8" fill="#ffe2d6" stroke="#fa7d4f" strokeWidth="2" />

      {/* Sparkles */}
      <Sparkle x={150} y={360} size={12} />
      <Sparkle x={360} y={170} size={10} />
      <Sparkle x={170} y={90} size={10} />
    </svg>
  );
}

function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  const h = size;
  return (
    <path
      d={`M${x} ${y - h}
          L${x + h / 3} ${y - h / 3}
          L${x + h} ${y}
          L${x + h / 3} ${y + h / 3}
          L${x} ${y + h}
          L${x - h / 3} ${y + h / 3}
          L${x - h} ${y}
          L${x - h / 3} ${y - h / 3} Z`}
      fill="#ef5a28"
      opacity="0.75"
    />
  );
}
