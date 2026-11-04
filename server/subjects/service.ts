import "server-only";
import { MongoServerError, ObjectId } from "mongodb";
import { getDatabase } from "@/server/db/mongodb";
import { normaliseSubjectName, subjectColours, type Subject } from "@/components/subjects/subject-data";

type Values = Omit<Subject, "id">;
type SubjectRecord = Values & { _id: ObjectId; userId: string; normalisedName: string; createdAt: Date; updatedAt: Date };
export class SubjectError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
const missing = () => new SubjectError(404, "SUBJECT_NOT_FOUND", "This subject is no longer available.");
const shared = globalThis as typeof globalThis & { studyDeskSubjectIndexes?: Promise<void> };
async function collection() {
  const { db } = await getDatabase();
  const subjects = db.collection<SubjectRecord>("subjects");
  if (!shared.studyDeskSubjectIndexes) shared.studyDeskSubjectIndexes = Promise.all([
    subjects.createIndex({ userId: 1, normalisedName: 1 }, { unique: true, name: "subject_name_per_user" }),
    subjects.createIndex({ userId: 1, createdAt: -1 }, { name: "subjects_by_owner" }),
  ]).then(() => undefined).catch(error => { shared.studyDeskSubjectIndexes = undefined; throw error; });
  await shared.studyDeskSubjectIndexes;
  return subjects;
}
function dto(record: SubjectRecord): Subject {
  return { id: record._id.toHexString(), name: record.name, description: record.description, colour: record.colour, goal: record.goal };
}
function objectId(id: string) { if (!/^[a-f0-9]{24}$/i.test(id)) throw missing(); return new ObjectId(id); }
export function validateSubject(input: unknown): Values {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new SubjectError(400, "INVALID_SUBJECT", "Please check your subject details.");
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some(key => !["name", "description", "colour", "goal"].includes(key))) throw new SubjectError(400, "INVALID_FIELDS", "Please send only subject details.");
  const name = typeof value.name === "string" ? normaliseSubjectName(value.name) : "";
  if (!name || name.length > 60) throw new SubjectError(400, "INVALID_NAME", "Use a subject name between 1 and 60 characters.");
  if (typeof value.description !== "string" || value.description.trim().length > 160) throw new SubjectError(400, "INVALID_DESCRIPTION", "Keep the description within 160 characters.");
  if (!subjectColours.some(option => option.id === value.colour)) throw new SubjectError(400, "INVALID_COLOUR", "Choose one of the available subject colours.");
  if (value.goal !== null && (typeof value.goal !== "number" || !Number.isInteger(value.goal) || value.goal < 15 || value.goal > 480)) throw new SubjectError(400, "INVALID_GOAL", "Choose 15–480 whole minutes, or leave the goal blank.");
  return { name, description: value.description.trim(), colour: value.colour as Values["colour"], goal: value.goal as number | null };
}
function duplicate(error: unknown): never {
  if (error instanceof MongoServerError && error.code === 11000) throw new SubjectError(409, "DUPLICATE_SUBJECT", "There’s already a subject with that name. Try another.");
  throw error;
}
export async function listSubjects(userId: string) {
  const rows = await (await collection()).find({ userId }).sort({ createdAt: -1, _id: -1 }).toArray();
  return rows.map(dto);
}
export async function getSubject(userId: string, id: string) {
  const record = await (await collection()).findOne({ _id: objectId(id), userId });
  if (!record) throw missing();
  return dto(record);
}
export async function createSubject(userId: string, values: Values) {
  const record: SubjectRecord = { ...values, _id: new ObjectId(), userId, normalisedName: values.name.toLowerCase(), createdAt: new Date(), updatedAt: new Date() };
  try { await (await collection()).insertOne(record); return dto(record); } catch (error) { return duplicate(error); }
}
export async function updateSubject(userId: string, id: string, values: Values) {
  try {
    const record = await (await collection()).findOneAndUpdate({ _id: objectId(id), userId, deleting: { $ne: true } }, { $set: { ...values, normalisedName: values.name.toLowerCase(), updatedAt: new Date() } }, { returnDocument: "after" });
    if (!record) throw missing();
    return dto(record);
  } catch (error) { return duplicate(error); }
}
export async function deleteSubject(userId: string, id: string) {
  const { removeSubjectTree } = await import("./workspace");
  await removeSubjectTree(userId, id);
}
