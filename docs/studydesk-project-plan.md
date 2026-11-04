# StudyDesk — Project Plan and UI/UX Brief

Updated: 25 October 2026

## 1. Product

StudyDesk is a mobile-first personal digital study desk. Students organise materials, plan work, study with a timer, and track progress in one private workspace.

Primary journey:

**Welcome → sign up or log in → understand today's priorities → choose a subject → study → review progress → plan the next session.**

Core sections:

- Dashboard.
- Subjects, nested folders, files, links, and subject notes.
- Study timer and Focus Mode.
- Planner.
- Calendar.
- Settings.

### Ongoing UI requirements — apply to every section

Read these requirements and the UI/UX master prompt before designing or changing any StudyDesk interface. Carry them into every section blueprint and design review.

- **Comfortable studying:** make the workspace easy to use for sustained reading and study. Prioritise comfortable brightness, clear hierarchy, and predictable interactions.
- **Readability first:** use regular-weight sans-serif for body text, generally 15–16px; use 16px input text and 14–16px medium or semibold labels and buttons. Helper text must remain legible with sufficient contrast. Do not reduce important text to tiny or thin styles just to fit the screen.
- **Character and visual warmth:** retain a distinctive, carefully composed identity. Use typography, balanced spacing, purposeful imagery, and subtle interaction feedback to make the app feel welcoming, pleasant, and motivating. Avoid a bland or repetitive generated-dashboard appearance.
- **Quiet during study:** use visual character where it helps, with less decoration and movement in reading and Focus Mode. Mood and concentration benefits are design goals to assess through feedback, not guaranteed effects of a colour or style.
- **Mobile comes first:** design the phone experience before adapting it for larger screens. Check touch targets, text wrapping, safe areas, keyboard access, and realistic content.
- **Fit without cutting off content:** keep the app shell within the dynamic viewport. Adapt spacing and decorative artwork before compromising readability. Allow internal scrolling when smaller screens, zoom, keyboard, or errors require it; never hide necessary controls to force a fit.
- **Document decisions:** keep this plan and the relevant section blueprint aligned when a visual direction or UX rule is accepted or changed. Record verification limits honestly.

### Accepted visual decisions

- Welcome screen before login, with separate Get started and Sign in paths.
- Light mode: warm stone page background (`#F1EFE8`), dark readable text, and restrained green accents.
- Light background texture trial: a faint, static monochrome paper grain on warm stone, using a lightweight local SVG tile at low opacity. Apply it to the page background only so opaque green panels and input surfaces remain clear. No animation; dark mode keeps its plain charcoal background. Assess through user review.
- Light background graphic trial: faint notebook margin lines and small hand-drawn loop marks at the outer edges, using a local SVG behind the interface. Static, low contrast, decorative, and non-interactive; opaque panels and controls cover the marks. Scale the margins down on phones, preserve layout dimensions, and keep dark mode plain. Avoid four-point sparkles that resemble another product's branding.
- Notebook ruling visibility: use a stronger but restrained stroke, keep stroke width stable when scaled, and extend the SVG across the full margin height. Lines should be visible at normal phone size; avoid making the background so faint that the detail disappears. Keep the marks behind the content and retain the sparkle removal.
- Dark mode: neutral charcoal surfaces, warm white text, and restrained green accents. The desktop authentication artwork panel remains green.
- Typography: serif display headings with short, selective italic emphasis; clear sans-serif for forms, controls, body content, and future study screens. Use weight selectively to highlight actions and structure.
- Forms: capsule-shaped inputs, comfortable horizontal padding, clear focus/error states, and rounded password visibility controls. Current mobile primary buttons also use the capsule treatment. This does not require making every card or surface pill-shaped.
- Account-form refinement: use clear serif headings (Welcome back / Create your account), one supporting sentence, direct Sign in / Create account buttons, and clear account-switch links. Remove numbered 01/02 form labels. Mobile forms appear inside the shared green panel with 10–12px field gaps, 16px input text, 46px input height (44px on short screens), 44px password-toggle targets, and 48px submit buttons. Use available panel width with 14px side padding, tighter header/back-link spacing, and password/error feedback. Preserve readable text and every field; internal scrolling remains available for very small screens, the keyboard, and validation. Keep welcome copy intact. Authentication remains unconnected; do not simulate network loading or successful account creation.
- Mobile entry screens: compact brand/theme header, phone-specific welcome artwork, and the full accepted welcome copy. Preserve the welcome label, headline, original description, Organise / Focus / Plan overview, account actions, closing slogan, and footer text. Desktop retains the editorial split layout and its feature descriptions.
- Mobile header sizing: a 44px row with 8px top padding and 8px gap to content (4px on short screens), respecting device safe areas. Keep both the brand link and theme control at least 44px tall so reclaiming space does not reduce touch comfort.
- Brand capsule: group the book mark and StudyDesk wordmark in a compact capsule on mobile and desktop. Use a 44px minimum height, thin border, and subtle surface; on desktop use a translucent fill and light border over the green artwork panel, and on mobile use theme-aware neutral colours. Keep the theme button separate. Avoid nested icon boxes, a heavy black island, or expanding animations.
- Brand capsule highlight stays on by default: use the former hover background and border as its normal appearance on mobile and desktop. Do not change its appearance on hover. Preserve the visible keyboard focus indicator.
- Theme control surface: match the mobile brand capsule's surface and border—warm white in light mode and neutral charcoal in dark mode. Keep the circular control separate, with matching hover feedback and the existing touch target.
- Mobile footer sizing: retain both footer texts with 4px top padding and compact line spacing. On welcome, reduce bottom padding to 8px while respecting safe areas, use 4px vertical content padding, and let the green panel fill available height. Give spare panel space to the illustration rather than adding blank margins around the box. Preserve internal scrolling when the complete content needs it.
- Welcome proportions: keep actions at least 44px tall. Preserve all accepted welcome text; do not remove, shorten, or hide it to force a screen fit without user approval. Adapt whitespace and artwork size first. Keep the outer page fixed and allow internal scrolling on short screens when the complete, readable content cannot fit. Do not claim every possible screen or zoom configuration has been verified.
- Mobile welcome groups its label, headline, original description, animated desk, feature row, account actions, and closing slogan in one green panel with 24px corners. Keep the logo, theme control, and footer outside. Use warm light text and a pale green button. Artwork shares the panel background without a nested box. Keep the accepted compact Get started button and enlarged illustration.
- Continuous entry flow: welcome, login, and sign-up share one persistent mobile green panel and header. Get started fades welcome content into sign-up; Sign in shows login; Back to welcome restores all welcome copy and artwork. Fade the content out for 140ms and in for 180ms while the green panel resizes (see the panel-height decision below). Preserve `/`, `/login`, and `/signup` URLs, browser history, direct links, and modified-click behaviour. Reset internal scroll and focus the new heading after navigation without opening the keyboard. Reduced-motion preferences switch content without fades. Forms scroll inside the panel when necessary; no backend is added by this UI flow.
- Mobile panel height (updated 3 November 2026): the green panel fills the available height on welcome, but on login and sign-up it fits its content and stays vertically centred, so no empty bands appear inside it. Moving between welcome, login, and sign-up animates the panel's top and bottom edges together over 300ms (`cubic-bezier(.2, 0, 0, 1)`), while the content stays fixed at its final size and position and is clipped by the panel. Forms do not scroll on ordinary phones. On screens 700px tall or shorter, the sign-up description is hidden and spacing is tightened (inputs stay 44px) so sign-up fits without scrolling at 360×640. If content still cannot fit, such as with the on-screen keyboard open, the panel stops at the available height and scrolls internally rather than hiding controls. Reduced-motion preferences resize instantly. Browser back/forward and direct links resize without animation, and height changes caused by content inside a form, such as validation messages, are not animated. Verified in desktop Chrome with device emulation (430×932 down to 360×640, no scrolling on login or sign-up) by sampling the panel edges and heading position during transitions; not yet checked on a physical phone.
- Mobile welcome density: retain every word while tightening the description to 15px type with 1.45 line-height and an 8px bottom margin. Make the secondary Organise / Focus / Plan row compact: 17px icons, 13px medium labels, 4px icon-to-label gaps, 6px vertical padding, and a 280px maximum row width. Main controls and body readability remain the priority.
- Desk artwork motion: combine a one-time assembly with a gently living scene on entry screens. The desk rises into place; notebook, tools, lamp, cup, and plant arrive; then the lamp turns on and stays steadily lit. After assembly, only the leaves sway slightly and coffee steam rises continuously. No repeated object arrivals or persistent pause button. Pause leaves/steam while a form is focused. Reduced-motion preferences show the complete static illustration immediately. Keep decorative artwork motion out of study and Focus Mode screens.
- Artwork lighting and leaf refinement: turning on the lamp fades tabletop shade and reveals a warm radial pool of light on the wood, beneath the objects. Keep this light steady after switch-on. Leaves use a slow 5.8-second sway between approximately +4.5° and −3.5° for visibility at phone size.
- Directional lamp lighting: a softly feathered, warm cone extends from the lampshade toward the notebook and tabletop when switched on. Align the surface highlight with its landing area; keep the beam steady after its brief reveal. Use lightweight SVG gradients with a small static blur, and show the final lit state immediately under reduced-motion preferences.

## 2. Build approach

Build one complete section at a time. For each section:

**Blueprint → visual design → frontend → backend integration → verification → complete.**

The current decision is to start with the **login and sign-up frontend**. Finish its layout, interactions, responsive behaviour, and states before implementing or changing its backend. Frontend completion does not mean authentication or security is complete.

Prepare these blueprint items before implementing each section:

| Item | Decisions |
| --- | --- |
| Purpose | What the student needs to accomplish |
| User flow | Entry, main actions, completion, and exit |
| Screens | Layout, hierarchy, content, and navigation |
| Interactions | Controls, forms, feedback, and shortcuts |
| States | First use, empty, loading, populated, success, error, recovery |
| Data | Fields, relationships, validation, and deletion rules |
| Backend | Operations, authentication, and ownership checks |
| Responsive UX | Phone, tablet, desktop, keyboard, and accessibility |
| Assets and motion | Purpose, art direction, animations, and fallbacks |
| Acceptance | Observable requirements for completion |

Document dependencies. Dashboard summaries become fully functional when their underlying features are integrated.

## 3. Technical direction

- Full-stack Next.js 16 and TypeScript.
- Tailwind CSS with reusable design tokens.
- MongoDB Atlas.
- Better Auth: email and password.
- Local file storage during development; Cloudflare R2 for production.
- Hosting target: Vercel, MongoDB Atlas, and Cloudflare R2. Verify current service limits and deployment compatibility before committing to production architecture. Free hosting is a target rather than a guarantee.

Read the relevant installed guides in `node_modules/next/dist/docs/` before writing Next.js implementation code, as required by the project instructions.

```text
app/          Pages, layouts, and route handlers
components/   Shared UI and feature components
server/       db, auth, subjects, folders, resources, notes,
              sessions, plans, calendar, settings, storage
public/       Public design assets
docs/         Plan, section blueprints, and design decisions
proxy.ts      Logged-out navigation handling
```

Keep private student uploads separate from public design assets. Keep credentials in environment variables and out of source control.

## 4. Starting status

Previously reported work, to verify when the application source is available:

- Project and dependencies installed.
- Database connection, authentication setup, login API route, and page protection.
- Theme colours, login/sign-up pages, icons, bottom navigation, and app layout.

Previously reported gaps:

- MongoDB Atlas connection string in `.env.local`.
- Dashboard and remaining section pages.
- Theme switch and logout control.

The earlier application source was absent when this build started. A fresh Next.js foundation and login/sign-up frontend have now been created in this workspace. The earlier backend is not present or verified. Preserve and reuse it if recovered.

Stage 1A frontend is implemented. Stage 1B now connects registration, login, logout, MongoDB-backed sessions, protected pages/API, server validation, and rate limits. HTTP/database and mobile browser flows passed against an isolated local replica set. Atlas connectivity passed a read-only ping, and the regular application's guest session endpoint returned HTTP 200. No student test account was created in Atlas. Password recovery and email verification still require an email provider. See [the backend blueprint](authentication-backend-blueprint.md).

## 5. Stage 1 — Login, accounts, and security

**Goal:** A polished account experience backed by secure authentication.

### 1A. Frontend — implemented

- Blueprint login and sign-up, including navigation between them.
- Establish the authentication visual direction before implementation.
- Build responsive layouts in light and dark themes.
- Add labelled fields, password visibility, appropriate autocomplete, and mobile keyboard support.
- Add client-side validation, accessible field errors, and submission feedback.
- Design idle, submitting, failure, and success states.
- Define recovery and verification screens according to the chosen account flows.
- Add purposeful motion and custom imagery where they improve the design.
- Keep prototype behaviour explicit until connected to real authentication. Do not simulate a successful account creation as if it were real.

**Frontend acceptance:** Forms are usable on phone and desktop, with keyboard navigation, readable errors, polished states, and consistent visual design.

### 1B. Backend and integration — implemented, email flows pending

- Review or configure MongoDB and Better Auth.
- Connect account creation, login, logout, and persistent sessions.
- Protect pages and independently authenticate private backend operations.
- Validate inputs server-side and enforce user ownership.
- Configure authentication abuse protection.
- Define password recovery, email verification, and any email-provider dependency.
- Return useful errors without exposing sensitive account information.

**Stage acceptance:** Register, log in, refresh, visit protected pages, and log out successfully. Reject unauthenticated and cross-user access. Client-side validation and redirects do not replace backend security checks.

## 6. Stage 2 — Design system, app shell, and dashboard

**Goal:** Establish a coherent visual system and useful starting screen.

- Extend the selected authentication direction into a reusable design system.
- Define colour, typography, spacing, density, surfaces, borders, radii, icons, and motion tokens.
- Define all shared component states.
- Build mobile bottom navigation and appropriate desktop navigation.
- Add persistent light/dark/system theme selection.
- Build page headers, contextual actions, dialogs, and feedback patterns.

Dashboard content:

- Date and a short greeting.
- Primary action to start or resume study.
- Today's study goal and progress.
- Today's planned work.
- Subject overview.
- Upcoming deadlines.

Design first-use and populated states. Label fixture data during development. Connect dependent summaries as later features become ready.

**Acceptance:** Navigation, theme behaviour, responsive layout, and dashboard states work; dependencies are documented.

## 7. Stage 3 — Subjects and study materials

**Goal:** Organise and retrieve everything needed for a subject.

Build in order:

1. Create, edit, and delete subjects.
2. Subject detail workspace.
3. Nested folders and folder navigation.
4. File uploads and resource links.
5. View, rename, move, and delete resources.
6. Quick notes within subjects.

Workspace: subject identity, materials, folders, notes, study action, and later study progress.

Define folder depth, duplicate names, allowed file types, maximum upload size, per-user storage limits, deletion behaviour, private file access, and storage cleanup. Define note-saving and failure recovery behaviour.

Use a storage interface to support local development and later R2 integration.

**Acceptance:** Students can securely manage subjects, folders, files, links, and notes. Every operation, including file access, checks ownership.

## 8. Stage 4 — Timer, goals, and Focus Mode

**Goal:** Study with trustworthy time tracking.

- Subject selection.
- Default 45-minute study and 10-minute break intervals.
- Start, pause, resume, end, and study/break transitions.
- Saved study sessions and daily goals.
- Actual-versus-goal progress and dashboard integration.
- Distraction-free Focus Mode.

Define refresh, reopening, backgrounding, subject switching, early ending, duplicate timers, interrupted saves, timezone, and date-boundary behaviour before implementation.

Starting rules:

- Only study time contributes to goals; breaks and paused time do not.
- One active session per student.
- Partial sessions can be saved.
- Calculate elapsed time from timestamps rather than timer ticks.
- Keep animation independent from timekeeping correctness.

**Acceptance:** Time remains accurate through normal interruptions and saved sessions update progress consistently.

## 9. Stage 5 — Planner

**Goal:** Turn intentions into manageable study work.

- Create, edit, complete, delete, and reschedule tasks.
- Optional subject, due date, and planned duration.
- Today, Tomorrow, Week, and Month views.
- Clear overdue and completed states.
- Start studying from a subject-linked task.

Today supports execution; Tomorrow supports preparation; Week supports workload distribution; Month supports broader planning.

**Acceptance:** Students can plan, finish, reschedule, and understand remaining work.

## 10. Stage 6 — Calendar

**Goal:** Understand dated commitments and prepare for them.

- Exams, deadlines, and other events.
- Create, edit, and delete flows.
- Date, details, and optional subject association.
- Mobile agenda and larger-screen calendar.
- Upcoming events on the dashboard.

Define how tasks and events appear together without duplicating records. A task represents work; an event represents a dated commitment.

**Acceptance:** Event dates and details remain consistent across views with correct timezone handling.

## 11. Stage 7 — Settings

**Goal:** Personalise the workspace without unnecessary complexity.

- Profile and relevant account controls.
- Light, dark, and system appearance.
- Study/break durations and default daily goal.
- Clear explanations of when preference changes take effect.

Theme switching starts in Stage 2; Settings provides its permanent home.

**Acceptance:** Preferences persist and affect relevant features consistently.

## 12. Stage 8 — Integration, polish, and launch

- Connect every dashboard summary to real data.
- Verify the complete registration-to-study journey.
- Review mobile layouts, keyboard access, contrast, safe areas, and touch targets.
- Review authentication, ownership, file privacy, validation, and recovery states.
- Optimise images, fonts, motion, and loading.
- Configure production hosting, database, storage, and required email services.
- Verify provider limits, backups, and operational recovery.
- Add installation support and app icons.
- Verify production account flows, uploads, timers, and persistence.

Installation does not imply offline support. Specify offline behaviour separately before promising it.

**Acceptance:** A new student can complete the core journey on the deployed application using phone and desktop.

## 13. After the MVP

Analytics, streaks, reminders, exam countdowns, global search, student-facing backup/export, and AI features remain future work unless explicitly reprioritised.

## 14. UI/UX master prompt

Copy the following brief into design and implementation tasks, followed by the current section blueprint and project context.

---

Act as a senior product designer, art director, interaction designer, and frontend engineer designing StudyDesk. Apply the care of an experienced UI/UX team to visual identity, composition, typography, imagery, motion, accessibility, and complete interaction behaviour.

Treat comfortable studying, readability, a distinctive visual identity, and a welcoming atmosphere as continuing requirements for every UI task. Read the plan's Ongoing UI requirements and Accepted visual decisions before implementation. Preserve accepted decisions unless the user changes them, and update the plan and section blueprint when new decisions are accepted.

### Product

StudyDesk is a mobile-first personal study workspace for organising subjects and materials, planning work, studying with a Pomodoro timer, recording study time, and managing exams and deadlines.

Primary journey: log in → understand today's priorities → choose a subject → study → review progress.

Design for daily use, realistic student content, long subject names, many resources, interrupted work, overdue tasks, and first-time students with no data.

### Visual quality and identity

Create a distinctive contemporary academic workspace with editorial character. Make specific art-direction decisions so the result feels like a coherent product rather than a generic AI-generated dashboard.

Build on the accepted palette: warm stone (`#F1EFE8`) and dark text in light mode; neutral charcoal and warm white in dark mode; restrained green accents in both. Retain the green desktop authentication artwork panel. Use subtle material detail, balanced typography, and precise alignment to develop this into a coherent identity.

Calm must still have character. Use proportion, hierarchy, useful density, composition, and interaction detail to create quality.

Avoid repetitive rounded cards, oversized greeting banners, arbitrary gradients, excessive pills, floating glass panels, decorative charts, emoji navigation, and large empty spaces. Use familiar patterns thoughtfully and make unconventional choices only when they improve the experience.

### Custom imagery, photography, and AI assets

Decide where imagery adds meaning, warmth, orientation, or brand identity. Consider authentication, onboarding, selected empty states, subject artwork, or subtle workspace atmosphere. Do not add pictures to every screen or compete with study content.

When imagery improves the design, use the available AI image-generation tool to create original pictures or illustrations and integrate the finished assets into the actual UI. Do not deliver image prompts or placeholder rectangles as finished assets.

Before generation, define purpose, subject, composition, palette, style, aspect ratio, crop-safe areas, transparency, and light/dark treatment. Keep related assets under one art direction. Review the images in the actual layout and refine unsuitable results.

Use raster generation for photographs, illustrations, and textures. Use SVG, CSS, or project-native assets for crisp icons and simple scalable graphics. Keep all interface text and controls as real accessible elements.

Avoid unrelated stock photography, generic laptop-study imagery, inconsistent illustration styles, and distracting ornament. Use photos only when they support the selected concept.

Organise approved public assets with descriptive filenames. Optimise format, compression, dimensions, responsive sizing, and loading. Provide meaningful alt text where appropriate and empty alt text for decoration. Handle loading and failed images gracefully.

If image generation is unavailable, explain that limitation and use a polished code-native treatment where appropriate. Never claim an image has been generated or integrated when it has not.

### Motion and interaction

Design animation alongside the interface. Every animation needs a purpose: feedback, spatial continuity, state explanation, or a meaningful accomplishment.

Consider button press feedback, navigation indicators, dialogs, folder expansion, task completion, progress updates, timer transitions, and restrained page entrances. Choose effects according to need rather than using all of them everywhere.

Define shared duration, easing, and movement tokens. Keep frequent interactions quick. Do not delay access to content through long entrances or repeated staggered animations.

Use CSS or a suitable existing library for UI motion. Add SVG, canvas, or richer animation only when justified by the concept and device cost. Inspect existing dependencies before adding libraries.

Keep Focus Mode quiet. Avoid constant pulsing, distracting background movement, scroll hijacking, cursor-following effects, and auto-playing sound in study workflows.

Support reduced-motion preferences with an equivalent usable experience. Prefer performant animation properties, avoid layout shifts, and verify ordinary-phone performance. Timekeeping must remain correct independently of animation frames.

### Typography and components

Create an intentional hierarchy. Consider an expressive heading face paired with a highly readable interface face if both remain practical at small sizes. Limit font families and weights to what is necessary.

Preserve the accepted serif display headings with selective italic emphasis. Use regular-weight sans-serif body text generally at 15–16px, 16px input text, and 14–16px medium or semibold labels and buttons. Keep helper text readable and contrast sufficient in both themes. Avoid overly thin text and tiny important content. Preserve capsule-shaped inputs and the accepted rounded mobile buttons without applying that shape indiscriminately to every surface.

Use open sections, lists, dividers, panels, and contained surfaces according to purpose. Define consistent spacing, density, alignment, icon treatment, borders, and surface hierarchy.

Design default, hover, pressed, focus, disabled, loading, validation-error, and success states for shared controls. Keep forms, dialogs, menus, navigation, tasks, resources, and timer controls consistent.

### Section experience

Authentication establishes identity while making form completion effortless.

The dashboard prioritises starting or resuming study, today's work, and progress. Secondary information remains subordinate.

Subjects provide clear location, readable resources, useful actions, and easy access to notes.

Focus Mode is legible, quiet, and clear about timer state and exit behaviour.

Planner views support execution, preparation, and workload planning. Calendar views make dates readable on small screens. Settings are grouped by student need and explain the effect of changes.

### Responsive design and accessibility

Design mobile-first with comfortable touch targets, reachable actions, safe-area spacing, responsive forms, and keyboard-aware layouts. Adapt composition and navigation for tablet and desktop rather than stretching the phone interface.

Create complete light and dark themes with intentional tonal hierarchy. Use semantic HTML, accessible contrast, labelled controls, visible keyboard focus, reduced-motion support, and status information that does not depend only on colour.

### Complete states and honest functionality

Include first-use, populated, loading, empty, validation, submission failure, success, and recovery states. Handle long content, missing assets, interrupted work, and destructive actions.

Use realistic fixture content during design and label it clearly. During frontend-only work, keep unconnected behaviour explicit. Do not imply that fake authentication, progress, statistics, or inactive controls are working features.

### Working process

1. Inspect the available app source, section blueprint, assets, components, and dependencies.
2. Before the first main-screen implementation, present two coherent visual directions using the same realistic content. Describe typography, palette, composition, imagery, and motion with concrete examples. Select a direction before expanding it throughout the product.
3. Define reusable design tokens, components, motion rules, and asset guidelines.
4. Design the current section's flows, responsive layouts, interactions, states, and asset requirements.
5. Generate and integrate custom images where useful; implement purposeful motion with the interface.
6. Implement the currently authorised work using the existing stack. Read the installed Next.js guides before implementation. Keep backend details out of student-facing UI.
7. Review the rendered screens on phone and desktop, in both themes, with realistic content. Refine spacing, typography, crops, transitions, and consistency.
8. Verify acceptance criteria, accessibility, performance, and any authorised integration. Clearly report remaining dependencies and verification limits.

Build section by section. Do not generate the entire app in one pass or replace thoughtful design with a familiar dashboard template.

Judge the result by clarity, character, consistency, accessibility, reliability, and how easily a student can begin meaningful work.

---

## 15. Next action

The student can now create and sign into an account using the verified Atlas configuration. Choose an email provider to finish password recovery and email verification. Basic authentication has passed isolated database/API and mobile browser checks; Stage 1 remains incomplete until the remaining account flows and deployment settings are verified.

Guest entry behaviour: new visitors, logged-out users, and users with expired or invalid sessions land on the welcome page (`/`), including when opening a protected dashboard URL. Successful logout returns to welcome. The installed app starts at `/`. Valid signed-in visitors are redirected from entry pages to `/dashboard`; explicit Sign in and Get started actions still open their respective forms.

Opening/loading UI: the root `app/loading.tsx` streams a lightweight branded fallback while route content or the account layout is preparing. A custom outlined book sits inside a fine rotating sage arc, with the StudyDesk wordmark and “Making room for focus”. Use theme-aware warm stone/charcoal surfaces, safe-area padding, an accessible loading status, and a static emblem for reduced motion. No artificial minimum delay or JavaScript dependency; ready content replaces the fallback immediately. The browser must receive HTML before any in-page loading screen can appear.

Loading motion refinement: the outlined book unfolds once over 900ms, page rules draw in, and a single paper leaf turns gently in a 4.8-second loop. The fine sage orbit rotates every 3.2 seconds; the wordmark and caption enter once with a short fade and 5px rise. Use a 128px emblem with a 46px book. No shimmer, flashing, extra delay, or changing status messages. Reduced motion shows a static open book and readable text. The streamed fallback is replaced immediately when ready; an exit animation is not guaranteed by Suspense unmounting.

App icon: use the cream outlined open book with three curved page rules on each side, on the accepted green background. Browser, Apple touch, regular install icons, and maskable icons are generated from a shared SVG source by `node scripts/generate-icons.mjs`. Keep the maskable book within the central safe area.

Brand consistency: use `StudyBook` for every StudyDesk book mark, including desktop/mobile entry headers, dashboard branding, the Organise feature, and the animated loader. Shared vector paths in `components/study-book-paths.json` also generate app icons, keeping page lines and book proportions consistent. Only the loading variant animates.
