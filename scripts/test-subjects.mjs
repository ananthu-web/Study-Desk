import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

const base = process.env.AUTH_TEST_URL || "http://127.0.0.1:3001";
const uri = process.env.AUTH_TEST_MONGODB_URI || "mongodb://127.0.0.1:27028/?replicaSet=studydesk-test";
const databaseName = process.env.AUTH_TEST_MONGODB_DB || "studydesk_auth_test_subjects";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
assert.match(uri, /^mongodb:\/\/(?:127\.0\.0\.1|localhost):\d+\//);
assert.ok(databaseName.startsWith("studydesk_auth_test"));
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
const run = randomUUID();
const emails = [`subjects-a-${run}@example.test`, `subjects-b-${run}@example.test`];
const password = randomUUID() + "-Password";
const input = { name: "  Mathematics   advanced  ", description: "  A little learning.  ", colour: "sage", goal: 45 };
let connected = false;
function browser(suffix) {
  const cookies = new Map();
  return { async request(path, method = "GET", body, extra = {}) {
    const headers = { Origin: base, "x-forwarded-for": `127.${parseInt(run.slice(0, 2), 16)}.${parseInt(run.slice(2, 4), 16)}.${suffix}`, ...extra };
    if (cookies.size && !headers.Cookie) headers.Cookie = [...cookies].map(([key, value]) => `${key}=${value}`).join("; ");
    if (body !== undefined && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const response = await fetch(base + path, { method, redirect: "manual", headers, body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body) });
    for (const value of response.headers.getSetCookie()) { const pair = value.split(";")[0]; const split = pair.indexOf("="); cookies.set(pair.slice(0, split), pair.slice(split + 1)); }
    return response;
  } };
}
try {
  await client.connect(); connected = true;
  const db = client.db(databaseName);
  const guest = browser(31), a = browser(32), b = browser(33);
  assert.equal((await guest.request("/api/subjects")).status, 401);
  assert.equal((await guest.request("/api/subjects", "POST", input)).status, 401);
  const users = [];
  for (const [i, browser] of [a, b].entries()) {
    const response = await browser.request("/api/auth/sign-up/email", "POST", { name: `Subject student ${i}`, email: emails[i], password });
    assert.equal(response.status, 200); users.push((await response.json()).user);
  }
  const created = await a.request("/api/subjects", "POST", input); assert.equal(created.status, 201);
  const subject = (await created.json()).subject;
  assert.equal(subject.name, "Mathematics advanced"); assert.equal(subject.description, "A little learning.");
  assert.deepEqual(Object.keys(subject).sort(), ["id", "name", "description", "colour", "goal"].sort());
  assert.equal(created.headers.get("cache-control"), "no-store");
  assert.equal((await a.request("/api/subjects/" + subject.id)).status, 200);
  const list = await a.request("/api/subjects"); assert.deepEqual((await list.json()).subjects, [subject]);
  assert.equal((await (await b.request(`/api/subjects?userId=${users[0].id}`)).json()).subjects.length, 0);
  for (const method of ["GET", "PATCH", "DELETE"]) assert.equal((await b.request("/api/subjects/" + subject.id, method, method === "PATCH" ? input : undefined)).status, 404);
  assert.equal((await a.request("/api/subjects/bad-id")).status, 404);
  assert.equal((await a.request("/api/subjects", "POST", { ...input, name: "mathematics ADVANCED" })).status, 409);
  assert.equal((await b.request("/api/subjects", "POST", input)).status, 201, "Different students can use the same name");
  const attempts = await Promise.all([1, 2].map(() => a.request("/api/subjects", "POST", { ...input, name: "Concurrent subject" })));
  assert.deepEqual(attempts.map(response => response.status).sort(), [201, 409]);
  for (const invalid of [{ name: " " }, { name: "x".repeat(61) }, { description: "x".repeat(161) }, { description: 3 }, { colour: "neon" }, { goal: 1 }, { goal: 481 }, { goal: 1.5 }, { goal: "45" }, { userId: users[1].id }]) assert.equal((await a.request("/api/subjects", "POST", { ...input, ...invalid })).status, 400);
  assert.equal((await a.request("/api/subjects", "POST", input, { Origin: "https://untrusted.example" })).status, 403);
  assert.equal((await a.request("/api/subjects", "POST", input, { Origin: "" })).status, 403);
  assert.equal((await a.request("/api/subjects", "POST", input, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await a.request("/api/subjects", "POST", "{")).status, 400);
  assert.equal((await a.request("/api/subjects", "POST", JSON.stringify({ name: "x".repeat(9000) }))).status, 413);
  assert.equal((await guest.request("/api/subjects", "GET", undefined, { Cookie: "better-auth.session_token=forged" })).status, 401);
  const updated = { ...input, name: "Physics", colour: "slate", goal: null };
  assert.equal((await a.request("/api/subjects/" + subject.id, "PATCH", updated)).status, 200);
  assert.equal((await (await a.request("/api/subjects/" + subject.id)).json()).subject.name, "Physics");
  const stored = await db.collection("subjects").findOne({ _id: (await import("mongodb")).ObjectId.createFromHexString(subject.id) });
  assert.equal(stored.userId, users[0].id); assert.equal(stored.normalisedName, "physics"); assert.ok(stored.updatedAt instanceof Date);
  await db.collection("notes").insertOne({ userId: users[0].id, subjectId: subject.id, body: "Test child" });
  assert.equal((await a.request("/api/subjects/" + subject.id, "DELETE")).status, 409, "Do not orphan future materials");
  await db.collection("notes").deleteMany({ userId: users[0].id, subjectId: subject.id });
  assert.equal((await a.request("/api/subjects/" + subject.id, "DELETE")).status, 200);
  assert.equal((await a.request("/api/subjects/" + subject.id)).status, 404);
  assert.equal((await a.request("/api/subjects/" + subject.id, "DELETE")).status, 404);
  assert.equal((await (await b.request("/api/subjects")).json()).subjects.length, 1);
  console.log("Passed: persisted subject CRUD, owner isolation, safe DTOs, duplicate-name races, validation, request limits, CSRF origin checks, forged sessions, child guard, and deletion.");
} finally {
  if (connected) {
    const db = client.db(databaseName);
    const users = await db.collection("user").find({ email: { $in: emails } }).toArray();
    const ids = users.map(user => user._id), ownerIds = ids.map(String);
    if (ids.length) {
      for (const name of ["subjects", "notes"]) await db.collection(name).deleteMany({ userId: { $in: ownerIds } });
      for (const name of ["account", "session"]) await db.collection(name).deleteMany({ userId: { $in: ids } });
      await db.collection("user").deleteMany({ _id: { $in: ids } });
    }
  }
  await client.close();
}
