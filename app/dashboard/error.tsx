"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <section className="desk-section-empty"><p className="desk-kicker">A MOMENT, PLEASE</p><h1>Your desk couldn’t load.</h1><p>Try again to return to your study space.</p><button type="button" className="desk-primary" onClick={reset}>Try again</button></section>;
}
