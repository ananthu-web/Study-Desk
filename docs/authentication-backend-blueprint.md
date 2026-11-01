# Authentication backend — Stage 1B

## Outcome

Connect the existing forms to actual private accounts while preserving their design and continuous mobile green-panel flow.

## Implemented flow

1. Welcome opens sign-up or login inside the same mobile panel.
2. Frontend validates fields and submits to Better Auth using same-origin requests.
3. Better Auth validates the server request, hashes passwords, and persists accounts and sessions in MongoDB.
4. Successful authentication opens `/dashboard`, currently an account confirmation screen.
5. Refresh preserves the session. Valid signed-in users opening an entry page redirect to the protected screen.
6. Logout revokes the server session, expires cookies, and returns to login.

## Modules

- `server/auth/config.ts`: server-only environment validation and trusted origins.
- `server/db/mongodb.ts`: shared connection pool with bounded connection/operation timeouts and retry after a failed connection.
- `server/auth/auth.ts`: lazy Better Auth instance and MongoDB adapter, using transactions with the MongoDB client.
- `server/auth/session.ts`: authoritative session lookup and protected-page helper.
- `app/api/auth/[...all]/route.ts`: public authentication handlers; connection/configuration failures return generic 503 responses without exposing credentials.
- `app/api/me/route.ts`: database-verified current-user endpoint; only returns ID, name, email, and verification status. Anonymous/invalid sessions return 401.
- `proxy.ts`: optimistic cookie-presence redirect for dashboard requests. A cookie alone never grants access.
- `components/auth/auth-client.ts`: same-origin browser client, with no server secrets.
- `app/dashboard/page.tsx`: protected account confirmation and logout. It does not implement study dashboard features.

## Data and access

Better Auth manages user, credential-account, session, verification, and rate-limit records. The current adapter creates its schema indexes automatically; no SQL migrations are used. Application data added in later stages must derive ownership from the validated session, never a user ID sent by the browser. The current-user API demonstrates this rule by ignoring supplied user IDs.

Session lifetime is seven days with a one-day refresh interval. Cookie session caching is disabled, so private reads verify the database session and reject revoked or expired tokens. Better Auth manages signed HttpOnly cookies and production secure-cookie behaviour. Production configuration requires HTTPS.

Password length is 8–128 characters. Names are trimmed, required, and limited to 100 characters; email length is limited to 254. The library validates email syntax and handles password hashing/verification. Frontend confirmation is a convenience; security relies on server validation.

## Abuse controls

- Trusted origins include only the configured production origin; development additionally permits localhost and 127.0.0.1 at port 3000.
- Rate limits are enabled in development and production, persisted in MongoDB. Sign-in and sign-up each allow five requests per minute per detected client IP; other endpoints use a general limit.
- Before deployment, verify the hosting proxy's IP header handling and network boundaries rather than trusting arbitrary forwarded headers.
- Authentication and database errors shown to students are generic. Do not log passwords, session cookies, or connection strings.

## Configuration

Required private values: `MONGODB_URI`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`; `MONGODB_DB` defaults to `studydesk`. The local secret was generated securely without printing its value. `.env.local` is ignored. Atlas requires an authorised database user and network access for the application's environment. Restart after environment changes.

## Validation completed

An isolated local replica set and a second Next.js server were used, without modifying Atlas student records.

- Real registration, duplicate-email rejection, name/password server validation, and hashed password storage.
- HttpOnly/SameSite cookie issuance, session persistence, and private-page/API access.
- Two users receive their own identity; browser-supplied ownership IDs do not change results.
- Wrong-password rejection, logout revocation of copied cookies, and forged/expired session rejection.
- Untrusted-origin rejection and rate-limit enforcement.
- Mobile browser flow through welcome, sign-up, protected screen, refresh, logout, wrong-password feedback, and real sign-in.
- Signed-in visitors redirect from account-entry pages to the protected screen.
- Supplied Atlas configuration responded to a read-only ping. The regular local application's `/api/auth/get-session` endpoint initialised successfully and returned HTTP 200 for a guest. No student account was created in Atlas during verification.

`npm run test:auth` reruns HTTP/database checks against a separate local test environment and refuses remote database/server URLs. The suite removes its own randomly named test accounts only.

## Remaining before Stage 1 is complete

- Have the student create/sign into their own account using the verified Atlas configuration.
- Choose/configure an email provider, then implement password recovery and email verification; these are currently unavailable and are not simulated.
- Verify deployment HTTPS origin, cookie settings, trusted proxy/IP behaviour, and live account flows before public launch.

References: [Better Auth installation](https://better-auth.com/docs/installation), [MongoDB adapter](https://better-auth.com/docs/adapters/mongo), [Next.js integration](https://better-auth.com/docs/integrations/next), and [rate limits](https://better-auth.com/docs/concepts/rate-limit).
