# Private Backblaze B2 storage setup

StudyDesk uses MongoDB for records and private B2 objects for PDFs. The configured bucket was checked successfully and is private. Its EU Central S3 endpoint is `https://s3.eu-central-003.backblazeb2.com`, region `eu-central-003`. Do not make it public.

## Vercel environment variables

Copy these from the ignored local `.env.local` into Vercel Production (and Preview only if using a separately trusted preview origin):

- `B2_KEY_ID`
- `B2_APPLICATION_KEY`
- `B2_BUCKET_NAME`
- `B2_ENDPOINT`
- `B2_REGION`
- `CRON_SECRET` — a private random cleanup-job secret, generated locally if absent.

The project pins Node.js 24.x, matching the verified local build and the current PDF.js runtime requirements. Keep the existing MongoDB and Better Auth variables. Never use NEXT_PUBLIC prefixes. Redeploy after changes. Do not paste credentials in chat, screenshots, documentation or Git.

## Browser CORS

The private bucket has a `studydesk-browser` CORS rule for PUT/GET/HEAD from `https://study-desk-three.vercel.app` plus local development/test origins. Allowed request headers are Content-Type/Range; exposed headers include ETag, Content-Length, Content-Range and Accept-Ranges. Existing unrelated rules were preserved. If the app domain changes, add its exact origin and update Better Auth's configured origin as well. CORS grants browser access to signed requests; it does not make objects public.

## Cleanup

`vercel.json` schedules `/api/maintenance/storage` once daily at 03:00 UTC. Vercel supplies `Authorization: Bearer <CRON_SECRET>`; the endpoint refuses missing/short/incorrect secrets. Hobby scheduling is not exact to the minute. The job handles expired upload reservations, surplus versions, and interrupted deletions. Workspace visits provide additional opportunistic cleanup. Monitor failed cleanup jobs; completed work is preserved for retry.

Limits: 20 MB/PDF, 100 MB/user, five simultaneous upload reservations, 100 folders and 200 materials per subject. These are enforced application limits, not a promise that all B2 usage will be free. All students share the account's provider allowance.

## Testing

Use a separate local MongoDB replica set at 27028, a test app at 3001, and database `studydesk_auth_test_subjects`. Start the server with STUDYDESK_AUTH_TEST=1, local MONGODB_URI, that MONGODB_DB, and BETTER_AUTH_URL=http://127.0.0.1:3001. It inherits private B2 and CRON settings from `.env.local`. `npm run test:materials` refuses remote DB/app targets and deletes only its exact generated test objects and disposable local records. It does make tiny temporary writes to the configured B2 bucket.

References: [B2 S3 compatibility](https://www.backblaze.com/docs/cloud-storage-s3-compatible-api), [B2 version listing](https://www.backblaze.com/apidocs/s3-list-object-versions), [Vercel cron security](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
