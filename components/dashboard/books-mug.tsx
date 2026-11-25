/** Code-native illustration for the Up next card: two stacked books and a mug with rising steam.
 *  Purely decorative (aria-hidden). Motion is defined in dashboard-polish.css and respects reduced motion. */
export function BooksMug({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 140" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="86" cy="126" rx="80" ry="7" fill="#000" opacity=".12" />
      <g className="desk-art-book desk-art-book-1">
        <rect x="6" y="94" width="108" height="30" rx="5" fill="#b8643f" />
        <rect x="6" y="94" width="108" height="9" rx="5" fill="#cf7a52" />
        <rect x="14" y="106" width="96" height="14" rx="3" fill="#f4efe0" />
        <path d="M14 111h96M14 115h96" stroke="#d9d2bf" strokeWidth="1.2" />
        <rect x="6" y="94" width="10" height="30" rx="4" fill="#9a4f30" />
      </g>
      <g className="desk-art-book desk-art-book-2">
        <g transform="rotate(-3 62 82)">
          <rect x="18" y="64" width="90" height="28" rx="5" fill="#2b6350" />
          <rect x="18" y="64" width="90" height="8" rx="5" fill="#3f7d68" />
          <rect x="26" y="76" width="78" height="12" rx="3" fill="#f4efe0" />
          <path d="M26 80h78M26 84h78" stroke="#d9d2bf" strokeWidth="1.2" />
          <rect x="18" y="64" width="10" height="28" rx="4" fill="#1f4c3d" />
          <rect x="56" y="64" width="20" height="3" rx="1.5" fill="#d1dbb8" opacity=".8" />
        </g>
      </g>
      <g className="desk-art-mug">
        <path d="M154 80c13-2 17 6 11 15-3 4-8 7-13 7" stroke="#e8e1cc" strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="124" y="74" width="36" height="44" rx="10" fill="#f6f2e6" />
        <rect x="124" y="98" width="36" height="20" rx="10" fill="#e8e1cc" />
        <rect x="124" y="87" width="36" height="7" fill="#2b6350" opacity=".9" />
        <ellipse cx="142" cy="75" rx="16" ry="5" fill="#5a3a2a" />
        <ellipse cx="142" cy="74" rx="16" ry="5" stroke="#e8e1cc" strokeWidth="2.5" fill="none" />
      </g>
      <g className="desk-art-steam" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M134 64c-6-6 6-10 0-18" />
        <path d="M143 62c-6-6 6-10 0-20" />
        <path d="M152 64c-6-6 6-10 0-18" />
      </g>
    </svg>
  );
}
