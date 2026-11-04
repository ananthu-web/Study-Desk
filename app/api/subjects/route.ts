import { subjectJson, subjectRequest, subjectResponse } from "@/server/subjects/http";
import { createSubject, listSubjects, validateSubject } from "@/server/subjects/service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return subjectRequest(request, async userId => subjectResponse({ subjects: await listSubjects(userId) }));
}
export async function POST(request: Request) {
  return subjectRequest(request, async userId => subjectResponse({ subject: await createSubject(userId, validateSubject(await subjectJson(request))) }, 201));
}
