import { subjectRequest, subjectResponse, subjectJson } from "@/server/subjects/http";
import { saveFolder } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) { return subjectRequest(request, async userId => subjectResponse({ folder: await saveFolder(userId, (await context.params).id, null, await subjectJson(request)) }, 201)); }
