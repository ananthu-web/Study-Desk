import { subjectRequest, subjectResponse, subjectJson } from "@/server/subjects/http";
import { readNote, writeNote } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return subjectRequest(request, async userId => subjectResponse({ note: await readNote(userId, (await context.params).id) })); }
export async function PUT(request: Request, context: Context) { return subjectRequest(request, async userId => subjectResponse({ note: await writeNote(userId, (await context.params).id, await subjectJson(request, 128 * 1024)) })); }
