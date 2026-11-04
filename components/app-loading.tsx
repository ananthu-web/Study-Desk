/** Lightweight server-rendered fallback; visible while a route is preparing. */
export function AppLoading() {
  return (
    <div className="app-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="app-loading-content">
        <div className="app-loading-emblem" aria-hidden="true">
          <svg className="app-loading-orbit" viewBox="0 0 112 112" fill="none">
            <circle className="app-loading-track" cx="56" cy="56" r="49" />
            <circle className="app-loading-arc" cx="56" cy="56" r="49" pathLength="100" />
          </svg>
          <svg className="app-loading-book" viewBox="0 0 48 48" fill="none">
            <path d="M24 14c-5-4-11-4-18-3v25c7-1 13-1 18 3 5-4 11-4 18-3V11c-7-1-13-1-18 3Z" />
            <path d="M24 14v25M12 18c3-.2 5 .2 7 1.3M12 24c3-.2 5 .2 7 1.3M29 19.3c2-1.1 4-1.5 7-1.3M29 25.3c2-1.1 4-1.5 7-1.3" />
          </svg>
        </div>
        <p className="app-loading-brand">study<span>desk</span><span className="brand-dot">.</span></p>
        <p className="app-loading-caption">Making room for focus</p>
        <span className="sr-only">Loading StudyDesk. Please wait.</span>
      </div>
    </div>
  );
}
