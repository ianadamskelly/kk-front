// Contact-page illustration: an envelope + paper-plane motif, framed
// with the now-familiar brand-orange peach backdrop + dashed orbit.

export default function ContactIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      role="img"
      aria-label="An illustrated envelope with a paper plane, suggesting messaging."
    >
      <defs>
        <linearGradient id="kk-contact-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3ee" />
          <stop offset="100%" stopColor="#ffe2d6" />
        </linearGradient>
        <linearGradient id="kk-contact-env" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fa7d4f" />
          <stop offset="100%" stopColor="#ef5a28" />
        </linearGradient>
      </defs>

      <rect x="20" y="20" width="440" height="440" rx="48" fill="url(#kk-contact-bg)" />

      <circle
        cx="240"
        cy="240"
        r="170"
        fill="none"
        stroke="#fa7d4f"
        strokeWidth="2"
        strokeDasharray="4 8"
        opacity="0.4"
      />

      {/* Envelope */}
      <g transform="translate(120 160)">
        {/* Body */}
        <rect x="0" y="20" width="240" height="160" rx="14" fill="url(#kk-contact-env)" />
        {/* Flap (front-facing triangle) */}
        <path
          d="M0 34 L120 124 L240 34 L240 20 L0 20 Z"
          fill="#ef5a28"
        />
        {/* Window highlight */}
        <rect x="170" y="135" width="50" height="20" rx="4" fill="#fff" opacity="0.25" />
      </g>

      {/* Paper plane flying out */}
      <g transform="translate(310 100) rotate(-15)">
        <path
          d="M0 30 L90 0 L60 60 L36 36 Z"
          fill="#fff"
          stroke="#ef5a28"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M36 36 L60 60 L46 42 Z"
          fill="#fa7d4f"
        />
      </g>

      {/* Dashed flight trail */}
      <path
        d="M150 150 Q220 100 305 110"
        stroke="#ef5a28"
        strokeWidth="2.5"
        strokeDasharray="5 6"
        fill="none"
        opacity="0.5"
      />

      {/* Decorative orbs */}
      <circle cx="90" cy="100" r="14" fill="#ffc4ab" />
      <circle cx="395" cy="380" r="18" fill="#fa7d4f" />
      <circle cx="90" cy="380" r="10" fill="#ef5a28" />
      <circle cx="400" cy="230" r="8" fill="#ffe2d6" stroke="#fa7d4f" strokeWidth="2" />

      {/* Sparkles */}
      <Sparkle x={140} y={400} size={12} />
      <Sparkle x={350} y={300} size={10} />
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
