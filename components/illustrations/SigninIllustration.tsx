// Welcome-back illustration for /signin. Composition: a chunky orange
// key sitting in front of a soft circular badge, with a couple of
// floating sparkles and orbiting dots. Brand-aligned, abstract enough
// to age well, sharp at any size because it's a pure SVG.

export default function SigninIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      role="img"
      aria-label="An illustrated key, suggesting a secure sign-in."
    >
      <defs>
        <linearGradient id="kk-sign-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3ee" />
          <stop offset="100%" stopColor="#ffe2d6" />
        </linearGradient>
        <linearGradient id="kk-sign-key" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fa7d4f" />
          <stop offset="100%" stopColor="#ef5a28" />
        </linearGradient>
      </defs>

      <rect x="20" y="20" width="440" height="440" rx="48" fill="url(#kk-sign-bg)" />

      {/* Soft circular badge behind the key */}
      <circle cx="240" cy="240" r="140" fill="#ffe2d6" />
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

      {/* Decorative orbs */}
      <circle cx="100" cy="120" r="20" fill="#ffc4ab" />
      <circle cx="380" cy="380" r="16" fill="#ef5a28" />
      <circle cx="385" cy="110" r="10" fill="#fa7d4f" />
      <circle cx="90" cy="370" r="14" fill="#ffe2d6" stroke="#fa7d4f" strokeWidth="3" />

      {/* Sparkles */}
      <Sparkle x={150} y={90} size={12} />
      <Sparkle x={345} y={345} size={14} />
      <Sparkle x={100} y={260} size={10} />

      {/* Key — bow (round head) + stem + bit (teeth) */}
      <g transform="translate(160 200)">
        {/* Stem */}
        <rect x="98" y="20" width="120" height="20" rx="6" fill="url(#kk-sign-key)" />
        {/* Bit (teeth) */}
        <rect x="180" y="40" width="10" height="22" rx="2" fill="url(#kk-sign-key)" />
        <rect x="200" y="40" width="10" height="32" rx="2" fill="url(#kk-sign-key)" />
        {/* Bow */}
        <circle cx="60" cy="30" r="44" fill="url(#kk-sign-key)" />
        {/* Bow centre hole */}
        <circle cx="60" cy="30" r="16" fill="#fff3ee" />
        {/* Specular highlight */}
        <path
          d="M30 12 a35 35 0 0 1 30 -8"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </g>
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
