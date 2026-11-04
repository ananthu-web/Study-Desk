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

This delivery implements step 1 only. Subject changes are component state, explicitly labelled temporary, and disappear on reload or leaving the section. They are not saved to an account or browser storage. New signed-in accounts start empty. A separate Sample subjects shelf contains fictional examples. Development preview defaults to the sample shelf. No API, DB operation, B2 call, real file upload, PDF viewer, or note save is simulated.

## Screen blueprint

Subjects shelf: eyebrow and expressive heading, short description, count, Add subject action, Your subjects / Sample subjects switch, then book-like cards. Each card shows the subject name, short description, selected colour, optional daily goal, and explicit sample/preview status. Put edit controls separately from the card-opening button: never nest interactive elements. First-use state offers Add subject and Browse examples.

Subject workspace: Back to subjects, subject identity on a green panel, description, optional goal, Edit subject, and a link to the Focus landing page. Do not claim that a timer starts or that the subject is preselected yet. Materials and Notes tabs have proper selected states and arrow-key navigation. Sample materials include chapter folders and titled document/link rows; clicking a row explains that it is a fictional resource, without opening arbitrary external URLs. New subjects show clear empty states. Notes use a read-only illustrative sample until note editing is built.

URL state: `?subject=<id>&tab=materials|notes&folder=<id>` supports browser Back/Forward and sample deep links. New preview subject IDs exist only until the section unmounts; a stale URL must show a clear unavailable state and a way back. Query changes scroll the internal main area to the top and focus the workspace heading without opening a keyboard. Switching shelves preserves each shelf's in-memory edits and clears detail navigation.

## Subject form and rules

- Name: required, trimmed, collapse repeated whitespace; 1–60 characters. Case-insensitive duplicates rejected within the current shelf; backend will enforce per-user uniqueness.
- Description: optional, maximum 160 characters, plain text.
- Colour: six restrained options (sage, sand, clay, slate, olive, rose); selectable radio group with both readable name and selected indicator. Colour is supplementary, never the only identifier.
- Subject daily goal: optional whole number, 15–480 minutes. Independent of the dashboard's overall daily goal: do not silently sum, change, or double-count goals. Leave blank for no goal.
- Submit label explicitly says Add/Update preview. Inline errors associate with their field and focus the first invalid input. No fake network spinner.
- Native modal dialog traps focus, closes on Escape/close/outside click, and returns focus to its trigger where possible. On deleting the selected subject, focus returns to the shelf heading.
- Delete uses an explicit confirmation naming the subject. During this frontend step only the local preview entry is removed. Later, real deletion must explain nested folder/file/note consequences and clean up stored objects; never claim a completed remote deletion before cleanup is confirmed.

## Future data and server contract (not yet implemented)

Subject: id, userId, name, normalisedName, description, colour enum, optional dailyGoalMinutes, createdAt, updatedAt. Add a unique `{userId, normalisedName}` index. Folder: id, userId, subjectId, parentId|null, name, timestamps. Resource: id, userId, subjectId, folderId|null, title, type, storageKey or URL, size/content type, upload status, timestamps. Note: id, userId, subjectId, title/body, version, updatedAt.

Subjects API: authenticated list/create/update/delete. Take userId from the verified session, never the browser. Apply ownership checks to subject and every referenced folder/resource. Enforce validation on the server too, handle concurrent duplicate names, and return non-leaking missing/unauthorised results. Use existing MongoDB driver; do not add Mongoose solely for this feature.

Proposed folder policy: maximum five folder levels, sibling names unique ignoring case, no folder cycles, no cross-subject moves initially. Confirm final policy when implementing folders.

Proposed uploads policy: PDF only initially, maximum 20MB/file, initial 100MB/user quota with configurable global budget. These are design proposals, not enforced limits yet. Validate file contents and size server-side, issue short-lived scoped uploads/downloads only after ownership checks, and keep B2 private. Store object keys, never permanent public file URLs. Validate links as HTTPS (optionally HTTP where explicitly permitted); reject script/data URLs. Plan object cleanup, abandoned uploads, quota reservations, and B2 version lifecycle before enabling uploads. Shared B2 free storage is per account, not per student.

Notes will use debounced saves with visible saving/saved/failed states, retry, conflict detection, and navigation protection for unsaved changes. No editable notes without a reliable persistence path.

## States and acceptance

Cover empty/populated shelves, no-goal subjects, long names, duplicate/invalid form values, create/edit/delete/cancel, stale subject/folder URLs, materials/notes tabs, sample folder navigation, explanatory resource dialog, light/dark, keyboard, small phones, and scroll/safe-area clearance. Later cover actual request loading/failure/retry and upload progress/cancellation.

Frontend acceptance: all implemented controls work locally and clearly identify unsaved previews; no real account data is fabricated or overwritten. Authenticated routes remain protected. Production never exposes the unauthenticated development preview. Physical Safari/iPhone review and backend integration remain separate checks.

## Verification completed

Production build and TypeScript passed. Chrome checks covered 320×640, 390×844, 430×932, 768×1024, and 1440×1000: subject shelf/workspace and dialogs remained within viewport bounds without horizontal overflow. Confirmed the close control stays visible when a long form scrolls. Reviewed mobile light/dark screenshots and the subject workspace. Browser checks passed required-name and duplicate-name errors, whitespace normalisation, invalid/optional goals, colour selection, add/edit/delete/cancel, tabs and keyboard arrows, history, sample folders/resource dialogs, stale subject/folder URLs, and unauthenticated redirects, with no browser runtime errors. This is frontend verification, not proof of persistence, B2 access, or physical iPhone compatibility.
