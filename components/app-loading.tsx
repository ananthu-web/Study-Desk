import { StudyBook } from "./study-book";

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
          <StudyBook className="app-loading-book" animated />
        </div>
        <p className="app-loading-brand">study<span>desk</span><span className="brand-dot">.</span></p>
        <p className="app-loading-caption">Making room for focus</p>
        <span className="sr-only">Loading StudyDesk. Please wait.</span>
      </div>
    </div>
  );
}
