import { subjectJson, subjectRequest, subjectResponse } from "@/server/subjects/http";
import { deleteSubject, getSubject, updateSubject, validateSubject } from "@/server/subjects/service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return subjectRequest(request, async userId => subjectResponse({ subject: await getSubject(userId, (await context.params).id) }));
}
export async function PATCH(request: Request, context: Context) {
  return subjectRequest(request, async userId => subjectResponse({ subject: await updateSubject(userId, (await context.params).id, validateSubject(await subjectJson(request))) }));
}
export async function DELETE(request: Request, context: Context) {
  return subjectRequest(request, async userId => { await deleteSubject(userId, (await context.params).id); return subjectResponse({ deleted: true }); });
}
