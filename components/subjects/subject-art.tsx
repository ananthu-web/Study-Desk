import type { SubjectColour } from "./subject-data";

type Scene = "math" | "science" | "language" | "history" | "code" | "books";

/** Picks an illustration from the subject's name. Falls back to an open book. */
export function sceneFor(name: string): Scene {
  const n = name.toLowerCase();
  if (/(math|algebra|calcul|geometr|statist|arithmetic|trigonom)/.test(n)) return "math";
  if (/(phys|chem|bio|science|astro|geolog|ecolog|anatom)/.test(n)) return "science";
  if (/(english|lang|liter|writ|hindi|french|spanish|german|grammar|poetry|essay)/.test(n)) return "language";
  if (/(hist|civic|politic|econom|social|geograph|law|philosoph|sociolog)/.test(n)) return "history";
  if (/(comput|code|coding|program|software|data|web|tech|engineer|algorithm|java|python)/.test(n)) return "code";
  return "books";
}

/** Code-drawn cover art for a subject. Colours come from the subject's colour (--subject-tone / --subject-edge). Decorative only. */
export function SubjectArt({ name, colour, className = "" }: { name: string; colour: SubjectColour | string; className?: string }) {
  const scene = sceneFor(name);
  return (
    <svg className={`subject-art subject-colour-${colour} ${className}`} viewBox="0 0 200 150" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="136" rx="78" ry="7" className="sa-shadow" />
      {scene === "math" && <>
        <rect x="22" y="22" width="118" height="98" rx="10" className="sa-paper" />
        <path d="M34 44h94M34 62h94M34 80h94M34 98h94M52 32v78M76 32v78M100 32v78M124 32v78" className="sa-grid" />
        <path d="M36 108V34M36 108H132" className="sa-axis" />
        <path d="M38 100C62 100 70 42 92 54S120 96 130 40" className="sa-line sa-draw" />
        <circle cx="92" cy="54" r="4.5" className="sa-edge" />
        <circle cx="130" cy="40" r="4.5" className="sa-edge" />
        <g className="sa-compass"><circle cx="160" cy="34" r="7" className="sa-edge" /><path d="M160 41l-16 70M160 41l16 70" className="sa-leg" /><path d="M143 108l-2 8M177 108l2 8" className="sa-leg" /></g>
      </>}
      {scene === "science" && <>
        <path d="M82 20h36v30l34 58a10 10 0 0 1-9 15H57a10 10 0 0 1-9-15l34-58z" className="sa-glass" />
        <path d="M62 94h76l14 24a6 6 0 0 1-5 9H53a6 6 0 0 1-5-9z" className="sa-liquid" />
        <rect x="76" y="16" width="48" height="8" rx="4" className="sa-edge" />
        <circle cx="90" cy="86" r="4" className="sa-bubble sa-b1" /><circle cx="108" cy="80" r="3" className="sa-bubble sa-b2" /><circle cx="98" cy="70" r="2.5" className="sa-bubble sa-b3" />
        <g className="sa-orbit"><ellipse cx="156" cy="40" rx="28" ry="10" transform="rotate(28 156 40)" /><ellipse cx="156" cy="40" rx="28" ry="10" transform="rotate(-28 156 40)" /><circle cx="156" cy="40" r="5" className="sa-edge" /></g>
      </>}
      {scene === "language" && <>
        <path d="M24 112Q74 98 100 110V58Q74 46 24 60z" className="sa-paper" /><path d="M176 112Q126 98 100 110V58Q126 46 176 60z" className="sa-paper" />
        <path d="M100 58v52" className="sa-axis" />
        <path d="M38 72Q66 66 88 74M38 84Q66 78 88 86M38 96Q60 91 80 97M112 74Q134 66 162 72M112 86Q134 78 162 84" className="sa-grid sa-text" />
        <g transform="rotate(32 152 52)"><rect x="144" y="8" width="14" height="66" rx="4" className="sa-edge" /><path d="M144 74h14l-7 16z" className="sa-ink" /></g>
      </>}
      {scene === "history" && <>
        <path d="M26 54L100 22l74 32z" className="sa-edge" />
        <rect x="32" y="58" width="136" height="9" rx="3" className="sa-paper" />
        <rect x="42" y="68" width="16" height="42" rx="3" className="sa-paper" /><rect x="70" y="68" width="16" height="42" rx="3" className="sa-paper" /><rect x="92" y="68" width="16" height="42" rx="3" className="sa-paper" /><rect x="114" y="68" width="16" height="42" rx="3" className="sa-paper" /><rect x="142" y="68" width="16" height="42" rx="3" className="sa-paper" />
        <rect x="30" y="110" width="140" height="9" rx="3" className="sa-edge" /><rect x="22" y="119" width="156" height="9" rx="3" className="sa-paper" />
      </>}
      {scene === "code" && <>
        <rect x="20" y="20" width="160" height="106" rx="12" className="sa-paper" />
        <path d="M20 32a12 12 0 0 1 12-12h136a12 12 0 0 1 12 12v8H20z" className="sa-edge" />
        <circle cx="34" cy="30" r="3.5" className="sa-paper" /><circle cx="46" cy="30" r="3.5" className="sa-paper" /><circle cx="58" cy="30" r="3.5" className="sa-paper" />
        <path d="M64 68l-18 16 18 16M136 68l18 16-18 16M108 62l-16 44" className="sa-line" />
        <rect x="118" y="108" width="14" height="4" rx="2" className="sa-edge sa-blink" />
      </>}
      {scene === "books" && <>
        <path d="M24 112Q74 98 100 110V56Q74 44 24 58z" className="sa-paper" /><path d="M176 112Q126 98 100 110V56Q126 44 176 58z" className="sa-paper" />
        <path d="M100 56v54" className="sa-axis" />
        <path d="M38 72Q66 66 88 74M38 84Q66 78 88 86M112 74Q134 66 162 72M112 86Q134 78 162 84" className="sa-grid sa-text" />
        <path d="M128 52v34l8-6 8 6V50z" className="sa-edge" />
      </>}
    </svg>
  );
}
