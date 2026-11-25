"use client";

export default function DashboardError({ retry }: { retry: () => void }) {
  return <section className="desk-section-empty"><p className="desk-kicker">A MOMENT, PLEASE</p><h1>Your desk couldn’t load.</h1><p>Retry the request, or reload the app to reconnect.</p><div className="desk-recovery-actions"><button type="button" className="desk-primary" onClick={retry}>Try again</button><button type="button" className="desk-outline-button" onClick={() => window.location.reload()}>Reload app</button></div></section>;
}
