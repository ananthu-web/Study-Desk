import { readSession } from "@/server/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await readSession(request.headers);
    if (!session) return Response.json({ message: "Sign in to continue." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const { id, name, email, emailVerified } = session.user;
    return Response.json({ user: { id, name, email, emailVerified } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ message: "Account access is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
