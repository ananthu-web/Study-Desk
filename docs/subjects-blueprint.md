# Subjects — complete section blueprint

Updated 4 November 2026. Implementation is complete for the scope below, tested locally with an isolated database and real private B2 storage. Production environment setup and physical iPhone verification remain deployment checks.

## Purpose and journey

Subjects → subject workspace → chapter folder → PDF or class link, with Quick notes beside Materials. Keep the accepted warm stone/charcoal, green subject panel, shared book logo, serif headings, readable body text, capsule controls, and mobile bottom navigation. No ambient motion in study workspaces. Materials/Notes changes preserve scroll; opening another subject resets the workspace to its heading.

## Implemented features

- Subjects: authenticated create/read/update/delete, six colours, descriptions, optional daily goals, unique names per student. Home shows saved subjects. Samples remain separate in-memory examples.
- Folders: create, rename, move within the subject, browse nested folders with breadcrumbs, and recursively delete with confirmation. Five levels maximum; 100 folders per subject; case-insensitive sibling names; no cycles or cross-subject parents.
- Materials: private PDFs and HTTPS resource/class links. Create links, rename/move resources, edit link addresses, delete individual resources, and open links safely in a new tab. Up to 200 materials per subject. Resources may live directly at the subject root.
- PDFs: choose/upload, actual progress and cancellation, completion validation, unfinished-upload recovery/removal, canvas reader with page navigation and zoom, download original, rename/move/delete. Downloads use the latest displayed title. Private signed access is checked before every URL is issued.
- Notes: one plain-text quick note per subject; 20,000 characters; automatic saving after 900ms of inactivity; visible saving/saved/unsaved/error states; retry; version-based conflict rejection; copy draft and reload saved note actions. Session-local drafts recover interrupted editing where browser storage is available. Warn before leaving with unsaved changes. Browser history/navigation cannot guarantee a save while offline; recovered drafts are the fallback.

## Screens and interactions

Shelf: header/action, own/sample switch, book-like cards, optional daily intention, Add/Edit form, empty/error/retry states. Subject form: name required 1–60 characters after trimming/collapsing whitespace; description up to 160; palette radio group; optional 15–480 whole minutes. Subject goal is separate from the dashboard's daily goal.

Workspace: subject identity, edit action, daily intention, Focus link (timer functionality belongs to Stage 4), Materials/Quick notes tabs. Materials has breadcrumbs, New folder, Upload PDF, Add link, capacity display, folder cards and resource rows. Rename/move uses a destination selector. Destructive dialogs explicitly describe recursive deletion. Native dialogs trap focus, support Escape and close controls, and keep their close button visible while long forms scroll. Pending destructive requests cannot be accidentally dismissed.

Subject/tab/folder URL state uses query parameters and supports Back/Forward. Saved IDs survive reload; missing/foreign IDs show unavailable states. Sample and development preview subjects remain temporary, clearly labelled, and never write to account storage. Development preview URLs are not exposed in production.

## Data, ownership, and concurrency

MongoDB driver, existing Better Auth sessions. Every read/write derives userId from the verified session and scopes subjects, folders, notes and resources to that owner. Client-provided userId and unknown fields are rejected. Mutations require a configured trusted Origin; JSON bodies are bounded. Public DTOs omit storage keys, owner IDs, internal flags and credentials. Auth failures return 401; inaccessible/missing records return the same 404. Responses are no-store.

Subjects have unique `{userId, normalisedName}` plus owner/time indexes. Folders use unique `{userId, subjectId, parentId, normalisedName}`. Notes are unique per user/subject. Folder/resource/note transactions update the parent subject to serialize workspace changes, preventing creation into deleting folders and folder move cycles. Subject name edits are last-write-wins; note edits use version comparison and never silently overwrite a newer saved version.

Delete operations mark content as deleting, remove B2 versions before releasing quota/removing metadata, and preserve retry state if storage cleanup fails. Folder deletion removes its descendants and materials; subject deletion also removes its note. Notes are unaffected by deleting a folder. Daily maintenance retries interrupted cleanup. Long/large deletions may need retry if a hosting request times out; already completed cleanup is preserved.

## File storage and limits

Private Backblaze B2 via S3. 20 MB/PDF; 100 MB total PDFs per student, including reservations for unfinished uploads. Reserve quota transactionally before issuing a scoped upload URL; at most five unfinished uploads per user. Browser sends files directly to B2, avoiding Vercel request-size limits. PUT signatures include the exact content length/type and expire after two minutes. Reservations expire after ten minutes to allow slow in-flight uploads. Completion verifies actual object size/type and a PDF header, then pins its B2 version. This is file-format validation, not malware scanning.

Read/download URLs are issued only after ownership checks and expire after five minutes. The PDF reader uses locally bundled PDF.js worker/fonts/CMaps/WASM. Canvas rendering does not provide selectable text; download the original for native accessibility tools. Damaged or password-protected PDFs may require the original/native reader. Physical Safari behaviour remains to be checked.

Cleanup deletes actual B2 versions, not just hide markers. A signed upload URL can be reused briefly, so deferred cleanup removes abandoned/repeated versions after expiry while retaining the validated version of a live PDF. A daily protected Vercel job handles users who never return; workspace visits also sweep eligible work. Existing unrelated bucket CORS rules are preserved and bucket privacy is unchanged.

## Routes

`/api/subjects` and `/api/subjects/[id]`: subject CRUD.
`/[id]/workspace`: current folder contents and the complete folder tree/capacity.
`/[id]/folders` and `/[id]/folders/[item]`: folder create/update/delete.
`/[id]/resources` and `.../resources/[item]`: start upload/create link, update, delete.
`.../resources/[item]/complete`: verify and finalize PDF.
`.../resources/[item]/file`: obtain a short-lived read/download URL.
`/[id]/note`: read/versioned save.
`/api/maintenance/storage`: daily cleanup, restricted by a strong CRON_SECRET bearer token.

## Deployment

See [storage setup](storage-setup.md). Set all five B2 settings and CRON_SECRET privately in Vercel Production, then redeploy. The source includes the daily cron schedule; requests are rejected if its secret is missing or invalid. A generated local cleanup secret is in ignored `.env.local`. Never expose storage credentials through NEXT_PUBLIC variables. Use a fresh bucket-scoped B2 key before public launch because the earlier key was disclosed in chat.

## Verification

Build and TypeScript passed. `npm run test:subjects` verifies subject CRUD/ownership; `npm run test:materials` refuses remote DB/app targets, uses disposable local accounts, and creates/removes exact tiny test keys in B2. Integration checks passed nested depth/cycle/duplicate constraints, cross-user access, HTTPS links, quota reservations/releases, PDF signature/size validation, private upload/read/download, version pinning and protected deferred cleanup, rename/move, note persistence/conflicts, recursive cleanup, and deletion.

Phone Chrome checks passed real browser B2 upload, PDF page navigation/zoom, resource moves, note autosave/refresh, conflicts, failed-save retry, and full subject deletion. Layouts were checked at 320×640, 390×844, and 1440×1000; light-mode material and PDF screenshots were inspected. Physical iPhone/PWA testing and production configuration remain distinct from local browser verification. No real Atlas student records were created or deleted during tests.
