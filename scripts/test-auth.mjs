import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

// This suite deliberately refuses non-local databases or application servers.
const base = process.env.AUTH_TEST_URL || "http://127.0.0.1:3001";
const uri = process.env.AUTH_TEST_MONGODB_URI || "mongodb://127.0.0.1:27028/?replicaSet=studydesk-test";
const databaseName = process.env.AUTH_TEST_MONGODB_DB || "studydesk_auth_test";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
assert.match(uri, /^mongodb:\/\/(?:127\.0\.0\.1|localhost):\d+\//);
assert.ok(databaseName.startsWith("studydesk_auth_test"));
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
const run = randomUUID();
const testSubnet = `127.${Number.parseInt(run.slice(0, 2), 16)}.${Number.parseInt(run.slice(2, 4), 16)}`;
const emailA = `auth-a-${run}@example.test`;
const emailB = `auth-b-${run}@example.test`;
const password = randomUUID() + "-Password";
let connected = false;

function browser(ip) {
  const cookies = new Map();
  return {
    cookie: () => [...cookies].map(([key, value]) => `${key}=${value}`).join("; "),
    async request(path, body, overrides = {}) {
      const headers = { Origin: base, "x-forwarded-for": ip, ...overrides };
      if (cookies.size && !headers.Cookie) headers.Cookie = this.cookie();
      if (body !== undefined) headers["Content-Type"] = "application/json";
      const response = await fetch(base + path, { method: body === undefined ? "GET" : "POST", redirect: "manual", headers, body: body === undefined ? undefined : JSON.stringify(body) });
      for (const cookie of response.headers.getSetCookie()) {
        const first = cookie.split(";")[0];
        const equals = first.indexOf("=");
        if (/max-age=0/i.test(cookie)) cookies.delete(first.slice(0, equals));
        else cookies.set(first.slice(0, equals), first.slice(equals + 1));
      }
      return response;
    },
  };
}

try {
  await client.connect();
  connected = true;
  const db = client.db(databaseName);
  const a = browser(`${testSubnet}.21`);
  const b = browser(`${testSubnet}.22`);
  const guest = browser(`${testSubnet}.23`);
  assert.equal((await guest.request("/api/me")).status, 401);
  const guestPage = await guest.request("/dashboard");
  assert.ok([302, 307].includes(guestPage.status));
  assert.equal(new URL(guestPage.headers.get("location"), base).pathname, "/login");

  const signUp = await a.request("/api/auth/sign-up/email", { name: "  Student A  ", email: emailA, password });
  assert.equal(signUp.status, 200, "Registration should succeed");
  const identityA = (await signUp.json()).user;
  assert.equal(identityA.name, "Student A");
  assert.ok(signUp.headers.getSetCookie().some(value => /httponly/i.test(value) && /samesite=lax/i.test(value)));
  const meA = await a.request("/api/me");
  assert.equal(meA.status, 200);
  assert.equal((await meA.json()).user.id, identityA.id);
  assert.equal((await a.request("/dashboard")).status, 200);
  assert.equal((await a.request("/api/auth/sign-up/email", { name: "Other", email: emailA, password })).status, 422);
  assert.equal((await guest.request("/api/auth/sign-up/email", { name: " ", email: `invalid-${run}@example.test`, password })).status, 400);
  assert.equal((await guest.request("/api/auth/sign-up/email", { name: "Invalid", email: `short-${run}@example.test`, password: "short" })).status, 400);

  const signUpB = await b.request("/api/auth/sign-up/email", { name: "Student B", email: emailB, password });
  assert.equal(signUpB.status, 200);
  const identityB = (await signUpB.json()).user;
  const meB = await b.request(`/api/me?userId=${identityA.id}`);
  assert.equal((await meB.json()).user.id, identityB.id, "Browser-supplied user IDs must not change ownership");
  const safeMe = await (await a.request("/api/me")).json();
  assert.deepEqual(Object.keys(safeMe.user).sort(), ["email", "emailVerified", "id", "name"]);
  const user = await db.collection("user").findOne({ email: emailA });
  assert.ok(user);
  const account = await db.collection("account").findOne({ userId: user._id });
  assert.ok(account?.password && account.password !== password, "Password must be hashed in the database");

  const stolenCookie = a.cookie();
  assert.equal((await a.request("/api/auth/sign-out", {})).status, 200);
  assert.equal((await a.request("/api/me")).status, 401);
  assert.equal((await guest.request("/api/me", undefined, { Cookie: stolenCookie })).status, 401, "Logout must revoke a copied session");
  assert.equal((await guest.request("/api/me", undefined, { Cookie: "better-auth.session_token=forged" })).status, 401);
  const forgedPage = await guest.request("/dashboard", undefined, { Cookie: "better-auth.session_token=forged" });
  assert.ok([302, 307].includes(forgedPage.status));
  assert.equal(new URL(forgedPage.headers.get("location"), base).pathname, "/login");

  assert.equal((await a.request("/api/auth/sign-in/email", { email: emailA, password: "wrong-password" })).status, 401);
  assert.equal((await a.request("/api/auth/sign-in/email", { email: emailA, password })).status, 200);
  assert.equal((await a.request("/api/me")).status, 200, "Session must survive another request");
  await db.collection("session").updateMany({ userId: user._id }, { $set: { expiresAt: new Date(0) } });
  assert.equal((await a.request("/api/me")).status, 401, "Expired database sessions must be rejected");

  const hostile = browser(`${testSubnet}.24`);
  assert.equal((await hostile.request("/api/auth/sign-up/email", { name: "Blocked", email: `blocked-${run}@example.test`, password }, { Origin: "https://untrusted.example" })).status, 403);
  const limited = browser(`${testSubnet}.25`);
  for (let attempt = 0; attempt < 5; attempt++) assert.equal((await limited.request("/api/auth/sign-in/email", { email: emailA, password: "wrong-password" })).status, 401);
  assert.equal((await limited.request("/api/auth/sign-in/email", { email: emailA, password: "wrong-password" })).status, 429);
  console.log("Passed: registration, server validation, duplicate emails, password hashing, session cookies, private pages/API, user isolation, login, logout revocation, forged/expired sessions, origin rejection, and rate limiting.");
} finally {
  // Delete only the random accounts created by this run, never existing students.
  if (connected) {
    const db = client.db(databaseName);
    const users = await db.collection("user").find({ email: { $in: [emailA, emailB] } }).toArray();
    const ids = users.map(user => user._id);
    if (ids.length) {
      await db.collection("account").deleteMany({ userId: { $in: ids } });
      await db.collection("session").deleteMany({ userId: { $in: ids } });
      await db.collection("user").deleteMany({ _id: { $in: ids } });
    }
  }
  await client.close();
}
