import { subjectRequest, subjectResponse, subjectJson } from "@/server/subjects/http";
import { resourceFile } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string; item: string }> };
export async function GET(request: Request, context: Context) { return subjectRequest(request, async userId => { const { id, item } = await context.params; return subjectResponse(await resourceFile(userId, id, item, new URL(request.url).searchParams.get("download") === "1")); }); }
