import { subjectRequest, subjectResponse, subjectJson } from "@/server/subjects/http";
import { workspace } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return subjectRequest(request, async userId => subjectResponse(await workspace(userId, (await context.params).id, new URL(request.url).searchParams.get("folder")))); }
