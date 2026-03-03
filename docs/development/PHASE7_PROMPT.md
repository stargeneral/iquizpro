# iQuizPros — Phase 7: Analytics, Testing & Quality (+ Phase 6 Carry-overs)

## Project Context

I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

---

## ⚠️ IMPORTANT: Development Plan is the Single Source of Truth

`docs/development/DEVELOPMENT_PLAN.md` is the **original, authoritative roadmap** for iQuizPros. Every phase prompt exists solely to implement the vision laid out in that document. **Phase prompts are an implementation guide — the plan is the goal.**

Before you write a single line of code, **audit this prompt against `DEVELOPMENT_PLAN.md` Phase 7**. If any objectives from the plan are missing from this prompt, include them in your implementation. The plan always wins.

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `docs/development/DEVELOPMENT_PLAN.md` — **The authoritative roadmap. Read Phase 7 carefully and note any objectives not covered by this prompt.**
2. `CLAUDE.md` — Architecture, module system, conventions, pitfalls
3. `docs/development/PHASE6_HANDOFF.md` — What changed in Phase 6 (leaderboard, server sync, retake UX, accessibility + UI/UX modernization)
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, and the handoff/prompt templates required when generating end-of-phase documents

You also have a **persistent memory file** at:
`C:\Users\user\.claude\projects\E--Programs-iquizpros-live-backup\memory\MEMORY.md`

This file is automatically loaded into your conversation context and contains deployment commands, known issues, architecture notes, and verified working features accumulated across all previous sessions.

---

## What Changed in Phase 6 (Summary)

### Phase 6.0 — Leaderboard, Server Sync, Retake UX & Accessibility

- **`live-audience.html`** — Nickname write to RTDB on join; per-question score computation (floor(timeRemaining/totalTime × 100)); `score` transaction increment; `scoreDelta_{idx}` write; "+N points!" notice; server timestamp sync via `.info/serverTimeOffset`
- **`live-presenter.html`** — Floating 🏆 leaderboard button; real-time leaderboard overlay (top 10, medals); `ServerValue.TIMESTAMP` for timer write (was `Date.now()`)
- **`app.js`** — Retake confirmation modal: shows quiz title/topic/question count + Start/Cancel before calling `startGeneratedQuiz()`
- **`js/modules/ui-manager.js`** — `role="list"` on topic grids; `role="listitem"` + `aria-label` on topic cards
- **`js/modules/quiz-renderer.js`** — `aria-live="polite"` on question banner; `role="radiogroup"` on options; `role="radio"` + `aria-checked="false"` on each option button
- **`src/index.template.html`** + **`js/modules/quiz-engine.js`** — `role="progressbar"` + `aria-valuenow` on `#progress` element, updated at all 4 progress-set sites
- **`database.rules.json`** — `.validate` for `nickname` (string 1–20) and `score` (number ≥ 0) on participant node

### Phase 6.1 — UI/UX Modernization (DEVELOPMENT_PLAN.md Phase 6 items completed)

- **`css/theme.css`** — Extended design tokens; `@media (prefers-color-scheme: dark)` auto-detect with `body:not(.light-mode-forced)` guard; skeleton shimmer loader; quiz animations (fade-in, pulse, shake, score count-up, hero slide-in); bottom nav CSS; link contrast fix (`a { color: #128c7e }`); `@media (prefers-reduced-motion: reduce)`
- **`css/layout.css`** — 44px `min-height` on `.option` (WCAG 2.5.5 touch targets)
- **`js/modules/quiz-engine.js`** — `selectAnswer()`: `aria-checked` live update + haptic feedback; `showQuestion()`: fade-in animation + arrow-key keyboard nav + focus management to first option; `showResults()`: count-up animation + score pop
- **`js/modules/ui-manager.js`** — `initTopicSelectionUI()`: hero section, "Continue Where You Left Off" resume card, premium CTA strip
- **`js/components/header.js`** — `_applyThemePreference()` (system pref + stored pref); `_initBottomNav()` (active state); `toggleTheme()` manages `light-mode-forced` class
- **`src/index.template.html`** — Skip-nav link; `<main id="main-content">` landmark; skeleton initial state; bottom nav HTML

### Current bundle
- `app.e1ff33dc.js` / `app.4cc919f5.css` — built and deployed 2026-03-01

### ⚠️ Known gaps carried forward
- Nickname truncation: `writeNickname()` does not slice names > 20 chars before RTDB write — silently rejected by validate rule
- Stripe end-to-end test still pending (card 4242 4242 4242 4242)
- Missing personality quiz images for Travel, Love Language, Color, Music Taste, Stress Response, Work-Life Balance
- Live audience: no proper nickname input screen (uses localStorage/DOM discovery chain)
- Live audience: no between-question leaderboard on audience device

---

## Naming & Code Conventions (Mandatory)

- Window globals: `window.QuizPros[ModuleName]` (PascalCase)
- Files: `kebab-case.js`
- CSS classes/IDs: `kebab-case`
- Module pattern: IIFE with `return { publicAPI }` (see CLAUDE.md)
- Cloud Functions: Node.js `exports.functionName = ...` (NOT IIFE) — lives in `functions/index.js`
- No circular dependencies. Modules never depend on components.
- Search entire codebase before renaming or removing anything.
- Build: edit source files in `js/`, `css/`, `src/`; run `npm run build` before deploying hosting. Never edit `dist/` files directly.

## Brand Colours (Mandatory)

| Role | Hex |
|------|-----|
| Primary green (brand) | `#25d366` |
| Dark green (hover / gradient end) | `#128c7e` |
| Light green (tint) | `#3ed664` |

**Gradient:** `linear-gradient(135deg, #25d366 0%, #128c7e 100%)`
**Never use** `#667eea`, `#764ba2`, `#7d5ba6`, `#5d4580`, `#9b59b6`, `#6a4a91` (all removed).

---

## Step 0 — Deploy Phase 6 Build (if not yet done)

Firebase credentials may have expired. Run:
```bash
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" login --reauth
```
Then deploy:
```bash
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting,database
```

---

## Phase 7 Objectives

> Phase 7 in DEVELOPMENT_PLAN.md is **"Analytics, Testing & Quality"** (7.1–7.3). The objectives below first clear Phase 6 carry-overs (which became carry-overs because the phase prompt was narrower than the plan), then implement the plan's Phase 7 vision. **Always complete the full development plan scope — do not leave plan objectives for a later phase unless explicitly agreed with the user.**

---

### Part A — Phase 6 Carry-overs (Complete First)

#### A.0 — End-to-End Stripe Test (Critical — Carried from Phase 5/6)

Before building new payment features, verify the full flow:

1. Visit `https://iquizpro.com/premium.html`, sign in, click "Get Premium"
2. Stripe checkout: card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
3. After redirect: Firebase Console → Firestore → `users/{uid}` — confirm `subscription.tier = "premium"` written by webhook
4. `dashboard.html` → verify tier badge shows "Premium" and AI generation limit is 100
5. Click "Manage Subscription" → verify Stripe Customer Portal opens correctly
6. In portal, cancel → verify `users/{uid}.subscription.tier` reverts to "free" after webhook fires

If webhook fails: check Firebase Console → Functions → `stripeWebhook`. Common issues: webhook secret mismatch, missing `client_reference_id` in Payment Link metadata.

#### A.1 — Live Audience: Nickname Input Screen

**Goal:** Replace the brittle localStorage/DOM discovery chain with a proper first-run nickname input overlay.

**Implementation (extension layer — do NOT touch pre-built bundles):**
- On join (when extension detects session code), check `localStorage('iqp_nickname')`.
- If absent: show a full-screen overlay (`#ext-nickname-overlay`) with:
  - Heading: "What's your name?"
  - Text input (max 20 chars, placeholder "Enter your nickname")
  - "Join Game" button
  - Brand green styling
- On submit: trim, validate (1–20 chars, non-empty), store in `localStorage('iqp_nickname')`, write to RTDB, hide overlay, then call `watchSession()`.
- If `iqp_nickname` already exists in localStorage, skip the prompt and proceed directly.
- Truncate to 20 chars before writing to RTDB (fixes pitfall #23 in CLAUDE.md).

#### A.2 — Live Audience: Between-Question Leaderboard

**Goal:** Show the top 5 participants on the audience device after each timed question is submitted.

**Implementation:**
- After `showSubmitted()` (timed question), wait 800ms, then check `sessions/{code}/participants`.
- Show a 3-second "🏆 Top Players" mini-panel below the submitted message, listing top 5 nicknames + scores sorted by score descending.
- Auto-dismiss after 3 seconds or when `currentSlide` changes.
- Read-only; no new RTDB writes.

#### A.3 — Personality Quiz Images (High-Value Missing Assets)

**Goal:** Add real result images for the personality quiz types that currently show the fallback image.

**Missing images (create or source as WebP, 800×800px max):**
- `assets/images/adventurer-personality.webp` (Travel: Adventurer)
- `assets/images/culture-seeker-personality.webp` (Travel: Culture Seeker)
- `assets/images/relaxer-personality.webp` (Travel: Relaxer)
- `assets/images/social-explorer-personality.webp` (Travel: Social Explorer)
- `assets/images/words-affirmation-personality.webp` (Love Language)
- `assets/images/acts-service-personality.webp` (Love Language)

If sourcing real images is not possible in this session, create simple SVG-based placeholder WebP images with personality-themed colours and icons that are clearly distinct from the default fallback.

---

### Part B — DEVELOPMENT_PLAN.md Phase 7: Analytics, Testing & Quality

#### 7.1 — Analytics Enhancement

**Goal:** Make quiz engagement measurable so product decisions are data-driven.

- Enhanced GA4 event tracking (via `QuizProsAnalytics` in `js/modules/analytics.js`):
  - `quiz_start` (topicId, quizType)
  - `quiz_complete` (topicId, score, timeTaken)
  - `quiz_abandon` (topicId, questionReached) — fired when user leaves mid-quiz
  - `question_answered` (topicId, questionIndex, timeSpent, correct)
  - `conversion_signup` — visitor who creates an account
  - `conversion_premium` — free user who upgrades
- Funnel tracking: visitor → quiz taker → authenticated → premium (use GA4 events above; no backend required)
- Most/least popular topics tracked via `quiz_start` events with topic dimension
- Note: A/B testing framework and Hotjar integration are low-priority; document as deferred if time-constrained

#### 7.2 — Error Monitoring

**Goal:** Surface errors before users report them.

- Centralized error handler (`js/utils/error-reporter.js`) — new IIFE module `window.QuizProsErrorReporter`:
  - Wraps `window.onerror` and `window.onunhandledrejection`
  - Batches errors and logs to Firebase Analytics as `app_error` events (no third-party SDK required)
  - Provides `QuizProsErrorReporter.capture(error, context)` for manual reporting
  - Deduplicates identical errors within 60 seconds (avoid event spam)
- User-facing error pages:
  - `404.html` — "Page Not Found" with navigation back to home (Firebase Hosting can serve custom 404s via `firebase.json`)
  - Offline state: detect `navigator.onLine === false` and show a branded offline banner in `index.html` (not a separate page)
- Automatic retry: `QuizProsAPI` (in `js/utils/api.js`) should retry failed fetch calls up to 2 times with exponential backoff before reporting error
- Note: Sentry/Crashlytics integration is optional; document as a future upgrade path

#### 7.3 — Testing

**Goal:** Protect against regressions as the codebase grows.

- Unit tests for quiz-engine scoring logic (`js/modules/quiz-engine.js`):
  - Use Jest (add as devDependency); test files in `tests/unit/`
  - Cover: `getScore()`, `getDominantType()`, correct answer counting, streak tracking
- Unit tests for auth state management (`js/modules/auth-manager.js`):
  - Cover: `isSignedIn()`, `getCurrentUser()`, tier gating logic
- Integration test for core quiz flow (can be manual test checklist in `docs/development/TESTING.md` if automated setup is out of scope):
  - Homepage → Select topic → Answer all questions → See results → Reset
  - Guest user → Trigger auth gate → Sign up → Return to quiz
- Performance budget check (automated, via webpack config):
  - Add a build-time warning if `app.[hash].js` exceeds 500KB (gzipped)
  - Document current bundle size in `docs/development/TESTING.md`
- Note: Playwright/Cypress E2E and visual regression tests are desirable but may be deferred if the session runs long; prioritise unit tests and the manual test checklist first

---

### Part C — Phase 6 Items Missed in Previous Session

> These 8 items are explicitly listed in `DEVELOPMENT_PLAN.md` Phase 6 but were **not implemented** during Phase 6. They were either deferred without being scheduled, or overlooked entirely. They are included here so they are not lost. If the session runs long, prioritise by impact: C.3 (contrast) and C.4 (play counts) first, then C.5 (shareable cards) and C.6 (how others answered).

#### C.1 — Reusable Component Library *(not captured anywhere — first appearance)*

**Goal:** Codify the design system into reusable, documented CSS components so all future UI is consistent.

**Implementation:**
- Create `css/components/` directory with separate files: `buttons.css`, `cards.css`, `modals.css`, `inputs.css`
- Extract the most-used patterns from `base.css`, `layout.css`, `theme.css` into these files (do not duplicate — move or reference)
- Document the component API (class names and variants) in a comment header at the top of each file
- Add the new files to the webpack entry in `src/app-entry.js` (or `@import` them from an existing CSS entry)
- Note: this is a refactor/codification task — no new visual behaviour, just making existing patterns explicit and reusable

#### C.2 — Full Colour Contrast Compliance (4.5:1) *(not captured anywhere — first appearance)*

**Goal:** Meet WCAG AA contrast ratio of 4.5:1 for all normal-sized body text.

**Current gap:** `a { color: #128c7e }` achieves 4.1:1 on white — passes AA for large text (≥18pt / ≥14pt bold) but **fails AA for normal body-text links**.

**Implementation:**
- Darken the link/text colour slightly: `#0d6b62` achieves ≈4.6:1 on white (confirm with https://webaim.org/resources/contrastchecker/)
- Update `a { color }` in `theme.css` and `--primary-text` CSS variable to the darkened value
- Check dark mode: confirm the same or equivalent colour passes 4.5:1 against the dark background
- Audit any other text elements that use `#25d366` (2.9:1) for body text — replace with `--primary-text` value
- Note: `#25d366` on dark backgrounds (e.g. buttons) is fine for large text; only normal-sized body text links need the darker value

#### C.3 — Popular Quizzes Section with Play Counts *(in PHASE6_HANDOFF.md deferred list — not scheduled)*

**Goal:** Show which quizzes are most popular to encourage discovery and social proof.

**Implementation:**
- Client-side: in `quiz-engine.js`, when a quiz starts (`startQuiz()`), increment a counter in Firestore at `quizStats/{topicId}` using `firebase.firestore().doc('quizStats/' + topicId).set({ playCount: firebase.firestore.FieldValue.increment(1) }, { merge: true })`
- In `ui-manager.js` `initTopicSelectionUI()`: after injecting the hero section, fetch top 5 `quizStats` docs ordered by `playCount` descending; render a "🔥 Popular Right Now" section with the matching topic cards
- Show a subtle badge ("🔥 123 plays") on topic cards for topics with > 50 plays
- Firestore rules: `quizStats/{topicId}` — public read, authenticated write only
- Graceful fallback: if fetch fails or returns empty, skip the section silently

#### C.4 — Testimonials / User Stats Section *(in PHASE6_HANDOFF.md deferred list — not scheduled)*

**Goal:** Build social proof on the homepage to improve conversion.

**Implementation (choose the simplest feasible option):**
- **Option A (static):** Hardcode 3–4 realistic testimonials directly in `ui-manager.js` HTML (name, quiz taken, quote). No backend required. Display as a `.testimonials-section` below the topic grid.
- **Option B (dynamic stats):** Show aggregate stats pulled from Firestore: total quizzes taken (sum of `playCount` across `quizStats`), number of registered users (if accessible). Display as a "Join X players who have taken Y quizzes" banner.
- Implement whichever option is feasible. Option A is faster; Option B is more impressive if the Firestore read is already in place for C.3.

#### C.5 — Shareable Result Cards *(in PHASE6_HANDOFF.md deferred list — not scheduled)*

**Goal:** Let users share their quiz result as a visual card on social media.

**Implementation:**
- On the results screen (`showResults()` in `quiz-engine.js`), inject a "Share Result" button after the score display
- On click, use the Canvas API to draw a 1200×630px card:
  - Background: brand gradient (`#25d366` → `#128c7e`)
  - Quiz name and topic (top)
  - Score / personality type result (large, centred)
  - Site URL watermark (bottom right)
- Call `canvas.toBlob()` → `navigator.share({ files: [blob] })` if Web Share API is available
- Fallback: `canvas.toDataURL()` → create a temporary `<a download="my-result.png">` link and trigger a click
- Keep the canvas draw simple — text only is fine; no need for images inside the card

#### C.6 — "How Others Answered" Comparison *(in PHASE6_HANDOFF.md deferred list — not scheduled)*

**Goal:** After each knowledge quiz question, show what percentage of other users chose each option.

**Implementation:**
- When a user answers a question, write their choice to Firestore: `quizStats/{topicId}/questions/{qIndex}/responses` using `FieldValue.increment(1)` on the chosen option index key (e.g. `opt_2`)
- After the correct answer is revealed (delay currently ~1.4s), read `quizStats/{topicId}/questions/{qIndex}/responses` and inject a mini bar chart below the options showing the percentage breakdown
- Only show this for **knowledge quizzes** (not personality — no correct answer concept applies)
- Graceful degradation: if the Firestore read fails or returns no data, simply don't render the comparison section
- Firestore rules: `quizStats/{topicId}/questions/{qIndex}/responses` — public read, authenticated write

#### C.7 — Swipe Gestures for Navigation *(in PHASE6_HANDOFF.md deferred list — not scheduled)*

**Goal:** Allow users to swipe between quiz options or navigate back on mobile.

**Implementation:**
- Add touch event listeners to `#question-container` in `quiz-engine.js` `showQuestion()`
- Track `touchstart` (record `startX`, `startY`) and `touchend` (compute `deltaX`, `deltaY`)
- If `|deltaX| > 60px` and `|deltaX| > |deltaY|` (horizontal swipe, not scroll):
  - Swipe **left** → advance to next question (only if an answer has been selected — do not allow skipping)
  - Swipe **right** → no-op (prevent accidental back navigation mid-quiz)
- If `|deltaY| > 60px` downward on the topic selection screen → pull-to-refresh (see C.8)
- Add `touch-action: pan-y` CSS on `.options` container so swipe left/right doesn't conflict with vertical scroll

#### C.8 — Pull-to-Refresh on Quiz Listings *(in PHASE6_HANDOFF.md deferred list — not scheduled)*

**Goal:** Let mobile users refresh the topic listing by pulling down.

**Implementation:**
- In `ui-manager.js`, listen for a downward `touchstart`/`touchmove`/`touchend` sequence on `#topic-selection-screen` when already scrolled to the top (`scrollTop === 0`)
- If drag distance > 80px downward: show a "↻ Refreshing…" spinner overlay, call `initTopicSelectionUI()` again to re-render topics (re-fetches play counts too if C.3 is implemented), then hide the spinner
- CSS: the pull indicator appears at the top of the screen, slides down with the drag, snaps back on release
- Only active when `#topic-selection-screen` is the visible screen; disable during a quiz

---

## Files Likely to Be Touched

| File | Why |
|------|-----|
| `live-audience.html` | A.1 nickname overlay + A.2 between-question leaderboard |
| `assets/images/*.webp` | A.3 new personality result images |
| `js/modules/analytics.js` | 7.1 enhanced event tracking |
| `js/utils/error-reporter.js` | 7.2 new error monitoring module (create) |
| `js/utils/api.js` | 7.2 retry logic with backoff |
| `js/app-entry.js` | 7.2 load error-reporter + new CSS entry |
| `src/index.template.html` | 7.2 offline banner |
| `404.html` | 7.2 custom 404 page (create) |
| `firebase.json` | 7.2 point custom 404 at `404.html` |
| `tests/unit/quiz-engine.test.js` | 7.3 unit tests (create) |
| `tests/unit/auth-manager.test.js` | 7.3 unit tests (create) |
| `webpack.config.js` | 7.3 bundle size warning |
| `docs/development/TESTING.md` | 7.3 manual test checklist + performance budget (create) |
| `css/components/buttons.css` | C.1 reusable component library (create) |
| `css/components/cards.css` | C.1 reusable component library (create) |
| `css/components/modals.css` | C.1 reusable component library (create) |
| `css/components/inputs.css` | C.1 reusable component library (create) |
| `css/theme.css` | C.2 contrast fix — darken `--primary-text` / link colour |
| `js/modules/ui-manager.js` | C.3 popular quizzes section + C.4 testimonials/stats |
| `js/modules/quiz-engine.js` | C.5 shareable result card + C.6 "how others answered" + C.7 swipe + C.8 pull-to-refresh |
| `firestore.rules` | C.3 + C.6 allow `quizStats` reads/writes |
| `CHANGELOG.md` | Phase 7 changes |
| `CLAUDE.md` | If architecture/pitfalls change |

---

## Known Issues & Constraints Carried Forward

1. **Stripe end-to-end test pending** — Must complete A.0 before building further payment features.
2. **Nickname truncation gap** — `writeNickname()` in `live-audience.html` does not slice to 20 chars before RTDB write; long names silently fail validation.
3. **Multi-device audience session code** — Extension uses `localStorage` (`iqp_session_code`); only works same-browser. Multi-device relies on RTDB `currentSlide` listener + join URL.
4. **Personality quiz images** — 6 result types show fallback `default-personality.webp`.
5. **Live presenter bundle immutable** — Pre-built bundles cannot be changed. All new features via extension layer.
6. **No automated tests** — No test runner configured; unit tests are first-time setup for this codebase.
7. **Link contrast at 4.1:1** — `#128c7e` on white passes AA for large text only; fails AA (4.5:1) for normal body-text links. Needs slight darkening (C.2).
8. **No reusable component library** — CSS patterns exist but are not codified into a component system (C.1).
9. **No play count tracking** — `quizStats` Firestore collection does not yet exist; popular quizzes section cannot be rendered (C.3).
10. **No testimonials/stats** — Homepage social proof section not yet implemented (C.4).
11. **No shareable result cards** — Canvas-based result image generation not yet implemented (C.5).
12. **No "how others answered"** — Per-question response aggregation not yet implemented (C.6).
13. **No swipe/pull-to-refresh gestures** — Touch gesture handlers not yet added (C.7, C.8).

---

## How to Work

1. Read the required files first (especially `CLAUDE.md` and `PHASE6_HANDOFF.md`)
2. Complete the Phase 6 deploy (step 0) before building new features
3. Use Desktop Commander to read/edit files on the machine
4. Make targeted, incremental changes
5. Edit source files (`js/`, `css/`) and run `npm run build` to regenerate `dist/`. Never edit `dist/` directly.
6. For hosting + database changes: `npm run build && firebase deploy --only hosting,database`
7. Search codebase before renaming/removing anything

---

## Success Criteria

### Part A — Phase 6 Carry-overs
- [ ] Stripe end-to-end test passes (checkout → webhook → Firestore → portal → cancel)
- [ ] Nickname input overlay shown on first audience join (no localStorage nickname)
- [ ] Nickname truncated to ≤ 20 chars before RTDB write
- [ ] Returning audience member (has localStorage nickname) skips nickname prompt
- [ ] Between-question mini-leaderboard shown on audience after timed question
- [ ] At least 4 of 6 missing personality result images added

### Part B — DEVELOPMENT_PLAN.md Phase 7
- [ ] `quiz_start`, `quiz_complete`, `quiz_abandon`, `question_answered`, `conversion_signup`, `conversion_premium` GA4 events firing correctly
- [ ] `QuizProsErrorReporter` module loaded and catching uncaught errors + promise rejections
- [ ] `app_error` events appearing in Firebase Analytics when errors occur
- [ ] `QuizProsAPI` retries failed fetches up to 2× with backoff before reporting error
- [ ] `404.html` exists and is served by Firebase Hosting for unknown routes
- [ ] Offline banner shown when `navigator.onLine === false`
- [ ] Unit tests for quiz-engine scoring logic pass (`npm test`)
- [ ] Unit tests for auth state management pass
- [ ] Bundle size check in webpack warns if JS > 500KB gzipped
- [ ] `docs/development/TESTING.md` created with manual test checklist + bundle size note

### Part C — Phase 6 Missed Items
- [ ] `css/components/` directory created with buttons, cards, modals, inputs component files
- [ ] Normal body-text link contrast ≥ 4.5:1 (verify `--primary-text` / `a { color }` with WebAIM checker)
- [ ] "🔥 Popular Right Now" section on homepage showing top 5 quizzes by play count
- [ ] Play count incremented in Firestore on quiz start
- [ ] Testimonials or user stats section visible on homepage for logged-out users
- [ ] "Share Result" button on results screen — generates downloadable/shareable image card
- [ ] "How others answered" percentage breakdown shown after each knowledge quiz question
- [ ] Swipe-left gesture on quiz question advances to next (only if answered)
- [ ] Pull-to-refresh on topic listing screen refreshes the topic grid

### General
- [ ] No new console errors introduced
- [ ] All existing quiz topics still function correctly
- [ ] `npm run build` succeeds without warnings
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md updated if architecture changed

---

## End-of-Phase Checklist

When all objectives are complete, before ending this session:

- [ ] Run final verification of all changes
- [ ] Update CHANGELOG.md with all Phase 7 changes (version 7.0.0)
- [ ] Update CLAUDE.md if module map, conventions, or architecture changed
- [ ] Create `docs/development/PHASE7_HANDOFF.md` — **using the Handoff Document Template in `docs/development/PROMPT_FRAMEWORK.md`**
- [ ] Create `docs/development/PHASE8_PROMPT.md` — **using the Phase Prompt Template in `docs/development/PROMPT_FRAMEWORK.md`**, incorporating all learnings from the handoff
- [ ] **Before finalising PHASE8_PROMPT.md: audit it against `docs/development/DEVELOPMENT_PLAN.md` Phase 8 to ensure full coverage. The plan is the source of truth — the prompt must implement the full plan scope.**
