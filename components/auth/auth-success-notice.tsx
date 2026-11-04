"use client";

import { useEffect, useState } from "react";
import { CircleCheck, X } from "lucide-react";

/** A one-use UI receipt, not proof of authentication; the server still verifies the session. */
export function AuthSuccessNotice({ userId }: { userId?: string }) {
  const [message, setMessage] = useState("");
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = sessionStorage.getItem("studydesk-auth-success");
      if (!raw) return;
      sessionStorage.removeItem("studydesk-auth-success");
      const receipt = JSON.parse(raw);
      if (receipt.userId !== userId || typeof receipt.expiresAt !== "number" || receipt.expiresAt < Date.now() || receipt.expiresAt > Date.now() + 60_000) return;
      if (receipt.kind === "signup") setMessage("Your study space is ready. Welcome!");
      else if (receipt.kind === "login") setMessage("Welcome back. You’re signed in.");
    } catch { /* Missing, invalid, or unavailable storage should not affect account access. */ }
  }, [userId]);
  useEffect(() => {
    if (!message || paused) return;
    const timeout = setTimeout(() => setMessage(""), 8000);
    return () => clearTimeout(timeout);
  }, [message, paused]);
  return <div className="auth-success-notice" role="status" aria-live="polite" aria-atomic="true" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    {message && <div className="auth-success-card"><CircleCheck size={22} aria-hidden="true" /><p>{message}</p><button type="button" onClick={() => setMessage("")} aria-label="Dismiss confirmation"><X size={17} /></button></div>}
  </div>;
}
