"use client";

import { useEffect, useState } from "react";
import { StudyBook } from "@/components/study-book";

export function SectionLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  return <>
    <div className="desk-hero is-page desk-loading-hero" aria-hidden="true"><span className="desk-loading-line is-kicker" /><span className="desk-loading-line is-title" /><span className="desk-loading-line is-description" /></div>
    <div className="desk-sheet desk-loading-sheet desk-route-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="desk-loading-status"><span className="desk-section-spinner" aria-hidden="true"><StudyBook size={22} /></span><p>{slow ? "This section is taking longer than expected." : "Opening your desk…"}</p></div>
      {slow && <div className="desk-loading-recovery"><p>You can reload this section to reconnect. Your saved work stays in your account.</p><button type="button" className="desk-outline-button" onClick={() => window.location.reload()}>Reload section</button></div>}
      <div className="desk-loading-cards" aria-hidden="true">{[0, 1, 2, 3].map(item => <div className="desk-loading-card" key={item}><span className="desk-loading-icon" /><span className="desk-loading-line is-card-title" /><span className="desk-loading-line is-card-text" /><span className="desk-loading-line is-card-text is-short" /></div>)}</div>
    </div>
  </>;
}
