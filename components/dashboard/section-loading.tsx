"use client";

import { useEffect, useState } from "react";
import { StudyBook } from "@/components/study-book";

export function SectionLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  return <div className="desk-route-loading" role="status" aria-live="polite" aria-busy="true"><StudyBook size={30} /><p>{slow ? "This section is taking longer than expected." : "Opening your desk…"}</p>{slow && <div className="desk-loading-recovery"><p>You can reload this section to reconnect. Your saved work stays in your account.</p><button type="button" className="desk-outline-button" onClick={() => window.location.reload()}>Reload section</button></div>}<div className="desk-route-skeleton" aria-hidden="true"><span /><span /><span /></div></div>;
}
