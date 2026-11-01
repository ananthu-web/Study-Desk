/** Original vector artwork: decorative, lightweight, and shared by both themes. */
export function DeskIllustration({ idPrefix = "desk" }: { idPrefix?: string } = {}) {
  return (
    <svg className="desk-illustration" viewBox="0 0 600 390" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${idPrefix}-top`} x1="90" y1="190" x2="480" y2="350" gradientUnits="userSpaceOnUse"><stop stopColor="#D4BA93" /><stop offset="1" stopColor="#B59874" /></linearGradient>
        <linearGradient id={`${idPrefix}-page`} x1="190" y1="190" x2="330" y2="290" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFCED" /><stop offset="1" stopColor="#E8E0C8" /></linearGradient>
        <radialGradient id={`${idPrefix}-glow`}><stop stopColor="#E8DCA0" stopOpacity=".24" /><stop offset="1" stopColor="#E8DCA0" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${idPrefix}-table-light`} cx="28%" cy="44%" r="55%">
          <stop stopColor="#FFF1B5" stopOpacity=".85" />
          <stop offset=".45" stopColor="#FFE3A0" stopOpacity=".42" />
          <stop offset="1" stopColor="#FFE3A0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${idPrefix}-beam`} x1="278" y1="99" x2="214" y2="238" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF0B0" stopOpacity=".62" />
          <stop offset=".5" stopColor="#FFD780" stopOpacity=".28" />
          <stop offset="1" stopColor="#FFD780" stopOpacity=".03" />
        </linearGradient>
        <filter id={`${idPrefix}-beam-softness`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <pattern id={`${idPrefix}-grid`} width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" stroke="#C8D3B6" strokeOpacity=".12" strokeWidth=".6" /></pattern>
      </defs>

      <g className="desk-backdrop">
      <path d="M163 237V139a137 137 0 0 1 274 0v98" stroke="#D0D8BE" strokeOpacity=".2" />
      <path d="M184 228V139a116 116 0 0 1 232 0v89" stroke="#D0D8BE" strokeOpacity=".11" />
      <path d="M137 306 327 193 549 322 359 432Z" fill={`url(#${idPrefix}-grid)`} opacity=".65" />
      <ellipse cx="303" cy="330" rx="226" ry="31" fill="#102E24" opacity=".2" />
      </g>

      {/* Solid timber desk, viewed from above. */}
      <g className="desk-table">
      <path d="m91 209 164-91 271 150-163 96Z" fill={`url(#${idPrefix}-top)`} />
      <path className="desk-table-shade" d="m91 209 164-91 271 150-163 96Z" fill="#202B25" />
      <path className="desk-table-light" d="m91 209 164-91 271 150-163 96Z" fill={`url(#${idPrefix}-table-light)`} />
      <path d="m91 209 272 151v13L91 222Z" fill="#9C7E5D" />
      <path d="m363 360 163-92v13l-163 92Z" fill="#806C52" />
      <path d="m112 233 18 10v75l-18-10Z" fill="#A98E6B" />
      <path d="m480 306 16-9v56l-16 9Z" fill="#7F6D54" />
      <path d="m340 359 17 10v31l-17-10Z" fill="#947955" />
      <path d="m102 210 261 145 151-86" stroke="#E3D0AD" strokeOpacity=".55" />
      </g>

      {/* Open notebook with stitch binding and handwritten lines. */}
      <g className="desk-notebook">
      <path d="m170 241 83-48 139 77-84 49Z" fill="#705C44" opacity=".18" transform="translate(3 6)" />
      <path d="m165 236 83-48 67 38-82 49Z" fill="#C5BEA5" />
      <path d="m233 275 82-49 73 40-83 50Z" fill="#BFB99F" />
      <path d="m166 230 81-47 66 38-80 47Z" fill={`url(#${idPrefix}-page)`} />
      <path d="m233 268 80-47 74 40-82 49Z" fill="#F9F4DE" />
      <path d="m233 268 1 7 71 41v-6" stroke="#D8D0B7" />
      <path d="m247 184 66 37-8 89" stroke="#D6CDB4" strokeWidth="1.2" />
      <path d="m195 228 37-22m-28 28 44-26m-34 32 45-26m-35 32 44-26m-31 32 39-23" stroke="#A6AE96" strokeOpacity=".75" strokeWidth="1.4" strokeLinecap="round" />
      <path d="m266 266 32-19m-21 25 38-22m-27 28 38-22m-27 28 38-22" stroke="#A6AE96" strokeOpacity=".75" strokeWidth="1.4" strokeLinecap="round" />
      <path d="m274 300 10 6 16-10-10-6Z" fill="#B96F51" />
      </g>

      {/* Pencil and a small terracotta notebook. */}
      <g className="desk-tools">
      <path d="m366 293 45-27" stroke="#3C594A" strokeWidth="4" strokeLinecap="round" />
      <path d="m411 266 7-4-4 7" fill="#E0CB9D" />
      <path d="m147 195 44-26 35 19-44 26Z" fill="#A75F46" />
      <path d="m147 195 35 19v5l-35-20Z" fill="#874B37" />
      <path d="m182 214 44-26v4l-44 27Z" fill="#E5D8BD" />
      <path d="m156 190 35 19" stroke="#D69A76" />
      </g>

      {/* Ceramic mug. */}
      <g className="desk-cup">
      <ellipse cx="418" cy="248" rx="27" ry="14" fill="#7B674A" opacity=".18" />
      <path d="M433 223c22-5 25 20 5 22" stroke="#E9DFC4" strokeWidth="7" />
      <path d="M396 218v22c0 17 40 17 40-1v-21" fill="#E8DFC5" />
      <ellipse cx="416" cy="218" rx="20" ry="11" fill="#F9F0D9" />
      <ellipse cx="416" cy="219" rx="15" ry="7.5" fill="#735039" />
      </g>
      <g stroke="#EEE9D3" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round">
        <path className="desk-steam" d="M413 202c-7-9 7-10 0-20" />
        <path className="desk-steam desk-steam-delayed" d="M424 205c-7-9 7-10 0-20" />
      </g>

      {/* Articulated desk lamp, with a warm pool of light. */}
      <g className="desk-lamp-beam">
        <path d="M257 88 300 112 285 250Q213 260 146 193Z" fill={`url(#${idPrefix}-beam)`} filter={`url(#${idPrefix}-beam-softness)`} />
      </g>
      <ellipse className="desk-lamp-glow" cx="217" cy="223" rx="74" ry="27" transform="rotate(30 217 223)" fill={`url(#${idPrefix}-glow)`} />
      <g className="desk-lamp">
      <ellipse cx="342" cy="185" rx="25" ry="13" fill="#3D5142" />
      <ellipse cx="342" cy="182" rx="25" ry="13" fill="#566B51" />
      <path d="M342 179v-73l-51-31" stroke="#2C4437" strokeWidth="7" strokeLinejoin="round" />
      <path d="M342 179v-73l-51-31" stroke="#7D8B68" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="342" cy="106" r="6" fill="#9DA382" />
      <path d="m291 74-34 12 42 26 9-28Z" fill="#738368" />
      <ellipse cx="278" cy="99" rx="25" ry="9" transform="rotate(30 278 99)" fill="#CFCA9D" />
      <ellipse className="desk-lamp-light" cx="278" cy="99" rx="17" ry="5" transform="rotate(30 278 99)" fill="#EBE0AE" />
      </g>

      {/* Small plant. */}
      <g className="desk-plant">
      <ellipse cx="449" cy="191" rx="23" ry="12" fill="#7B674A" opacity=".17" />
      <path d="m431 164 5 26c2 9 25 9 27 0l5-26" fill="#B87555" />
      <ellipse cx="449" cy="164" rx="19" ry="10" fill="#CB926A" />
      <ellipse cx="449" cy="164" rx="14" ry="6" fill="#6A5840" />
      <g className="desk-leaves">
      <path d="M449 163v-46m0 29-15-16m15 9 14-19" stroke="#A3B18A" strokeWidth="2" />
      <path d="M447 136c-25 2-29-19-25-28 16 2 27 10 25 28Z" fill="#8FA77C" />
      <path d="M452 139c-1-22 12-32 26-32 0 18-9 31-26 32Z" fill="#A3B88C" />
      <path d="M450 122c-16-11-13-28-5-38 14 12 17 25 5 38Z" fill="#718F68" />
      <path d="M449 153c-17 1-26-8-26-20 14 0 25 6 26 20Z" fill="#69855D" />
      </g>
      </g>

      {/* Quiet graphic annotations. */}
      <g className="desk-details">
      <circle cx="135" cy="124" r="3" fill="#C9B680" />
      <path d="M481 74v14m-7-7h14" stroke="#B6C29F" strokeOpacity=".6" />
      <path d="m110 159 23-13m360 70 17 9" stroke="#B6C29F" strokeOpacity=".35" />
      <text x="95" y="348" fill="#D3DCC2" fillOpacity=".55" fontSize="8" letterSpacing="2.5" fontFamily="sans-serif">ONE THING AT A TIME.</text>
      </g>
    </svg>
  );
}
