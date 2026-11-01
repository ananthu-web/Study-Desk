# Login frontend blueprint

## Art direction

Follow the ongoing UI requirements and accepted visual decisions in [the project plan](studydesk-project-plan.md). The goal is comfortable studying, clear readability, and a distinctive, welcoming visual experience. Apply these requirements to later UI changes as well.

Two directions considered: an editorial paper-and-ink workspace, and a cooler architectural interface with blue-grey surfaces and rigid grids. Use the editorial direction for this first implementation because its warmth and tactile illustration suit a personal study desk.

Palette: warm stone (`#F1EFE8`) for the light page background, deep forest, muted sage, and terracotta. Serif display headings contrast with a clear system sans-serif. Use an original code-native desk illustration rather than stock photography. Light and dark themes share the same composition and asset.

Background texture trial: faint static paper grain from `public/textures/paper-grain.svg` tiles on the light-mode page background. The tile is monochrome and low opacity, with no overlay on text, green panels, or inputs. Dark mode remains plain charcoal.

Background graphic trial: `public/graphics/study-margin.svg` adds faint notebook ruling and small hand-drawn loop marks at the page edges in light mode. The four-point sparkle was removed because it resembled another product's branding. Two non-interactive background layers sit behind the interface and are covered by opaque panels and controls. They scale down on phones, do not move, and do not change page dimensions. Dark mode remains plain.

The background URL uses `?v=3` to refresh cached artwork. The sparkle remains removed. Notebook lines have stronger opacity and non-scaling strokes; the SVG stretches to the full margin height so the ruling is visible along phone edges rather than compressed into a small area.

Current refinements: neutral charcoal main surfaces and warm white text in dark mode; green accents and desktop artwork panel retained. Inputs use capsule borders. Body text is generally 15px, input text 16px, labels 14px semibold, primary action text 15px semibold, and helper text 13px with stronger contrast. Display headings retain selective italics; forms and supporting text remain upright sans-serif. Keep readable type sizes when adapting layout height.

## Scope

Current account-form refinement: headings are Welcome back and Create your account, with concise support copy and direct Sign in / Create account actions. Numbered labels are removed from forms only. Mobile forms use 10–12px gaps, 46px capsule inputs (44px on short screens), 16px input text, 44px password-toggle targets, and 48px submit actions in the shared green panel. Reduce form-panel side padding to 14px and tighten header/back/switch-link spacing. Retain every field and preserve internal scrolling when necessary. Account-switch navigation has a divider and comfortable touch area. Password length and match hints update while typing, with field-specific submission errors and first-invalid-field focus. Submissions now connect to Better Auth, with real loading/error states and dashboard navigation. Password recovery remains unavailable pending an email provider. Welcome copy is unchanged.

- `/login` and `/signup`, linked from each other.
- `/`, `/login`, and `/signup` share `app/(auth)/layout.tsx`. The persistent mobile panel fades only its content during local navigation (140ms out, 180ms in), keeping its frame, logo, theme control, and footer in place. Forms have Back to welcome. URLs, direct loads, history, and native modified clicks remain available. Internal panel scrolling preserves access on small or keyboard-sized screens. Reduced motion disables fades.
- Root shows a welcome screen with Get started (`/signup`) and an existing-account sign-in action (`/login`). The brand links back to the welcome screen.
- Split editorial illustration and form on desktop. Mobile uses a compact, neutral brand header with the theme control on the same row, leaving the main area for content.
- Preserve all accepted mobile welcome copy: welcome label, headline, original description, Organise / Focus / Plan row, account actions, closing slogan, and footer text. Do not shorten or hide these to force a fit without user approval. Forms retain 16px input text and at least 44px controls.
- Mobile welcome groups its label, headline, original description, artwork, feature row, buttons, and closing slogan inside a green panel with 24px corners in both themes. The logo/theme header and footer stay outside. Artwork has no nested box. Text is warm light; the primary button is pale green with dark text.
- Compact mobile header: reduce the row from 52px to 44px, top padding from 16px to 8px, and content gap from 12px to 8px. Respect safe areas and retain 44px touch targets. Short screens keep a 4px gap.
- Brand capsule: the book icon and StudyDesk name share a subtle rounded surface and thin border on both mobile and desktop, at a 44px minimum height. Desktop uses a translucent fill and light border over the green panel; mobile uses theme-aware neutrals. Keep the theme button separate and the icon free of its own border. No expansion animation.
- Logo capsule uses its highlighted background and border at rest, with no hover colour change. Keyboard focus remains visible.
- Theme toggle uses the same neutral surface and border as the mobile logo capsule: warm white in light mode, charcoal in dark mode, and matching hover feedback.
- Compact mobile footer: 4px top padding and 1.2 line-height without deleting footer text. Welcome uses 8px bottom padding (or the larger device safe area), 4px vertical content padding, and a green panel that fills available height. Spare panel height expands the artwork area; smaller screens can still scroll internally as needed.
- Welcome-specific proportions: keep the compact, centred 44px Get started button and enlarged responsive illustration. Adapt spacing and artwork before compromising readability. Preserve all copy on short screens; allow internal scrolling when needed while the outer page remains fixed. Form pages retain their existing scrolling behaviour.
- Mobile secondary-content compression: original description remains 15px, with 1.45 line-height and an 8px bottom margin. The Organise / Focus / Plan row uses 17px icons, 13px medium labels, smaller gaps/padding, and a 280px width cap. No wording is removed or shortened.
- Keep the authentication shell within the dynamic viewport height. Adapt spacing and artwork to screen height; allow scrolling inside the form area only when its content cannot fit, including keyboard-sized screens and validation feedback.
- Email, password, and sign-up name/password confirmation.
- Password visibility, autocomplete, native constraints, accessible errors, and explicit frontend-preview submission feedback.
- Persistent light/dark theme with system preference as initial default.
- Brief entrance transitions and button feedback, respecting reduced motion.
- Desk artwork assembles once: desk, notebook, tools, lamp, cup, and plant arrive in sequence. The lamp turns on and stays steadily lit. After assembly, leaves sway slightly and two staggered steam trails rise continuously. Object arrivals never loop. No persistent pause control; leaves and steam pause while a form is focused. Reduced-motion preferences show the full static scene immediately.
- No fake accounts, authentication, recovery email, or dashboard redirects.

## Acceptance

- Complete forms with keyboard and touch.
- Invalid fields produce labelled feedback; errors focus the first invalid field.
- Password visibility does not submit the form.
- Submission explicitly says authentication is not connected.
- Mobile composition avoids horizontal scrolling.
- Themes remain readable and theme preference persists where browser storage is available.
- TypeScript and production compilation pass; document any browser verification limits.

## Implementation and verification

Continuous panel flow: verified in Chrome that the same panel DOM node and bounding box persist through welcome → sign-up → login → Back, including browser Back. Tested direct URLs, five mobile viewports, reduced-motion navigation, error focus, and field/link access at a reduced 390×380 viewport. Reviewed mobile forms in both themes and checked desktop retains its split layout. No runtime errors observed. All work remains frontend-only.

Account-form refinement verified in Chrome at 320×568, 375×667, 390×844, 430×932, 844×390, and 1366×768. Checked headings/actions, absence of numbered labels, both themes, first-invalid-field focus, password length/mismatch/match hints, visibility toggle, account switching, preview-only submissions, clearing password values after valid preview submission, recovery feedback, and access at a reduced 390×380 viewport. Reviewed mobile login and sign-up screenshots. No runtime errors observed; production compilation passed. Authentication remains unconnected.

The current art direction combines one-time object arrivals with ongoing leaf and steam motion. The lamp remains steady and the earlier pause button has been removed.

Lighting refinement: a warm radial highlight appears on the tabletop as the lamp turns on, while a dark overlay fades from 36% to 4% opacity. The light sits beneath the notebook and objects and remains steady. Leaves sway between +4.5° and −3.5° over 5.8 seconds so the movement remains visible on phones.

Directional light refinement: a warm gradient beam with feathered edges extends from the lampshade down toward the notebook. Its reveal is anchored at the light source; the surface highlight follows at the beam's landing area. The beam remains steady after reveal. Reduced motion shows the fully lit scene without the reveal animation.

Implemented `/login` and `/signup` with a shared shell, original vector desk artwork, light/dark themes, restrained entrance motion, accessible form feedback, and explicit preview-only submissions. No account backend is connected.

Verified in headless Chrome: invalid fields and focus, password visibility, password mismatch, submission notices, password clearing after valid preview submission, recovery availability feedback, navigation, and theme persistence across reloads. Checked both routes for horizontal overflow at 320, 390, 768, 1024, and 1440 pixels. Reviewed desktop and mobile screenshots. No browser runtime errors were observed.

TypeScript and a production Webpack build passed. The default Turbopack production build encountered a worker-port restriction in this execution environment, so the build script uses Next.js's supported Webpack option.

Viewport-fit update: verified both routes at 1440×900, 1440×798, 1366×768, 1366×650, 1280×720, 1024×600, 768×1024, 390×844, 375×667, 320×568, and 844×390. Neither page scrolls at the document level. Both forms fit without internal scrolling at the tested laptop sizes from 1280×720 and 1366×650 upward, and at 390×844. Smaller viewports retain internal form scrolling. Validation messages and the sign-in link remained reachable at 390×400. Reviewed updated laptop and phone screenshots; production build passed.

Mobile-first refinement: checked welcome, login, and sign-up in touch-emulated Chrome at 320×568, 360×740, 375×667, 390×844, and 430×932. Confirmed fixed document dimensions, 16px input text, at least 48px input height, 44px theme target, navigation, validation, and field/link reachability at a reduced 390×380 viewport. Reviewed both themes at 390×844. Small-screen sign-up may scroll internally; content remains accessible. Added safe-area handling and a keyboard-resize viewport hint for supporting browsers without disabling zoom. This is browser emulation, not a physical-device keyboard test.
