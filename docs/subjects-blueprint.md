# Subjects — blueprint and frontend brief

Stage 3 · 4 November 2026

## Purpose and journey

Give each subject a private home for its folders, PDFs, resource links, and notes. Open Subjects → choose or add a subject → enter its workspace → find a chapter/material → study or write. A subject must remain useful even with no folders. Keep the accepted StudyDesk palette, shared book, serif headings, capsule actions, readable body text, safe areas, and mobile bottom navigation. No ambient animation in this workspace.

## Delivery order and current boundary

1. Blueprint and Subjects frontend: shelf, Add/Edit/Delete subject forms, colour/goal choices, first-use/sample states, subject workspace, and material/note layout previews.
2. MongoDB-backed subject CRUD with per-user ownership checks and real loading/errors.
3. Nested folder operations and navigation.
4. Private Backblaze B2 uploads and resource links.
5. PDF viewing and resource rename/move/delete.
6. Quick notes with reliable save feedback; connect Focus when its timer exists.

Steps 1 and 2 are implemented. On authenticated routes, Your subjects is loaded from MongoDB and Add/Edit/Delete changes persist only after a successful API response. New accounts start empty. The separate Sample subjects shelf and all development preview subjects remain in-memory examples and reset when leaving/reloading; they never write to MongoDB. Folder/material/note contents remain illustrative or empty. B2 uploads, actual folder CRUD, PDF viewing, and note saving are still unimplemented.

## Screen blueprint

Subjects shelf: eyebrow and expressive heading, short description, count, Add subject action, Your subjects / Sample subjects switch, then book-like cards. Each card shows the subject name, short description, selected colour, optional daily goal, and explicit sample/preview status. Put edit controls separately from the card-opening button: never nest interactive elements. First-use state offers Add subject and Browse examples.

Subject workspace: Back to subjects, subject identity on a green panel, description, optional goal, Edit subject, and a link to the Focus landing page. Do not claim that a timer starts or that the subject is preselected yet. Materials and Notes tabs have proper selected states and arrow-key navigation. Sample materials include chapter folders and titled document/link rows; clicking a row explains that it is a fictional resource, without opening arbitrary external URLs. New subjects show clear empty states. Notes use a read-only illustrative sample until note editing is built.

URL state: `?subject=<id>&tab=materials|notes&folder=<id>` supports browser Back/Forward and sample deep links. Saved subject IDs survive refresh. New preview subject IDs exist only until the section unmounts; a stale URL must show a clear unavailable state and a way back. Opening a different subject scrolls the internal main area to the top and focuses the workspace heading without opening a keyboard. Switching Materials/Quick notes or browsing folders within the same subject preserves scroll and control focus. Switching shelves preserves each shelf's in-memory edits and clears detail navigation.

## Subject form and rules

- Name: required, trimmed, collapse repeated whitespace; 1–60 characters. Case-insensitive duplicates rejected within the current shelf; backend will enforce per-user uniqueness.
- Description: optional, maximum 160 characters, plain text.
- Colour: six restrained options (sage, sand, clay, slate, olive, rose); selectable radio group with both readable name and selected indicator. Colour is supplementary, never the only identifier.
- Subject daily goal: optional whole number, 15–480 minutes. Independent of the dashboard's overall daily goal: do not silently sum, change, or double-count goals. Leave blank for no goal.
- Saved subjects use Add subject / Save changes with a real pending state and disabled fields/actions during the request. Sample subjects retain Add/Update preview. Inline validation focuses the first invalid input. API errors keep the dialog and entered values available; no success is shown until the request succeeds.
- Native modal dialog traps focus, closes on Escape/close/outside click, and returns focus to its trigger where possible. On deleting the selected subject, focus returns to the shelf heading.
- Delete uses an explicit confirmation naming the subject. During this frontend step only the local preview entry is removed. Later, real deletion must explain nested folder/file/note consequences and clean up stored objects; never claim a completed remote deletion before cleanup is confirmed.

## Data and server contract

Subject: id, userId, name, normalisedName, description, colour enum, optional dailyGoalMinutes, createdAt, updatedAt. Add a unique `{userId, normalisedName}` index. Folder: id, userId, subjectId, parentId|null, name, timestamps. Resource: id, userId, subjectId, folderId|null, title, type, storageKey or URL, size/content type, upload status, timestamps. Note: id, userId, subjectId, title/body, version, updatedAt.

Subjects API: authenticated list/create/update/delete. Take userId from the verified session, never the browser. Apply ownership checks to subject and every referenced folder/resource. Enforce validation on the server too, handle concurrent duplicate names, and return non-leaking missing/unauthorised results. Use existing MongoDB driver; do not add Mongoose solely for this feature.

Proposed folder policy: maximum five folder levels, sibling names unique ignoring case, no folder cycles, no cross-subject moves initially. Confirm final policy when implementing folders.

Proposed uploads policy: PDF only initially, maximum 20MB/file, initial 100MB/user quota with configurable global budget. These are design proposals, not enforced limits yet. Validate file contents and size server-side, issue short-lived scoped uploads/downloads only after ownership checks, and keep B2 private. Store object keys, never permanent public file URLs. Validate links as HTTPS (optionally HTTP where explicitly permitted); reject script/data URLs. Plan object cleanup, abandoned uploads, quota reservations, and B2 version lifecycle before enabling uploads. Shared B2 free storage is per account, not per student.

Notes will use debounced saves with visible saving/saved/failed states, retry, conflict detection, and navigation protection for unsaved changes. No editable notes without a reliable persistence path.

## States and acceptance

Cover empty/populated shelves, no-goal subjects, long names, duplicate/invalid form values, create/edit/delete/cancel, stale subject/folder URLs, materials/notes tabs, sample folder navigation, explanatory resource dialog, light/dark, keyboard, small phones, and scroll/safe-area clearance. Later cover actual request loading/failure/retry and upload progress/cancellation.

Acceptance: own subjects persist through authenticated APIs; samples remain explicitly separate; no data from another account is returned or modified. Authenticated routes remain protected. Production never exposes the unauthenticated development preview. Physical Safari/iPhone review and backend integration remain separate checks.

## Verification completed

Production build and TypeScript passed. Chrome checks covered 320×640, 390×844, 430×932, 768×1024, and 1440×1000: subject shelf/workspace and dialogs remained within viewport bounds without horizontal overflow. Confirmed the close control stays visible when a long form scrolls. Reviewed mobile light/dark screenshots and the subject workspace. Browser checks passed required-name and duplicate-name errors, whitespace normalisation, invalid/optional goals, colour selection, add/edit/delete/cancel, tabs and keyboard arrows, history, sample folders/resource dialogs, stale subject/folder URLs, and unauthenticated redirects, with no browser runtime errors. This is frontend verification, not proof of persistence, B2 access, or physical iPhone compatibility.

## Implemented persistence and current limits

`server/subjects/service.ts` owns validated MongoDB operations. `subjects` uses unique `{userId, normalisedName}` and `{userId, createdAt}` indexes. List/single GET, POST, PATCH, DELETE are under `/api/subjects`. They verify database-backed sessions, filter every query by the session's user ID, reject extra fields, and return explicit DTOs without owner/internal fields. Mutations require a configured trusted Origin. JSON bodies are bounded to 8KB. Names use collapsed whitespace and locale-independent lowercase for the unique key. Duplicate races return 409; unauthorised/missing IDs both return 404; transient server errors are generic 503. Responses are no-store.

The UI loads with an AbortController, shows a genuine loading/error/retry state, redirects expired sessions to welcome, prevents duplicate submissions, and keeps entered form values after request failure. Dashboard Home reads the same endpoint and shows up to three saved subjects. Editing is last-write-wins; no collaborative versioning is claimed. Deletion is limited to empty subjects: if a future folder/resource/note exists, it returns 409 rather than orphaning content. Real file cleanup will be designed with folder/storage integration.

`npm run test:subjects` refuses remote app/database targets and uses disposable accounts in `studydesk_auth_test_subjects`. API/database tests passed persistence, cross-user list/read/update/delete rejection, injected owner fields, safe DTOs, concurrent duplicate names, input/body validation, origin checks, forged sessions, child guards, and deletion. Phone Chrome checks against the isolated server passed create → reload → edit → reload → dashboard summary → failed delete → successful delete → reload, remote-duplicate errors preserving input, and list-error retry. Test accounts/subjects were removed. No Atlas student data was created or modified during tests. Production build/TypeScript passed. A read-only deployed auth endpoint recheck returned HTTP 200; this does not substitute for a physical iPhone account flow after deployment.
