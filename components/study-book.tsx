import paths from "./study-book-paths.json";

/** Shared StudyDesk mark, also used by the app-icon generator. */
export function StudyBook({ size = 24, className, animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <g className={animated ? "app-loading-cover-left" : undefined}>
        <path d={paths.left} strokeWidth={27} />
        <path d={paths.leftLines} strokeWidth={15} pathLength={1} className={animated ? "app-loading-lines" : undefined} />
      </g>
      <g className={animated ? "app-loading-cover-right" : undefined}>
        <path d={paths.right} strokeWidth={27} />
        <path d={paths.rightLines} strokeWidth={15} pathLength={1} className={animated ? "app-loading-lines" : undefined} />
      </g>
      {animated && <path className="app-loading-turning-page" d={paths.right} strokeWidth={15} />}
      <path d={paths.spine} strokeWidth={27} />
    </svg>
  );
}
