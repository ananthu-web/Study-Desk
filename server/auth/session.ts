import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookie } from "better-auth/cookies";
import { getAuth } from "./auth";

/** The database session is authoritative. Never trust a user ID supplied by the browser. */
export async function readSession(requestHeaders: Headers) {
  if (!getSessionCookie(requestHeaders)) return null;
  const started = performance.now();
  let initialised = started;
  let stage = "auth_initialisation";
  let outcome = "error";
  try {
    const auth = await getAuth();
    initialised = performance.now();
    stage = "session_lookup";
    const session = await auth.api.getSession({ headers: requestHeaders });
    outcome = session ? "authenticated" : "unauthenticated";
    return session;
  } finally {
    const finished = performance.now();
    if (finished - started >= 1000 || outcome === "error") {
      // Timing only: never include cookies, tokens, user records or raw DB errors.
      console.warn("[studydesk] session_check", JSON.stringify({
        durationMs: Math.round(finished - started),
        initialisationMs: Math.round((stage === "auth_initialisation" ? finished : initialised) - started),
        lookupMs: stage === "session_lookup" ? Math.round(finished - initialised) : 0,
        stage, outcome, region: process.env.VERCEL_REGION || "local",
      }));
    }
  }
}

// Deduplicate layout/page checks only within this server render, never across users/requests.
export const requireSession = cache(async () => {
  const session = await readSession(await headers());
  if (!session) redirect("/");
  return session;
});
