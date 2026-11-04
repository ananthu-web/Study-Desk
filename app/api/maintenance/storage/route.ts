import { timingSafeEqual } from "node:crypto";
import { cleanupStorage } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret ?? ""}`;
  if (!secret || secret.length < 32 || Buffer.byteLength(provided) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return Response.json({ message: "Unauthorised." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try { return Response.json(await cleanupStorage(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ message: "Storage cleanup could not finish. Completed work is preserved; retry the job." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
