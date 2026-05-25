// Sign-up illustration for /register. Theme: a growing seedling /
// sparkle motif suggesting "grow with us" — fits the Kuza Kizazi name
// ("Grow the Generation"). Pure SVG, brand-aligned.

export default function RegisterIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      role="img"
      aria-label="An illustrated growing sparkle, suggesting joining and growing."
    >
      <defs>
        <linearGradient id="kk-reg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3ee" />
          <stop offset="100%" stopColor="#ffe2d6" />
        </linearGradient>
        <linearGradient id="kk-reg-orb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fa7d4f" />
          <stop offset="100%" stopColor="#ef5a28" />
        </linearGradient>
      </defs>

      <rect x="20" y="20" width="440" height="440" rx="48" fill="url(#kk-reg-bg)" />

      {/* Soft halo */}
      <circle cx="240" cy="240" r="150" fill="#ffe2d6" />
      <circle
        cx="240"
        cy="240"
        r="180"
        fill="none"
        stroke="#fa7d4f"
        strokeWidth="2"
        strokeDasharray="4 8"
        opacity="0.4"
      />

      {/* Big sparkle (4-point star) in the centre */}
      <g transform="translate(240 240)">
        <path
          d="M0 -120 L40 -40 L120 0 L40 40 L0 120 L-40 40 L-120 0 L-40 -40 Z"
          fill="url(#kk-reg-orb)"
        />
        {/* Glossy highlight */}
        <path
          d="M-20 -80 Q0 -60 20 -80"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </g>

      {/* Orbiting smaller stars */}
      <Sparkle x={120} y={150} size={20} />
      <Sparkle x={360} y={140} size={16} />
      <Sparkle x={150} y={360} size={18} />
      <Sparkle x={350} y={380} size={14} />

      {/* Confetti dots */}
      <circle cx="100" cy="240" r="8" fill="#ef5a28" />
      <circle cx="390" cy="240" r="6" fill="#fa7d4f" />
      <circle cx="80" cy="80" r="14" fill="#ffc4ab" />
      <circle cx="405" cy="405" r="10" fill="#ffe2d6" stroke="#fa7d4f" strokeWidth="3" />
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
      fill="#fa7d4f"
      opacity="0.8"
    />
  );
}
