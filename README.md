# StudyDesk

Mobile-first study workspace with welcome/login/sign-up UI and email/password authentication through Better Auth and MongoDB.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000 for the welcome screen, then choose Get started or the existing-account sign-in option. The forms are also available directly at `/login` and `/signup`.

## Local account configuration

Use `.env.example` as a reference for `.env.local`:

- `MONGODB_URI`: your private Atlas connection string, with a database user/password and network access configured in Atlas.
- `MONGODB_DB`: application database name; defaults to `studydesk`.
- `BETTER_AUTH_SECRET`: a stable, random secret of at least 32 characters. A local secret was generated during setup; do not share it or regenerate it between normal restarts.
- `BETTER_AUTH_URL`: the application origin, currently `http://127.0.0.1:3000`. Both localhost loopback origins are trusted during development. Production requires the actual HTTPS origin.

Credentials belong only in the ignored `.env.local` file or deployment environment. Restart the development server after changing configuration. No private configuration is included in the browser bundle.

## Verify

```sh
npm run typecheck
npm run build
```

The production build uses Next.js's supported Webpack compiler because Turbopack encountered a worker-port restriction in the execution environment. Development also uses Webpack.

`npm run test:auth` runs integration checks against a separate application server at `http://127.0.0.1:3001` and a local MongoDB replica set at port 27028, using `studydesk_auth_test`. Start the local replica set and the second dev server with these test-only environment overrides: `STUDYDESK_AUTH_TEST=1`, `MONGODB_URI=mongodb://127.0.0.1:27028/?replicaSet=studydesk-test`, `MONGODB_DB=studydesk_auth_test`, and `BETTER_AUTH_URL=http://127.0.0.1:3001`; run the second server on port 3001. The second server uses an ignored `.next-auth-test` build directory. The test runner refuses remote servers/databases and removes only the random accounts it creates. It does not run against Atlas.

## Current scope

- Responsive login and sign-up pages with shared layout.
- Persistent mobile green panel: welcome content fades into login/sign-up, with Back to welcome, real route URLs, reduced-motion support, and internal form scrolling.
- Warm editorial styling, custom vector desk artwork, and reduced-motion-aware transitions.
- Persistent light/dark theme selection.
- Client-side validation, password visibility, and server-side input validation.
- Real registration, sign-in, persistent database-backed sessions, and logout.
- Protected dashboard and shared app shell with mobile tabs, desktop navigation, section landing pages, and private `/api/me` endpoint.
- First-use and explicitly labelled sample dashboard views, goal/subject preview dialogs, and temporary sample plan completion.
- Persistent Light/Dark/System preferences in Settings.
- Cookie-only proxy redirects backed by authoritative session checks in pages and APIs.
- Database-backed rate limits and trusted-origin checks.

The dashboard frontend is implemented; subjects, tracking, plans, and events remain unconnected. Real accounts start with an empty desk; sample data is explicitly labelled and local interactions are temporary. Use `/preview/dashboard` locally for a fictional student design preview without logging in; the preview is unavailable in production. Password recovery and email verification are not connected yet because no email provider is configured. Do not treat Stage 1 as fully complete or launch publicly until those account flows and deployment settings are reviewed. The frontend remains viewable without database configuration; actual account actions return a clear unavailable message until configuration works.

See [the project plan](docs/studydesk-project-plan.md), [login frontend blueprint](docs/login-frontend-blueprint.md), and [authentication backend blueprint](docs/authentication-backend-blueprint.md).

See [the dashboard frontend blueprint](docs/dashboard-frontend-blueprint.md) for Stage 2 interaction and integration boundaries.
