"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <main className="account-dashboard"><section className="account-welcome"><h1>A moment, please.</h1><p>Your study space couldn't load. Please try again.</p><button type="button" className="submit-button" onClick={reset}>Try again</button></section></main>;
}
