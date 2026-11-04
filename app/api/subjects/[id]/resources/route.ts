import { subjectRequest, subjectResponse, subjectJson } from "@/server/subjects/http";
import { createMaterial } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) { return subjectRequest(request, async userId => subjectResponse(await createMaterial(userId, (await context.params).id, await subjectJson(request)), 201)); }
