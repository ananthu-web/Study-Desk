# Dashboard and app shell blueprint

Stage 2 frontend · 4 November 2026

Purpose: make the next study action obvious, give subjects a home, and show a realistic daily overview. Mobile first; carry the accepted warm stone, charcoal, forest green, cream, curved controls, and shared book mark forward. Serif is reserved for expressive headings and time totals. No looping decorative motion in the workspace.

## Routes and protection

`/dashboard` is Home. `/dashboard/subjects`, `/dashboard/focus`, `/dashboard/planner`, `/dashboard/calendar`, and `/dashboard/settings` share a persistent shell. The server layout validates the session. The Home page also checks the session before using the user's name. No new study API or database writes. Existing logout stays connected. Unknown sections render the Next.js not-found screen.

## Hierarchy

Phone: compact capsule logo, theme and settings controls; date and greeting; Your desk/Sample desk selector; green focus/goal panel; subject shelf; today agenda; upcoming deadline. Keep body text readable, touch targets at least 44px, and bottom navigation above the iPhone safe area. Scroll the workspace internally; never cut off content to force a screen fit.

Desktop: 224px sidebar, roomy editorial content column, horizontally composed study panel, three subject cards, agenda beside upcoming deadlines. Avoid repeated generic statistic cards. Extend light/dark tokens with reusable buttons, status chips, ruled rows, dialogs, and empty states.

## States and interactions

Real accounts default to a first-use empty desk. Sample desk explicitly shows fixture subjects, 95/120 minutes of progress, plans, and deadlines. The mode selector never changes saved student data. In sample mode, goal editing and completing agenda items are temporary local interactions; labels explain this. Subject cards open a native accessible dialog with sample topic details. Escape, close button, and backdrop dismiss dialogs; restore focus on close. Start studying leads to Focus; Add subject leads to Subjects, whose forms now support explicitly labelled temporary preview subjects until persistence is integrated. No fake timer or file uploads.

Navigation highlights the current route and uses aria-current. Mobile has Home, Subjects, Focus, Planner, Calendar; Settings remains accessible in the header. Desktop includes Settings. Settings offers persistent Light/Dark/System choice and actual logout. System preference follows OS changes when selected.

Section pages establish context and empty states, not completed features: subject creation/storage, timer sessions, planner persistence, and calendar events await their own blueprints and backend integration. Settings profile uses the authenticated name; there is no editable profile or false save control.

## Preview and assets

`/preview/dashboard` and section URLs below it are development-only, use a fictional student, and contain no account data. Production renders the not-found screen with no preview data. With Next.js streaming, its HTTP status may already be 200. The sample illustration is the shared code-native book, with no downloaded image dependencies. Motion is limited to short interface feedback and respects reduced motion.

## Acceptance and verification

Build/type checks must pass. Verify phone widths 320/390/430px, tablet and desktop; light/dark/system; navigation; empty/sample modes; goal validation; plan toggles; dialog keyboard/focus handling; internal scrolling and safe-area clearance. Keep authentication checks in the protected layout and pages, with no development bypass on real routes. Physical iPhone testing remains required. Dashboard summaries remain fixtures until the underlying features exist.

## Verification completed

Production build and TypeScript checks passed. Automated Chrome checks covered 320×640, 390×844, 430×932, 768×1024, and 1440×1000 with no horizontal overflow. Inspected phone light/dark and desktop screenshots. Dialog opening/Escape dismissal, temporary goal editing, plan completion, first-use/sample switching, all mobile tabs, active states, persistent theme selection, live OS theme changes, unknown-section handling, and guest redirects passed with no browser runtime errors. The development-only Next.js badge was hidden during interaction checks because it overlapped the Home tab; it is absent in production. Production checks confirmed both dashboard preview paths render not-found content and protected Settings redirects guests to welcome. Physical Safari/iPhone and a fresh authenticated production account flow remain to be checked. No study persistence or real timer is claimed.

Subjects frontend update: see [Subjects blueprint](subjects-blueprint.md). The shared Subjects landing placeholder has been replaced by the shelf/workspace frontend, with no change to authentication or study-data persistence.

Saved subject integration: Your desk now reads authenticated MongoDB subjects, shows a real count and up to three recent subjects, and links into their saved workspaces. Sample desk retains fixtures. Goal/time/planner/calendar summaries are still previews. Subject load failures show Retry instead of a false empty state.

Subjects completion update: the live subject workspace now has saved folders, B2 PDFs, links, quick notes, and recursive cleanup. Sample desk/subjects remain explicit fixtures. See Subjects and storage blueprints for deployment settings.


Status-bar theme update: a root-level ThemeSync now keeps browser theme metadata aligned with the selected app theme across welcome, authentication, dashboard, and settings. The first body script applies saved/system appearance after head metadata is parsed and before visible content. Theme changes, OS appearance changes (System only), cross-tab storage, and pageshow restoration update both document colours and theme metadata. The root background uses the paper token. Existing default Apple status-bar style and safe-area layout remain. Actual installed-iPhone rendering must be checked after deployment; no native status-bar guarantee is inferred from desktop browser tests.

The runtime owns one theme-colour meta element rather than modifying a React-managed static viewport element before hydration; this avoids duplicate tags or a restored server colour when a saved dark theme hydrates. The manifest retains warm stone as the install/launch fallback.

Status-bar verification: production build and TypeScript passed (with an existing Next.js security advisory). Chrome checks at 320px/390px verified saved Light/Dark against the opposite OS appearance, reload, System changes, both theme controls, navigation, cross-tab storage, pageshow restoration, welcome and startup with hydration scripts blocked. One theme-colour tag and matching document background; no runtime errors. This does not verify native iPhone status-bar pixels.


Connected phone header update: the green top bar and hero share a green scroll backdrop. The main area flexes to fill available height as the top bar collapses; scroll anchoring is disabled there and vertical elastic overscroll is suppressed where supported. Cream is reserved for the rounded sheet and full-width footer. Browser theme colour now uses a shared CSS chrome token: dashboard green on phone, normal paper on desktop, and a green safe-area strip in installed entry screens so iOS white status icons remain readable. A root pseudo-element paints the installed top inset while existing safe-area padding protects controls. The Apple status-bar style changes to black-translucent to let content paint beneath it. This supersedes the earlier default-style decision. Physical installed-iPhone verification remains necessary; cached installation metadata may need a refreshed Home Screen shortcut.

Connected-header verification: build/TypeScript passed with the existing Next.js security advisory. Chrome checks covered all six sections at initial, scrolled and restored positions: no gap between header and main, full-height main, green backgrounds and one matching chrome meta tag. Checked 320/390/414px phone widths, desktop and entry colour restoration, both themes, subject workspace header visibility and green startup before hydration. Inspected the corrected Focus screenshot. Native standalone CSS/status-bar rendering and iOS elastic gestures were not emulated; physical iPhone verification remains outstanding.
