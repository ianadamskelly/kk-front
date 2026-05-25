// Membership illustration: a crown-like stack of cards / unlocks /
// stars suggesting "all-access". Pure SVG, brand-aligned.

export default function MembershipIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      role="img"
      aria-label="An illustration of stacked cards and stars, suggesting all-access membership."
    >
      <defs>
        <linearGradient id="kk-mem-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3ee" />
          <stop offset="100%" stopColor="#ffe2d6" />
        </linearGradient>
        <linearGradient id="kk-mem-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fa7d4f" />
          <stop offset="100%" stopColor="#ef5a28" />
        </linearGradient>
      </defs>

      <rect x="20" y="20" width="440" height="440" rx="48" fill="url(#kk-mem-bg)" />

      {/* Dashed orbit halo */}
      <circle
        cx="240"
        cy="245"
        r="160"
        fill="none"
        stroke="#fa7d4f"
        strokeWidth="2"
        strokeDasharray="4 8"
        opacity="0.4"
      />

      {/* Stacked cards (fanned). Drawn back-to-front so foreground sits on top. */}
      {/* Back card (tilted left) */}
      <g transform="translate(135 200) rotate(-12)">
        <rect width="190" height="120" rx="16" fill="#ffc4ab" />
        <rect x="20" y="22" width="80" height="10" rx="5" fill="#fff" opacity="0.6" />
        <rect x="20" y="40" width="120" height="6" rx="3" fill="#fff" opacity="0.4" />
        <rect x="20" y="52" width="100" height="6" rx="3" fill="#fff" opacity="0.4" />
      </g>
      {/* Middle card (no tilt) */}
      <g transform="translate(150 215)">
        <rect width="190" height="120" rx="16" fill="#fa7d4f" />
        <rect x="20" y="22" width="80" height="10" rx="5" fill="#fff" opacity="0.7" />
        <rect x="20" y="40" width="120" height="6" rx="3" fill="#fff" opacity="0.5" />
        <rect x="20" y="52" width="100" height="6" rx="3" fill="#fff" opacity="0.5" />
      </g>
      {/* Front card (tilted right) — the "member" card */}
      <g transform="translate(165 230) rotate(8)">
        <rect width="190" height="120" rx="16" fill="url(#kk-mem-card)" />
        <text
          x="20"
          y="40"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="12"
          fontWeight="700"
          fill="#fff"
          letterSpacing="2"
        >
          MEMBER
        </text>
        <text
          x="20"
          y="80"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="24"
          fontWeight="800"
          fill="#fff"
        >
          ALL-ACCESS
        </text>
        <rect x="20" y="92" width="40" height="6" rx="3" fill="#fff" opacity="0.7" />
        {/* Sparkle on the card */}
        <Sparkle x={160} y={30} size={9} fill="#fff" opacity={0.85} />
      </g>

      {/* Crown of stars above the cards */}
      <g transform="translate(150 110)">
        <Sparkle x={20} y={20} size={14} fill="#ef5a28" opacity={1} />
        <Sparkle x={90} y={6} size={22} fill="#ef5a28" opacity={1} />
        <Sparkle x={160} y={20} size={14} fill="#ef5a28" opacity={1} />
      </g>

      {/* Confetti dots */}
      <circle cx="80" cy="140" r="14" fill="#ffc4ab" />
      <circle cx="400" cy="160" r="10" fill="#fa7d4f" />
      <circle cx="395" cy="380" r="16" fill="#ef5a28" />
      <circle cx="80" cy="380" r="10" fill="#ffe2d6" stroke="#fa7d4f" strokeWidth="2" />
      <Sparkle x={420} y={250} size={10} fill="#ef5a28" />
      <Sparkle x={60} y={250} size={12} fill="#ef5a28" />
    </svg>
  );
}

function Sparkle({
  x,
  y,
  size,
  fill = "#ef5a28",
  opacity = 0.8,
}: {
  x: number;
  y: number;
  size: number;
  fill?: string;
  opacity?: number;
}) {
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
      fill={fill}
      opacity={opacity}
    />
  );
}
