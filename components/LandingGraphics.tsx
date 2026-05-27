interface GraphicProps {
  className?: string;
}

const ink = "var(--color-ink)";
const cream = "var(--color-cream)";
const brand50 = "var(--color-brand-50)";
const brand100 = "var(--color-brand-100)";
const brand200 = "var(--color-brand-200)";
const brand400 = "var(--color-brand-400)";
const brand500 = "var(--color-brand-500)";

// A product journey: a raw idea is shaped into a web experience and a
// smaller mobile touchpoint, with the rising line suggesting momentum.
export function HeroGraphic({ className = "" }: GraphicProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 520 460"
        fill="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="hero-panel" x1="48" y1="42" x2="464" y2="418">
            <stop stopColor={brand50} />
            <stop offset="1" stopColor={cream} />
          </linearGradient>
          <linearGradient id="hero-accent" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={brand400} />
            <stop offset="1" stopColor={brand500} />
          </linearGradient>
        </defs>

        <rect x="42" y="32" width="432" height="392" rx="42" fill="url(#hero-panel)" />
        <path
          d="M72 357c91 31 160 22 205-28 49-54 94-38 167-95"
          stroke={brand200}
          strokeWidth="2"
          strokeDasharray="5 8"
          strokeLinecap="round"
        />

        <rect x="132" y="93" width="265" height="204" rx="20" fill="white" stroke={ink} strokeOpacity=".12" />
        <path d="M132 125h265" stroke={ink} strokeOpacity=".1" />
        <circle cx="152" cy="109" r="4" fill={brand200} />
        <circle cx="165" cy="109" r="4" fill={brand100} />
        <circle cx="178" cy="109" r="4" fill={brand100} />
        <rect x="155" y="150" width="90" height="9" rx="4.5" fill={ink} fillOpacity=".82" />
        <rect x="155" y="168" width="118" height="6" rx="3" fill={ink} fillOpacity=".22" />
        <rect x="155" y="180" width="99" height="6" rx="3" fill={ink} fillOpacity=".16" />
        <rect x="155" y="208" width="61" height="25" rx="12.5" fill={brand500} />
        <rect x="155" y="254" width="67" height="19" rx="7" fill={brand50} stroke={brand200} />
        <rect x="230" y="254" width="67" height="19" rx="7" fill={brand50} stroke={brand200} />
        <rect x="305" y="150" width="69" height="97" rx="11" fill={brand50} />
        <path d="M318 222l14-18 12 9 18-32" stroke={brand500} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="362" cy="181" r="4" fill={brand500} />

        <rect x="350" y="226" width="90" height="158" rx="18" fill="white" stroke={ink} strokeOpacity=".14" />
        <rect x="365" y="253" width="60" height="60" rx="12" fill={brand50} />
        <path d="M374 297l14-18 10 9 17-21" stroke={brand500} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="365" y="327" width="49" height="6" rx="3" fill={ink} fillOpacity=".2" />
        <rect x="365" y="340" width="37" height="6" rx="3" fill={ink} fillOpacity=".14" />
        <rect x="365" y="357" width="38" height="12" rx="6" fill={brand100} />

        <rect x="64" y="193" width="108" height="108" rx="20" fill="white" stroke={ink} strokeOpacity=".12" />
        <rect x="82" y="211" width="72" height="72" rx="17" fill="url(#hero-accent)" />
        <path
          d="M118 226v13m0 17v13m-22-21h13m17 0h13"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="118" cy="248" r="5" fill="white" />

        <path d="M173 246h28" stroke={brand400} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M195 240l7 6-7 6" stroke={brand400} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M278 80c24-33 54-43 95-30 17 5 32 4 47-7"
          stroke={brand500}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="421" cy="43" r="7" fill={brand500} />
        <path d="M436 48h20M446 38v20" stroke={brand400} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// A shared system around one brand: strategy, visual craft and development
// converge on a central partner before work moves outward.
export function PartnershipGraphic({ className = "" }: GraphicProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 500 244"
        fill="none"
        className="h-full w-full"
      >
        <rect x="1" y="1" width="498" height="242" rx="28" fill={brand50} fillOpacity=".55" stroke={brand100} />
        <path d="M144 67 215 113M144 177l71-45M355 71l-70 43M355 174l-70-42" stroke={brand200} strokeWidth="2" strokeDasharray="4 7" />

        <rect x="40" y="39" width="105" height="62" rx="15" fill="white" stroke={ink} strokeOpacity=".1" />
        <circle cx="68" cy="70" r="12" fill={brand50} stroke={brand200} />
        <path d="M68 63v14M61 70h14" stroke={brand500} strokeWidth="2" strokeLinecap="round" />
        <rect x="89" y="62" width="38" height="6" rx="3" fill={ink} fillOpacity=".2" />
        <rect x="89" y="75" width="28" height="5" rx="2.5" fill={ink} fillOpacity=".12" />

        <rect x="40" y="143" width="105" height="62" rx="15" fill="white" stroke={ink} strokeOpacity=".1" />
        <path d="M59 182 78 160l10 10-20 20H59z" stroke={brand500} strokeWidth="2" strokeLinejoin="round" />
        <rect x="96" y="163" width="30" height="6" rx="3" fill={ink} fillOpacity=".2" />
        <rect x="96" y="176" width="24" height="5" rx="2.5" fill={ink} fillOpacity=".12" />

        <rect x="198" y="72" width="104" height="100" rx="25" fill="white" stroke={brand200} />
        <circle cx="250" cy="112" r="25" fill={brand500} />
        <path d="M250 98v28M236 112h28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="218" y="149" width="64" height="7" rx="3.5" fill={ink} fillOpacity=".15" />

        <rect x="355" y="39" width="105" height="62" rx="15" fill="white" stroke={ink} strokeOpacity=".1" />
        <rect x="373" y="57" width="31" height="25" rx="4" stroke={brand500} strokeWidth="2" />
        <path d="M373 64h31M381 70l-4 4 4 4M395 70l4 4-4 4" stroke={brand500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="414" y="62" width="28" height="6" rx="3" fill={ink} fillOpacity=".2" />
        <rect x="414" y="75" width="22" height="5" rx="2.5" fill={ink} fillOpacity=".12" />

        <rect x="355" y="143" width="105" height="62" rx="15" fill="white" stroke={ink} strokeOpacity=".1" />
        <path d="M375 184v-12M387 184v-24M399 184v-36" stroke={brand500} strokeWidth="5" strokeLinecap="round" />
        <rect x="414" y="162" width="28" height="6" rx="3" fill={ink} fillOpacity=".2" />
        <rect x="414" y="175" width="22" height="5" rx="2.5" fill={ink} fillOpacity=".12" />
      </svg>
    </div>
  );
}

// A calm origin-and-reach illustration: a Nairobi marker anchors a growing
// network of brand, screen and story nodes without introducing literal imagery.
export function AboutGrowthGraphic({ className = "" }: GraphicProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 500 390"
        fill="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="growth-panel" x1="60" y1="44" x2="454" y2="351">
            <stop stopColor={brand50} />
            <stop offset="1" stopColor={cream} />
          </linearGradient>
        </defs>
        <rect x="45" y="29" width="410" height="328" rx="35" fill="url(#growth-panel)" />
        <path d="M80 306h340" stroke={ink} strokeOpacity=".1" strokeWidth="2" />
        <path d="M106 322h176M310 322h88" stroke={brand200} strokeWidth="2" strokeLinecap="round" />

        <path d="M161 269c0-16 13-29 29-29s29 13 29 29c0 26-29 43-29 43s-29-17-29-43z" fill="white" stroke={brand200} strokeWidth="2" />
        <circle cx="190" cy="269" r="10" fill={brand500} />
        <path d="M190 239V207c0-24 20-43 44-43h13" stroke={brand500} strokeWidth="3" strokeLinecap="round" />
        <path d="M190 240v-23c0-27-22-48-49-48h-12" stroke={brand400} strokeWidth="3" strokeLinecap="round" />
        <path d="M221 190v-28c0-28 23-50 51-50h31" stroke={brand500} strokeWidth="3" strokeLinecap="round" />
        <path d="M225 180v20c0 22 18 40 40 40h37" stroke={brand400} strokeWidth="3" strokeLinecap="round" />

        <rect x="84" y="119" width="78" height="62" rx="16" fill="white" stroke={ink} strokeOpacity=".1" />
        <circle cx="123" cy="150" r="18" stroke={brand500} strokeWidth="2" />
        <path d="M123 139v22M112 150h22" stroke={brand500} strokeWidth="2" strokeLinecap="round" />

        <rect x="286" y="73" width="105" height="74" rx="17" fill="white" stroke={ink} strokeOpacity=".1" />
        <rect x="302" y="90" width="73" height="41" rx="7" fill={brand50} stroke={brand200} />
        <path d="M314 120l12-14 10 7 18-17" stroke={brand500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="354" cy="96" r="3.5" fill={brand500} />

        <rect x="301" y="205" width="112" height="70" rx="17" fill="white" stroke={ink} strokeOpacity=".1" />
        <circle cx="325" cy="238" r="10" fill={brand100} />
        <circle cx="355" cy="230" r="10" fill={brand200} />
        <circle cx="385" cy="238" r="10" fill={brand500} />
        <path d="M325 253h61" stroke={brand400} strokeWidth="2" strokeLinecap="round" />

        <circle cx="238" cy="163" r="5" fill={brand500} />
        <circle cx="226" cy="201" r="4" fill={brand400} />
      </svg>
    </div>
  );
}
