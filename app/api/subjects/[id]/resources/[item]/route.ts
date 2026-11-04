import { subjectRequest, subjectResponse, subjectJson } from "@/server/subjects/http";
import { editMaterial, deleteResource } from "@/server/subjects/workspace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string; item: string }> };
export async function PATCH(request: Request, context: Context) { return subjectRequest(request, async userId => { const { id, item } = await context.params; return subjectResponse({ resource: await editMaterial(userId, id, item, await subjectJson(request)) }); }); }
export async function DELETE(request: Request, context: Context) { return subjectRequest(request, async userId => { const { id, item } = await context.params; await deleteResource(userId, id, item); return subjectResponse({ deleted: true }); }); }
