import "server-only";
import { readSession } from "@/server/auth/session";
import { getAuthConfig } from "@/server/auth/config";
import { SubjectError } from "./service";

export function subjectResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export async function subjectRequest(request: Request, action: (userId: string) => Promise<Response>) {
  try {
    if (request.method !== "GET") {
      const origin = request.headers.get("origin");
      if (!origin || !getAuthConfig().trustedOrigins.includes(origin)) return subjectResponse({ code: "INVALID_ORIGIN", message: "Please make this change from StudyDesk." }, 403);
    }
    const session = await readSession(request.headers);
    if (!session) return subjectResponse({ code: "UNAUTHENTICATED", message: "Your session ended. Please sign in again." }, 401);
    return await action(session.user.id);
  } catch (error) {
    if (error instanceof SubjectError) return subjectResponse({ code: error.code, message: error.message }, error.status);
    return subjectResponse({ code: "SUBJECTS_UNAVAILABLE", message: "Your subjects are temporarily unavailable. Please try again." }, 503);
  }
}
export async function subjectJson(request: Request, limit = 8192): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") throw new SubjectError(415, "JSON_REQUIRED", "Send subject details as JSON.");
  if (!request.body) throw new SubjectError(400, "INVALID_JSON", "Please check your subject details.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new SubjectError(413, "BODY_TOO_LARGE", "These subject details are too long."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new SubjectError(400, "INVALID_JSON", "Please check your subject details."); }
}
