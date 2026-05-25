// FaqIllustration is an inline SVG so we don't need to ship a separate
// image asset and the colours track the brand palette automatically.
// The composition is deliberately abstract — a friendly speech-bubble
// character surrounded by orbiting orbs and sparkles — rather than a
// photoreal cartoon, because (a) it stays sharp at any size, and (b) it
// matches the rest of the geometric, brand-orange-forward aesthetic.

export default function FaqIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      role="img"
      aria-label="A friendly speech bubble surrounded by sparkles, illustrating questions and answers."
    >
      {/* Soft peach rounded backdrop */}
      <defs>
        <linearGradient id="kk-faq-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3ee" />
          <stop offset="100%" stopColor="#ffe2d6" />
        </linearGradient>
        <linearGradient id="kk-faq-bubble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fa7d4f" />
          <stop offset="100%" stopColor="#ef5a28" />
        </linearGradient>
      </defs>

      <rect
        x="20"
        y="20"
        width="440"
        height="440"
        rx="48"
        fill="url(#kk-faq-bg)"
      />

      {/* Decorative orbiting circles */}
      <circle cx="100" cy="120" r="22" fill="#ffc4ab" />
      <circle cx="380" cy="100" r="14" fill="#fa7d4f" />
      <circle cx="420" cy="280" r="28" fill="#ffe2d6" stroke="#fa7d4f" strokeWidth="3" />
      <circle cx="90" cy="370" r="18" fill="#ef5a28" />
      <circle cx="380" cy="400" r="10" fill="#ffc4ab" />

      {/* Dashed orbit arc behind the main bubble */}
      <circle
        cx="240"
        cy="240"
        r="160"
        fill="none"
        stroke="#fa7d4f"
        strokeWidth="2"
        strokeDasharray="4 8"
        opacity="0.4"
      />

      {/* Sparkle (4-point star) accents */}
      <Sparkle x={140} y={70} size={14} />
      <Sparkle x={340} y={180} size={10} />
      <Sparkle x={150} y={340} size={12} />
      <Sparkle x={360} y={340} size={16} />

      {/* Main speech bubble */}
      <g transform="translate(140 130)">
        <path
          d="M30 0 H170 a30 30 0 0 1 30 30 V150 a30 30 0 0 1 -30 30 H80 l-30 30 v-30 H30 a30 30 0 0 1 -30 -30 V30 a30 30 0 0 1 30 -30 z"
          fill="url(#kk-faq-bubble)"
        />
        {/* Big white question mark inside the bubble */}
        <text
          x="100"
          y="130"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="140"
          fontWeight="800"
          fill="#fff"
        >
          ?
        </text>
      </g>

      {/* Friendly character silhouette under the bubble */}
      <g transform="translate(190 340)">
        {/* Shoulders / body */}
        <path
          d="M0 80 Q50 30 100 80 V120 H0 Z"
          fill="#18181b"
        />
        {/* Neck */}
        <rect x="42" y="50" width="16" height="20" fill="#d3a07a" />
        {/* Head */}
        <circle cx="50" cy="40" r="32" fill="#d3a07a" />
        {/* Hair — soft curly cap */}
        <path
          d="M18 28
             a32 32 0 0 1 64 0
             q-8 -4 -16 -2
             q-8 -6 -16 -2
             q-8 -4 -16 0
             q-8 -2 -16 4
             z"
          fill="#18181b"
        />
        {/* Eyes (closed, smiling) */}
        <path
          d="M38 42 q4 -4 8 0 M54 42 q4 -4 8 0"
          stroke="#18181b"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Smile */}
        <path
          d="M42 52 q8 6 16 0"
          stroke="#18181b"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

// Sparkle renders a small 4-point star — used as decorative accents.
function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  const half = size;
  return (
    <path
      d={`M${x} ${y - half}
          L${x + half / 3} ${y - half / 3}
          L${x + half} ${y}
          L${x + half / 3} ${y + half / 3}
          L${x} ${y + half}
          L${x - half / 3} ${y + half / 3}
          L${x - half} ${y}
          L${x - half / 3} ${y - half / 3} Z`}
      fill="#ef5a28"
      opacity="0.8"
    />
  );
}
