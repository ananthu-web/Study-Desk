import "server-only";
import { ObjectId, MongoServerError, type ClientSession, type Db } from "mongodb";
import { getDatabase } from "@/server/db/mongodb";
import { SubjectError, getSubject } from "./service";
import { uploadUrl, validatePdf, removeFile, fileUrl, ensureStorage } from "@/server/storage/b2";
import type { StudyFolder, StudyResource, StudyNote, WorkspaceData } from "@/components/subjects/workspace-types";
const MAX_FILE = 20 * 1024 * 1024, QUOTA = 100 * 1024 * 1024;
type FolderRecord = { _id: ObjectId; userId: string; subjectId: string; parentId: string | null; name: string; normalisedName: string; deleting?: boolean };
type ResourceRecord = { _id: ObjectId; userId: string; subjectId: string; folderId: string | null; title: string; type: "pdf" | "link"; url?: string; size: number; status: StudyResource["status"]; key?: string; versionId?: string; expiresAt?: Date };
type UsageRecord = { _id: string; bytes: number };
const state = globalThis as typeof globalThis & { studyDeskWorkspaceIndexes?: Promise<void> };
async function database() {
  const { db } = await getDatabase();
  state.studyDeskWorkspaceIndexes ??= Promise.all([
    db.collection("folders").createIndex({ userId: 1, subjectId: 1, parentId: 1, normalisedName: 1 }, { unique: true }),
    db.collection("resources").createIndex({ userId: 1, subjectId: 1, folderId: 1 }),
    db.collection("notes").createIndex({ userId: 1, subjectId: 1 }, { unique: true }),
  ]).then(() => undefined).catch(error => { state.studyDeskWorkspaceIndexes = undefined; throw error; });
  await state.studyDeskWorkspaceIndexes;
  return db;
}
function fail(status: number, code: string, message: string): never { throw new SubjectError(status, code, message); }
function id(value: string) { if (!/^[a-f\d]{24}$/i.test(value)) fail(404, "NOT_FOUND", "This item is no longer available."); return new ObjectId(value); }
function text(value: unknown, max: number, label: string) {
  if (typeof value !== "string") fail(400, "INVALID_TEXT", `Enter a valid ${label}.`);
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean || clean.length > max || /[\u0000-\u001f]/.test(clean)) fail(400, "INVALID_TEXT", `Use 1–${max} characters for the ${label}.`);
  return clean;
}
export function fields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !allowed.includes(key))) fail(400, "INVALID_FIELDS", "Please check the details and try again.");
  return input as Record<string, unknown>;
}
function nullableId(value: unknown) { if (value === null) return null; if (typeof value !== "string") fail(400, "INVALID_FOLDER", "Choose a valid folder."); id(value); return value; }
async function locked<T>(userId: string, subjectId: string, action: (db: Db, session: ClientSession) => Promise<T>, allowDeleting = false) {
  const db = await database(); const { client } = await getDatabase(); const session = client.startSession();
  try {
    return await session.withTransaction(async () => {
      const subject = await db.collection("subjects").findOneAndUpdate({ _id: id(subjectId), userId }, { $inc: { workspaceRevision: 1 } }, { session, returnDocument: "after" });
      if (!subject) fail(404, "NOT_FOUND", "This subject is no longer available.");
      if (subject.deleting && !allowDeleting) fail(409, "DELETING", "This subject is being deleted. Retry deletion to finish cleanup.");
      return action(db, session);
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) fail(409, "DUPLICATE_FOLDER", "There’s already a folder with that name here.");
    throw error;
  } finally { await session.endSession(); }
}
async function folderExists(db: Db, userId: string, subjectId: string, folderId: string | null, session?: ClientSession) {
  if (!folderId) return;
  const folder = await db.collection<FolderRecord>("folders").findOne({ _id: id(folderId), userId, subjectId }, { session });
  if (!folder) fail(404, "NOT_FOUND", "This folder is no longer available.");
  if (folder.deleting) fail(409, "DELETING", "This folder is being deleted. Retry deletion to finish cleanup.");
}
function folderDto(value: FolderRecord): StudyFolder { return { id: String(value._id), name: value.name, parentId: value.parentId, deleting: !!value.deleting }; }
function resourceDto(value: ResourceRecord): StudyResource { return { id: String(value._id), title: value.title, folderId: value.folderId, type: value.type, ...(value.type === "link" ? { url: value.url } : {}), size: value.size, status: value.status }; }
async function purge(userId: string, subjectId: string, resources: ResourceRecord[]) {
  for (const resource of resources) {
    if (resource.key) await removeFile(resource.key);
    await locked(userId, subjectId, async (db, session) => {
      const removed = await db.collection<ResourceRecord>("resources").findOneAndDelete({ _id: resource._id, userId, subjectId }, { session });
      if (removed?.type === "pdf") {
        await db.collection<UsageRecord>("storage_usage").updateOne({ _id: userId }, { $inc: { bytes: -removed.size } }, { session });
        // An already issued upload URL can still be used briefly. Sweep this exact key again after it expires.
        if (removed.expiresAt && removed.expiresAt.getTime() > Date.now()) await db.collection("storage_cleanup").insertOne({ userId, key: removed.key, after: new Date(removed.expiresAt.getTime() + 30000) }, { session });
      }
    }, true);
  }
}
async function sweep(userId: string, subjectId: string) {
  const db = await database();
  const expired = await db.collection<ResourceRecord>("resources").find({ userId, subjectId, status: "uploading", expiresAt: { $lt: new Date(Date.now() - 30000) } }).limit(10).toArray();
  if (expired.length) await purge(userId, subjectId, expired);
  const cleanup = await db.collection("storage_cleanup").find({ userId, after: { $lt: new Date() } }).limit(10).toArray();
  for (const item of cleanup) { await removeFile(item.key, item.keepVersion); await db.collection("storage_cleanup").deleteOne({ _id: item._id, userId }); }
}
export async function workspace(userId: string, subjectId: string, folderId: string | null): Promise<WorkspaceData> {
  await getSubject(userId, subjectId); const db = await database();
  // Housekeeping is best-effort; reserved bytes remain charged until cleanup actually succeeds.
  await sweep(userId, subjectId).catch(() => undefined);
  await folderExists(db, userId, subjectId, folderId);
  const folders = await db.collection<FolderRecord>("folders").find({ userId, subjectId }).sort({ name: 1 }).toArray();
  const resources = await db.collection<ResourceRecord>("resources").find({ userId, subjectId, folderId }).sort({ title: 1 }).toArray();
  const usage = await db.collection<UsageRecord>("storage_usage").findOne({ _id: userId });
  return { folders: folders.map(folderDto), resources: resources.map(resourceDto), usedBytes: usage?.bytes ?? 0, maxBytes: QUOTA };
}
export async function saveFolder(userId: string, subjectId: string, folderId: string | null, input: unknown) {
  const value = fields(input, ["name", "parentId"]), name = text(value.name, 60, "folder name"), parentId = nullableId(value.parentId);
  return locked(userId, subjectId, async (db, session) => {
    await folderExists(db, userId, subjectId, parentId, session);
    const all = await db.collection<FolderRecord>("folders").find({ userId, subjectId }, { session }).toArray();
    if (!folderId && all.length >= 100) fail(400, "FOLDER_LIMIT", "This subject has reached its 100-folder limit.");
    const current = folderId ? all.find(item => String(item._id) === folderId) : null;
    if (folderId && (!current || current.deleting)) fail(404, "NOT_FOUND", "This folder is no longer available.");
    const descendants = new Set(folderId ? [folderId] : []);
    let changed = true;
    while (changed) { changed = false; for (const item of all) if (item.parentId && descendants.has(item.parentId) && !descendants.has(String(item._id))) { descendants.add(String(item._id)); changed = true; } }
    if (parentId && descendants.has(parentId)) fail(400, "FOLDER_CYCLE", "A folder can’t be moved inside itself or one of its subfolders.");
    let depth = 1, parent = parentId;
    while (parent) { depth++; parent = all.find(item => String(item._id) === parent)?.parentId ?? null; if (depth > 5) fail(400, "FOLDER_DEPTH", "Keep folders within five levels."); }
    for (const child of all.filter(item => descendants.has(String(item._id)))) {
      let extra = 0, cursor = child;
      while (folderId && String(cursor._id) !== folderId && cursor.parentId) { extra++; const next = all.find(item => String(item._id) === cursor.parentId); if (!next) break; cursor = next; }
      if (depth + extra > 5) fail(400, "FOLDER_DEPTH", "That move would put a subfolder beyond five levels.");
    }
    const record: FolderRecord = { _id: folderId ? id(folderId) : new ObjectId(), userId, subjectId, parentId, name, normalisedName: name.toLowerCase() };
    if (folderId) await db.collection<FolderRecord>("folders").updateOne({ _id: record._id, userId, subjectId }, { $set: { parentId, name, normalisedName: record.normalisedName } }, { session });
    else await db.collection<FolderRecord>("folders").insertOne(record, { session });
    return folderDto(record);
  });
}
export async function deleteFolder(userId: string, subjectId: string, folderId: string) {
  const targets = await locked(userId, subjectId, async (db, session) => {
    const all = await db.collection<FolderRecord>("folders").find({ userId, subjectId }, { session }).toArray();
    if (!all.some(item => String(item._id) === folderId)) fail(404, "NOT_FOUND", "This folder is no longer available.");
    const ids = new Set([folderId]); let changed = true;
    while (changed) { changed = false; for (const folder of all) if (folder.parentId && ids.has(folder.parentId) && !ids.has(String(folder._id))) { ids.add(String(folder._id)); changed = true; } }
    await db.collection("folders").updateMany({ userId, subjectId, _id: { $in: [...ids].map(id) } }, { $set: { deleting: true } }, { session });
    await db.collection("resources").updateMany({ userId, subjectId, folderId: { $in: [...ids] } }, { $set: { status: "deleting" } }, { session });
    return { ids: [...ids], resources: await db.collection<ResourceRecord>("resources").find({ userId, subjectId, folderId: { $in: [...ids] } }, { session }).toArray() };
  });
  await purge(userId, subjectId, targets.resources);
  await locked(userId, subjectId, async (db, session) => { await db.collection("folders").deleteMany({ userId, subjectId, _id: { $in: targets.ids.map(id) } }, { session }); });
}
export async function saveResource(userId: string, subjectId: string, resourceId: string | null, input: unknown) {
  const value = fields(input, resourceId ? ["title", "folderId", "url"] : ["title", "folderId", "url", "size", "type"]);
  const title = text(value.title, 120, "resource title"), folderId = nullableId(value.folderId);
  return locked(userId, subjectId, async (db, session) => {
    await folderExists(db, userId, subjectId, folderId, session);
    const old = resourceId ? await db.collection<ResourceRecord>("resources").findOne({ _id: id(resourceId), userId, subjectId }, { session }) : null;
    if (resourceId && (!old || old.status !== "ready")) fail(404, "NOT_FOUND", "This material isn’t available to edit.");
    if (!resourceId && await db.collection("resources").countDocuments({ userId, subjectId }, { session }) >= 200) fail(400, "RESOURCE_LIMIT", "This subject has reached its 200-material limit.");
    const type = old?.type ?? value.type;
    if (type !== "link" && type !== "pdf") fail(400, "INVALID_TYPE", "Choose a PDF or a website link.");
    let url: string | undefined;
    if (type === "link") {
      if (typeof value.url !== "string" || value.url.length > 2048) fail(400, "INVALID_URL", "Enter a valid HTTPS website address.");
      try { const parsed = new URL(value.url); if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error(); url = parsed.href; } catch { fail(400, "INVALID_URL", "Use a complete HTTPS website address, without a username or password."); }
    }
    if (resourceId && old) { const updated = { ...old, title, folderId, ...(url ? { url } : {}) }; await db.collection<ResourceRecord>("resources").updateOne({ _id: old._id, userId, subjectId }, { $set: { title, folderId, ...(url ? { url } : {}) } }, { session }); return updated; }
    const size = type === "pdf" ? value.size : 0;
    if (typeof size !== "number" || !Number.isInteger(size) || size < (type === "pdf" ? 8 : 0) || size > MAX_FILE) fail(400, "FILE_SIZE", "Choose a PDF up to 20 MB.");
    if (type === "pdf") {
      await db.collection<UsageRecord>("storage_usage").updateOne({ _id: userId }, { $setOnInsert: { bytes: 0 } }, { upsert: true, session });
      const reserved = await db.collection<UsageRecord>("storage_usage").findOneAndUpdate({ _id: userId, bytes: { $lte: QUOTA - size } }, { $inc: { bytes: size } }, { session });
      if (!reserved) fail(413, "STORAGE_FULL", "Your 100 MB file allowance is full. Delete a PDF to make room.");
      if (await db.collection("resources").countDocuments({ userId, status: "uploading" }, { session }) >= 5) fail(400, "UPLOAD_LIMIT", "Finish or remove an unfinished upload before starting another.");
    }
    const _id = new ObjectId();
    const record: ResourceRecord = { _id, userId, subjectId, folderId, title, type, size, status: type === "pdf" ? "uploading" : "ready", ...(url ? { url } : {}), ...(type === "pdf" ? { key: `studydesk/${userId}/${_id}.pdf`, expiresAt: new Date(Date.now() + 600000) } : {}) };
    await db.collection<ResourceRecord>("resources").insertOne(record, { session }); return record;
  });
}
export async function createMaterial(userId: string, subjectId: string, input: unknown) {
  if (input && typeof input === "object" && "type" in input && input.type === "pdf") ensureStorage();
  const record = await saveResource(userId, subjectId, null, input);
  try { return { resource: resourceDto(record), ...(record.key ? { uploadUrl: await uploadUrl(record.key, record.size) } : {}) }; }
  catch (error) { await deleteResource(userId, subjectId, String(record._id)).catch(() => undefined); throw error; }
}
export async function editMaterial(userId: string, subjectId: string, resourceId: string, input: unknown) { return resourceDto(await saveResource(userId, subjectId, resourceId, input)); }
async function ownedResource(userId: string, subjectId: string, resourceId: string) {
  await getSubject(userId, subjectId); const db = await database(); const value = await db.collection<ResourceRecord>("resources").findOne({ _id: id(resourceId), userId, subjectId });
  if (!value) fail(404, "NOT_FOUND", "This material is no longer available."); return value;
}
export async function finishUpload(userId: string, subjectId: string, resourceId: string) {
  const value = await ownedResource(userId, subjectId, resourceId);
  if (value.status === "ready") return resourceDto(value);
  if (value.status !== "uploading" || !value.key) fail(409, "UPLOAD_STATE", "This upload can’t be completed. Remove it and try again.");
  if (value.expiresAt && value.expiresAt.getTime() < Date.now()) fail(410, "UPLOAD_EXPIRED", "This upload expired. Remove it and choose the file again.");
  const versionId = await validatePdf(value.key, value.size);
  return locked(userId, subjectId, async (db, session) => {
    await folderExists(db, userId, subjectId, value.folderId, session);
    const updated = await db.collection<ResourceRecord>("resources").findOneAndUpdate({ _id: value._id, userId, subjectId, status: "uploading" }, { $set: { status: "ready", versionId } }, { session, returnDocument: "after" });
    if (!updated) fail(409, "UPLOAD_STATE", "The upload changed. Refresh your materials.");
    if (value.expiresAt) await db.collection("storage_cleanup").insertOne({ userId, key: value.key, keepVersion: versionId, after: new Date(value.expiresAt.getTime() + 30000) }, { session });
    return resourceDto(updated);
  });
}
export async function deleteResource(userId: string, subjectId: string, resourceId: string) {
  const resource = await locked(userId, subjectId, async (db, session) => {
    const value = await db.collection<ResourceRecord>("resources").findOneAndUpdate({ _id: id(resourceId), userId, subjectId }, { $set: { status: "deleting" } }, { session, returnDocument: "after" });
    if (!value) fail(404, "NOT_FOUND", "This material is no longer available."); return value;
  });
  await purge(userId, subjectId, [resource]);
}
export async function resourceFile(userId: string, subjectId: string, resourceId: string, download: boolean) {
  const value = await ownedResource(userId, subjectId, resourceId);
  if (value.type !== "pdf" || value.status !== "ready" || !value.key || !value.versionId) fail(404, "NOT_FOUND", "This PDF isn’t ready to open.");
  return { url: await fileUrl(value.key, value.versionId, value.title, download), title: value.title };
}
export async function removeSubjectTree(userId: string, subjectId: string) {
  const resources = await locked(userId, subjectId, async (db, session) => {
    await db.collection("subjects").updateOne({ _id: id(subjectId), userId }, { $set: { deleting: true } }, { session });
    return db.collection<ResourceRecord>("resources").find({ userId, subjectId }, { session }).toArray();
  }, true);
  await purge(userId, subjectId, resources);
  await locked(userId, subjectId, async (db, session) => {
    await db.collection("folders").deleteMany({ userId, subjectId }, { session });
    await db.collection("notes").deleteMany({ userId, subjectId }, { session });
    await db.collection("subjects").deleteOne({ _id: id(subjectId), userId }, { session });
  }, true);
}
export async function readNote(userId: string, subjectId: string): Promise<StudyNote> {
  await getSubject(userId, subjectId); const db = await database(); const note = await db.collection("notes").findOne({ userId, subjectId });
  return note ? { body: note.body, version: note.version, updatedAt: note.updatedAt.toISOString() } : { body: "", version: 0, updatedAt: null };
}
export async function writeNote(userId: string, subjectId: string, input: unknown): Promise<StudyNote> {
  const value = fields(input, ["body", "version"]);
  if (typeof value.body !== "string" || value.body.length > 20000 || !Number.isInteger(value.version) || (value.version as number) < 0) fail(400, "INVALID_NOTE", "Keep notes within 20,000 characters and refresh before retrying.");
  return locked(userId, subjectId, async (db, session) => {
    const old = await db.collection("notes").findOne({ userId, subjectId }, { session });
    if ((old?.version ?? 0) !== value.version) fail(409, "NOTE_CONFLICT", "This note changed in another tab. Copy your draft before reloading the saved note.");
    const updatedAt = new Date(), version = (value.version as number) + 1;
    await db.collection("notes").updateOne({ userId, subjectId }, { $set: { body: value.body, version, updatedAt } }, { session, upsert: true });
    return { body: value.body as string, version, updatedAt: updatedAt.toISOString() };
  });
}

/** Daily authenticated housekeeping also covers students who never return after cancelling an upload. */
export async function cleanupStorage() {
  const db = await database(); let cleaned = 0;
  const expired = await db.collection<ResourceRecord>("resources").find({ $or: [{ status: "uploading", expiresAt: { $lt: new Date(Date.now() - 30000) } }, { status: "deleting" }] }).limit(25).toArray();
  for (const resource of expired) { await purge(resource.userId, resource.subjectId, [resource]); cleaned++; }
  const queued = await db.collection("storage_cleanup").find({ after: { $lt: new Date() } }).limit(50).toArray();
  for (const item of queued) { await removeFile(item.key, item.keepVersion); await db.collection("storage_cleanup").deleteOne({ _id: item._id }); cleaned++; }
  const subjects = await db.collection("subjects").find({ deleting: true }).limit(5).toArray();
  for (const subject of subjects) { await removeSubjectTree(subject.userId, String(subject._id)); cleaned++; }
  const folders = await db.collection<FolderRecord>("folders").find({ deleting: true }).limit(10).toArray();
  for (const folder of folders) {
    try { await deleteFolder(folder.userId, folder.subjectId, String(folder._id)); cleaned++; }
    catch (error) { if (!(error instanceof SubjectError && error.status === 404)) throw error; }
  }
  return { cleaned };
}
