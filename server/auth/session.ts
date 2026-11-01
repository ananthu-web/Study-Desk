import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookie } from "better-auth/cookies";
import { getAuth } from "./auth";

/** The database session is authoritative. Never trust a user ID supplied by the browser. */
export async function readSession(requestHeaders: Headers) {
  if (!getSessionCookie(requestHeaders)) return null;
  const auth = await getAuth();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function requireSession() {
  const session = await readSession(await headers());
  if (!session) redirect("/login");
  return session;
}
