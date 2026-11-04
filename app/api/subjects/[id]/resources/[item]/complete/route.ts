import { subjectRequest, subjectResponse, subjectJson } from "@/server/subjects/http";
import { finishUpload } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string; item: string }> };
export async function POST(request: Request, context: Context) { return subjectRequest(request, async userId => { const { id, item } = await context.params; return subjectResponse({ resource: await finishUpload(userId, id, item) }); }); }
