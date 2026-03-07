# Changelog

All notable changes to iQuizPros will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [13.4.0] - 2026-03-07 — Dashboard Subscription Display Fix

### Fixed
- **`dashboard.html`** — `renderSubscription(tier, customerId)`: replaced two-case `if/else` with three-case logic. The old `else` branch incorrectly showed "Upgrade Plan" to paid users without a Stripe customer ID (e.g. manually-assigned `unlimited`/`enterprise` accounts). New behaviour: (1) paid tier + `customerId` → "Manage Subscription" button wired to `handleManageSubscription`; (2) paid tier + no `customerId` → empty actions area (no button); (3) free tier → "Upgrade Plan" link to `/premium.html`. Paid tiers defined as `PAID_TIERS = ['premium', 'pro', 'unlimited', 'enterprise']`.

### Notes
- No JS/CSS bundle change — `dashboard.html` is a CopyPlugin file, not webpack-processed
- All 66 unit tests passing

---

## [13.3.0] - 2026-03-07 — Bug Fixes & Account Configuration (Phase 13C)

### Fixed
- **`css/header.css`** — Added `.user-menu-toggle.signed-in { color: #25d366 }` and `.signed-in:hover { background-color: #e8faf0; color: #128c7e }` rules. The header user icon now turns brand-green immediately on sign-in and reverts to dark (`#333`) on sign-out.
- **`js/modules/auth-manager.js`** — `_updateHeaderForUser`: adds `.signed-in` class to `#user-menu-toggle` after updating dropdown HTML (covers the `onAuthStateChanged` / page-load auth path).
- **`js/modules/auth-manager.js`** — `_updateHeaderForGuest`: removes `.signed-in` class on sign-out.
- **`js/components/header.js`** — `updateUserMenu`: adds `.signed-in` class to `#user-menu-toggle`; restored missing **Dashboard** link in dropdown HTML (covers the `quizpros:auth:signed_in` event / modal sign-in path).
- **`js/components/header.js`** — `resetUserMenu`: removes `.signed-in` class on sign-out.
- **`js/modules/ui-manager.js`** — Replaced `_startLiveSession` implementation: now reads `getCurrentTier()` directly and checks against explicit `proTiers = ['pro', 'unlimited', 'enterprise']` allowlist. The old `hasTierAccess('pro')` chain could incorrectly return `true` for any non-free tier with `expiresAt = null`.
- **`js/modules/ui-manager.js`** — Added `_showLiveSessionProModal()`: dedicated 📡 "Pro Feature" modal replacing the generic "Premium Content" modal. Includes correct copy, green gradient CTA to `/premium.html`, and `Maybe later` / click-outside dismissal.

### Changed (data only — no code deployed)
- **Firestore** `users/93fNHZN5u7YLk5ITbPTHfsFYTI13` — `subscription.tier` set to `unlimited` (`peter@mitala.co.uk` — already hardcoded admin UID, now also has explicit Firestore tier).
- **Firestore** `users/HKGncOeQ5STgCSQ9w72cj5peKxJ3` — `subscription.tier` set to `unlimited` (`ceo@stargeneral.co.uk` — full feature access including Live Session).
- **Firestore** `users/F9qXFklGtVRYvxzhEV9UjhnNnLf1` — `subscription.tier` set to `premium` (`peter@bestsellingstore.ltd` — premium quizzes + AI generation, no Live Session).

### Notes
- Two bundles produced: `app.67400b2e.js` (header icon fix) then `app.f5314404.js` (Live Session gate). Final deployed: `app.f5314404.js` / `app.e71dcbe8.css`
- All 66 unit tests passing throughout

---

## [13.2.0] - 2026-03-07 — Bug Fixes (Phase 13B)

### Fixed
- **`dashboard.html`** — Auth gate: replaced "Go to iQuizPros" link (`href="/"`) with an inline sign-in UI (Google popup button + collapsible email/password form). Users can authenticate directly without leaving the dashboard. Firebase `onAuthStateChanged` loads the full dashboard on success.
- **`js/modules/ui-manager.js`** — `_startLiveSession(quizId)`: new gating function replaces bare `onclick="window.location.href='live-presenter.html?quiz=...'"` that allowed unauthenticated / non-Pro access. Checks `QuizProsAuthManager.isSignedIn()` then `QuizProsPremium.hasTierAccess('pro')` before navigation. Exposed as `window._startLiveSession`.
- **`js/modules/ui-manager.js`** — Added `data-topic-id="${topic.id}"` attribute to `.topic-card` elements in `initTopicSelectionUI()`; dispatches `quizpros:ui:ready` CustomEvent after rendering.
- **`app.js`** — `?topic=` URL param handler IIFE: waits for `quizpros:ui:ready`, finds `[data-topic-id]` card, calls `scrollIntoView({ behavior: 'smooth', block: 'center' })`, adds `.topic-card--highlighted` for 2.5 s, cleans param via `history.replaceState`.
- **`css/theme.css`** — `.topic-card--highlighted` keyframe animation: pulsing brand-green border (`#25d366`, 3 px, `box-shadow`).

### Notes
- Bundle: `app.091ab80c.js` / `app.7e479268.css`
- All 66 unit tests passing

---

## [13.1.0] - 2026-03-06 — Landing Page & Quiz SPA Split (Phase 13.1)

### Changed
- **`landing.html`** — New standalone marketing/landing page. CopyPlugin copies it to `dist/index.html` (served at `/`). Hero section uses `assets/images/iquizpro4.png`, feature highlights, MedEd callout, sign-in / sign-up CTAs.
- **`src/index.template.html`** — HtmlWebpackPlugin now outputs to `dist/app.html` (quiz SPA), served at `/app` via Firebase rewrite.
- **`firebase.json`** — Rewrites updated: `/app` and `/app/**` → `dist/app.html`; `/` serves `dist/index.html` directly.
- **`dashboard.html`** / **`js/components/header.js`** — All internal deep-links updated from `/` and `/index.html` to `/app`.

### Notes
- Separates marketing landing page from the quiz SPA for a conversion-optimised entry point at `/`

---

## [13.0.0] - 2026-03-06 — MedEd Hub & Diagnostic Quizzes (Phase 13)

### Added
- **`meded.html`** — New standalone MedEd Hub marketing page at `/meded`. Dark hero with "Do you make these psychiatry learning mistakes?" headline, two CTA buttons (Medical Student / Psychiatric Nurse), benefits section, How It Works steps, and final CTA strip. Inline GA4, brand green only.
- **`js/modules/question-bank.js`** — Two new free diagnostic quiz topic objects added to `defaultTopics`: `psych-mistakes-med-student` and `psych-mistakes-nurse` (both `category: 'healthcare'`, 8 Qs, `isPremium: false`).
- **`js/modules/question-bank.js`** — Two new question arrays: `psychMistakesMedStudent` (8 study-habits questions for med students) and `psychMistakesNurse` (8 clinical-learning questions for psychiatric nurses). All questions: `answer` as 0-based integer, `difficulty: 'easy'`, `explanation` field, `category: 'healthcare'`.
- **`js/modules/quiz-engine.js`** — `_injectMedEdDiagnosticResults(topicId, answers, score, total)` — new private function that analyses `selectedAnswers` after a `psych-mistakes-*` quiz to detect up to 4 mistake patterns per role (passive learning, avoiding scenarios, ignoring feedback, cramming for med students; similar patterns for nurses). Shows top 3 mistakes with descriptive text, then renders a "Best next quizzes for you" block with 3 recommended psychiatry topic links. Called automatically from `showResults()`.
- **`landing.html`** — Added "MedEd Hub" nav link pointing to `/meded`.
- **`webpack.config.js`** — Added `meded.html` CopyPlugin entry.
- **`firebase.json`** — Added `/meded` and `/meded/**` rewrites to `dist/meded.html`.

### Notes
- Bundle: `app.03ede69d.js` / `app.6134aff4.css` — 3 pre-existing warnings, 0 errors
- All 66 unit tests passing

---

## [12.0.0] - 2026-03-05 — Healthcare Quiz Category & Psychiatry Content (Phase 12)

### Added
- **`js/modules/question-bank.js`** — 250 clinically accurate psychiatry questions across 10 topics:
  - Medical: Schizophrenia (25), Mood Disorders (25), Anxiety/OCD/Trauma (25), Neurocognitive Disorders (25), Personality Disorders (25) — DSM-5 aligned
  - Nursing: Communication & Legal (25), Mood & Anxiety Care (25), Psychotic Disorders (25), Personality Nursing (25), Special Populations & Ethics (25) — NCLEX-style
- **`js/modules/question-bank.js`** — 10 new `defaultTopics` entries with `category: 'healthcare'`; 2 free (`psych-schizophrenia`, `psych-nursing-communication`), 8 premium-gated.
- **`js/config.js`** — 8 new `gatedQuizIds` entries for premium psychiatry topics.
- **`js/modules/ui-manager.js`** — Healthcare section (`#healthcare-section`) rendered after Knowledge section; uses `fas fa-stethoscope` icon; premium lock badges on gated cards.
- **`js/modules/quiz-scoring.js`** — `getScoreMessage(score, total, topicId)` — optional `topicId` param; `psych-*` topics get specialist profiles (🧠 Brilliant Diagnostician → 🎓 Beginning the Journey) with `.title` field.
- **`js/modules/quiz-renderer.js`** — `renderScoreResult(score, total, topicId)` — renders `.title` as `<h2>` for psych topics.
- **`js/modules/quiz-engine.js`** — Passes `currentQuiz` as `topicId` to scoring/renderer; psych-specific WhatsApp share text.
- **`assets/images/psychiatry/`** — 10 WebP placeholder images (800×800, brand green gradient).
- **`dashboard.html`** — AI presets panel with preset dropdown (Medical/Nursing Psychiatry optgroups), question count, difficulty, and `promptPrefix` support; `dashboardGenerateQuiz()` function.
- **`functions/index.js`** — `promptPrefix` field in `generateQuiz` (300-char cap, injected into Gemini prompt).

### Notes
- Bundle: `app.de279f41.js` / `app.6134aff4.css`
- All 66 unit tests passing

---

## [11.0.2] - 2026-03-03 — Mobile Sign-In Fix (auth-ready wait)

### Fixed
- **`js/modules/auth-manager.js`** — Added `_waitForAuth(maxWaitMs)` helper: polls every 50ms until `_auth` is set, resolving with the auth instance or rejecting after `maxWaitMs`.
- **`js/modules/auth-manager.js`** — `signIn()` and `signUp()` now call `_waitForAuth(3000)` before making the Firebase network request. On mobile, the `async`-loaded auth SDK may take up to ~1s to be available; the 3-second wait ensures sign-in proceeds automatically once auth is ready rather than immediately rejecting.
- **`js/modules/auth-manager.js`** — Added `'auth/not-ready'` to the error message map for the rare case where auth cannot initialize within 3 seconds.

---

## [11.0.1] - 2026-03-03 — Mobile Sign-In Fix

### Fixed
- **`js/modules/auth-manager.js`** — `_handleSignInSubmit`: added 15-second timeout guard that resets the button and shows an error message if Firebase auth hangs on a slow mobile network. Button is now explicitly reset to `'Sign In'` on both success and failure paths (previously was only reset on failure, leaving the button in a "Signing in…" disabled state if `_closeAllModals()` had any delay on iOS).
- **`js/modules/auth-manager.js`** — `_handleSignUpSubmit`: same 15-second timeout + button reset on success applied identically to the sign-up flow.
- **`js/modules/auth-manager.js`** — `_handleGoogleSignIn`: button now shows `'Redirecting to Google…'` feedback while the redirect initiates (previously only `disabled`, no visible indicator). Original button text is restored on error/cancellation.

---

## [11.0.0] - 2026-03-03 — Platform Polish & Live Session Improvements (Phase 11)

### Added

#### 11.1 — Session Archive Title from RTDB
- **`live-presenter.html`** — `setupArchiveButton()` now reads `sessions/{code}/title` from RTDB before writing the Firestore `sessionArchive` doc. Uses the presenter-set title if available; falls back to `'Session {code}'` when no title is set.
- **`dashboard.html`** — `renderPastSessions()` already displays `doc.title` — confirmed working with the new RTDB-sourced value.

#### 11.5 — Quiz Search / Filter on Home Page
- **`js/modules/ui-manager.js`** — Added `<div class="quiz-search-bar">` HTML with `#quiz-search-input` and `#quiz-search-clear` button to the dynamically-generated topic selection screen.
- **`js/modules/ui-manager.js`** — Added `data-title` and `data-category` attributes to all `.topic-card` elements (knowledge cards use `category="knowledge"`, personality card uses `category="personality"`, premium card uses `category="premium"`).
- **`js/modules/ui-manager.js`** — `_initSearchFilter()` — debounced (200ms) input handler shows/hides `.topic-card` elements by matching query against `data-title` and `data-category`; shows ✕ clear button when query non-empty; injects `.quiz-no-results` paragraph when no cards match; `#quiz-search-clear` click resets and refocuses.
- **`css/theme.css`** — Added `.quiz-search-bar`, `#quiz-search-clear`, and `.quiz-no-results` styles including dark mode variants.

#### 11.6 — Performance: Lazy-Load Firebase Auth SDK
- **`src/index.template.html`** — Changed `firebase-auth-compat.js` `<script>` tag to `async` to defer auth SDK loading and reduce render-blocking time.
- **`js/modules/auth-manager.js`** — `initialize()` now checks `typeof firebase.auth === 'function'` before calling `_doInitAuth()`. If auth SDK not yet loaded, polls via `_waitForAuthAndInit(20)` (20 × 50ms = 1000ms max). Logs a warning if auth never becomes available. `_doInitAuth()` extracted from `initialize()` to keep logic clean.

#### 11.4 — Share Session QR Overlay for Live Presenter
- **`live-presenter.html`** — Added `#ext-share-qr-btn` (📲) floating button at `right:16rem`, positioned alongside existing floating buttons.
- **`live-presenter.html`** — Added `#ext-share-qr-overlay` fullscreen black overlay containing: large 400×400 QR code image (via `api.qrserver.com`), readable join URL text, and ✕ close button (top-right). Overlay opens on share button click, closes on ✕, backdrop click, or `Escape` key.
- **`live-presenter.html`** — `setupShareQR()` function added and called from `init()`.

#### 11.2 — Playwright CI Integration
- **`.github/workflows/e2e.yml`** — New GitHub Actions workflow: runs on push/pull_request; Node 20; `npm ci` → `playwright install chromium` → `npm run build` → `serve dist` → `npm run test:e2e`.

### Build
- Bundle: `app.17bd2872.js` / `css/app.6134aff4.css` (webpack 5, 533 dist files)
- All 66 unit tests passing

---

## [8.0.0] - 2026-03-01 — PWA & Security Rules (Phase 8.1–8.2)

### Added

#### 8.1 — Progressive Web App

- **`manifest.json`** — Web App Manifest with name, short name, description, icons (192×192 and 512×512), theme colour `#25d366`, standalone display, portrait orientation, category shortcuts ("Take a Quiz → `/#quizzes`"), and screenshot metadata.
- **`assets/icons/icon-192.png`** and **`icon-512.png`** — Branded placeholder icons: green-to-teal gradient background (`#25d366` → `#128c7e`), rounded corners, white "Q" ring + tail symbol.
- **`sw.js`** — Service worker with:
  - **Install**: caches app shell (`/`, `/manifest.json`, `/favicon.ico`, icons, default-personality.webp)
  - **Activate**: cleans stale caches, claims open clients
  - **Cache-first** strategy for static assets (JS, CSS, images, fonts, sounds)
  - **Stale-while-revalidate** for quiz JSON templates
  - **Navigation fallback**: offline → serves cached `index.html` (SPA mode)
  - **Image fallback**: offline image requests → `default-personality.webp`
  - **Background sync** handler: on `sync-quiz-history` tag, posts `SYNC_QUIZ_HISTORY` message to all clients to trigger pending history flush
- **`app.js`** — Service worker registration in `_initServiceWorker()` (called from `initApp()`); SW controller-change listener updates offline banner text; SW message handler calls `_flushPendingQuizHistory()` for background sync.
- **`app.js`** — Install prompt: captures `beforeinstallprompt` at window level; after first quiz completion shows a dismissible bottom sheet with brand styling; `appinstalled` event tracked via `QuizProsAnalytics`; flush pending history from localStorage when SW background sync fires.
- **`src/index.template.html`** — Added `<link rel="manifest">`, `<meta name="theme-color" content="#25d366">`, Apple mobile web app meta tags, `<link rel="apple-touch-icon">`.
- **`webpack.config.js`** — CopyPlugin patterns for `manifest.json` and `sw.js`.
- **`firebase.json`** — `sw.js` header: `Cache-Control: no-cache, no-store, must-revalidate` + `Service-Worker-Allowed: /`; `storage.rules` configuration reference.
- **`js/modules/quiz-engine.js`** — Dispatches `quizpros:quiz:completed` CustomEvent at end of `showResults()` to signal install prompt and other listeners.

#### 8.2 — Firebase Security Rules Hardening

- **`firestore.rules`** — Audit and improvements:
  - `live_sessions/.../slides`: write now requires presenter-ID check (was `auth != null` — any authenticated user could write)
  - `live_sessions/.../responses`: `update: if false` (immutable after submission)
  - `live_sessions/.../aggregations`: write now requires presenter-ID check
  - Top-level `responses` collection: `update: if false` (prevents answer manipulation after submission)
  - `local_quizzes`: create enforces `uid == request.auth.uid`; update requires ownership check
  - Rate-limiting advisory comments added to all public-write collections
- **`storage.rules`** — New file: explicit deny-all for Firebase Storage (Storage not yet in use; prevents unintended public access if Storage is enabled).
- **`database.rules.json`** — Updated comments: Admin SDK bypass note for `cleanupExpiredSessions`, Phase 5C/6 RTDB fields documented (`resultsVisible`, `locked`, `timerStartedAt`). Rules logic unchanged (were already correct).

### Changed

- `firebase.json` — Added `storage.rules` configuration.

---

## [7.0.0] - 2026-03-01 — Analytics, Testing & Quality (+ Phase 6 Carry-overs)

### Added

#### A — Phase 6 Carry-overs

- **Live audience nickname overlay** (`live-audience.html`) — Full-screen `#ext-nickname-overlay` shown on first join when `localStorage('iqp_nickname')` is absent. Input validates 1–20 chars; trims and truncates before RTDB write (fixes pitfall #23). Skipped if nickname already stored.
- **Between-question leaderboard** (`live-audience.html`) — After timed question submission, waits 800 ms then shows a 3-second "🏆 Top Players" panel listing top 5 participants by score; auto-dismissed when `currentSlide` changes.
- **Personality quiz placeholder images** (`assets/images/`) — 11 new branded WebP placeholder images (400×400, gradient backgrounds, emoji icons) for Travel and Love Language personality quiz result types: `adventurer-personality.webp`, `culturalist-personality.webp`, `relaxer-personality.webp`, `socialiser-personality.webp`, `travel-personality.webp`, `words-affirmation-personality.webp`, `acts-service-personality.webp`, `receiving-gifts-personality.webp`, `quality-time-personality.webp`, `physical-touch-personality.webp`, `love-language.webp`.

#### 7.1 — Analytics Enhancement

- **`js/modules/analytics.js`** — 7 new GA4 event methods added to public API: `trackQuizStart` (`quiz_start`), `trackQuizComplete` (`quiz_complete`), `trackQuizAbandon` (`quiz_abandon`), `trackQuestionAnswered` (`question_answered`), `trackSignup` (`conversion_signup`), `trackPremiumUpgrade` (`conversion_premium`), `trackAppError` (`app_error`). All support offline queue fallback.
- **`js/modules/quiz-engine.js`** — Calls `trackQuizStart` after `isPersonalityQuiz` set; `trackQuizAbandon` in `resetAndReturn()`; `trackQuizComplete` in `showResults()`; `trackQuestionAnswered` in `selectAnswer()` with time-spent and correctness.
- **`js/modules/auth-manager.js`** — Calls `trackSignup` in `signUp()` success handler.
- **`js/modules/premium.js`** — Calls `trackPremiumUpgrade` in `redirectToPaymentLink()`.

#### 7.2 — Error Monitoring & Reliability

- **`js/utils/error-reporter.js`** — New IIFE module (`window.QuizProsErrorReporter`); captures global `window.error` and `unhandledrejection` events; maintains in-memory log (max 50 entries); forwards to `QuizProsAnalytics.trackAppError` for GA4 reporting.
- **`js/utils/api.js`** — Retry logic: up to 2 retries with 1 s / 2 s exponential backoff for network/timeout errors; HTTP 4xx/5xx do not retry.
- **`404.html`** — Branded 404 page with gradient logo and "Take a Quiz" CTA.
- **`firebase.json`** — Added `"cleanUrls": true` to hosting config.
- **`src/index.template.html`** — Offline banner (`#offline-banner`) shown/hidden by `app.js` `handleOnlineStatus`/`handleOfflineStatus` handlers.

#### 7.3 — Testing & Quality

- **`tests/unit/quiz-scoring.test.js`** — Jest tests for `getDominantType()` and `getScoreMessage()`.
- **`tests/unit/analytics.test.js`** — Jest tests for all 7 new Phase 7 analytics methods; covers GA4 firing and offline queue fallback.
- **`package.json`** — Added `jest`, `jest-environment-jsdom`, `babel-jest`, `@babel/core`, `@babel/preset-env` devDeps; `"test"` script; jest config (jsdom environment); Babel config.
- **`docs/development/TESTING.md`** — Running tests, test file table, stub pattern, bundle size check, manual test checklist.
- **`webpack.config.js`** — Performance budget reduced from 1 MB to 512 KB per asset.

#### C — Phase 6 Missed Items

- **CSS component library** (`css/components/`) — 4 new files: `buttons.css` (`.btn`, `.btn-primary/secondary/danger/ghost/sm/lg/block`), `cards.css` (`.card`, `.card-interactive/accent`), `modals.css` (`.modal-backdrop`, `.modal`, fade-in/slide-up animations), `inputs.css` (`.input`, `.form-group/label/hint/error`, error/success states). All imported in `src/app-entry.js`.
- **Link contrast** (`css/theme.css`) — `a { color: #0d6b62 }` (4.6:1 on white, WCAG AA ✓); was `#128c7e` (4.1:1).
- **Popular quizzes carousel** (`js/modules/ui-manager.js`) — `_renderPopularQuizzes()` reads `quizStats` ordered by `playCount` desc, limit 5; renders horizontal-scroll card row with play counts; called on `initTopicSelectionUI()`.
- **Testimonials section** (`js/modules/ui-manager.js`) — Static 3-card testimonials block injected below topic grid.
- **Shareable result card** (`js/modules/quiz-engine.js`) — `_injectShareButton()` adds "Share Result" button to results screen; `_buildShareCanvas()` creates 600×315 canvas with gradient, score/result text, and CTA; uses Web Share API (`navigator.share` with `files`) or falls back to PNG download.
- **"How others answered"** (`js/modules/quiz-engine.js`) — `_recordAndShowHowOthersAnswered()` increments `quizStats/{topicId}.q{N}o{i}` via Firestore and renders percentage bar chart below question container for knowledge quizzes.
- **Play count tracking** (`js/modules/quiz-engine.js`) — `quizStats/{topicId}.playCount` incremented via `FieldValue.increment(1)` on every `startQuiz()`.
- **Swipe gesture** (`js/modules/quiz-engine.js`) — `_attachSwipeHandler()`: swipe left on locked question advances to next; min 60 px horizontal delta, horizontal-dominant check.
- **Pull-to-refresh** (`js/modules/ui-manager.js`) — `_attachPullToRefresh()`: pull ≥80 px re-renders topic selection; visual indicator; only fires when `scrollY === 0`.

### Changed

- **`firestore.rules`** — Added `quizStats/{topicId}` rules: public read; create/update restricted to numeric field names (`playCount`, `q{N}o{N}`) only — prevents arbitrary data injection.

### Fixed

- **Link colour contrast** — `a { color: #0d6b62 }` meets WCAG AA 4.5:1 for normal text (was 4.1:1 with `#128c7e`).

### Build

- Bundle: `app.ce20b1ff.js` (268 KiB) / `app.6f4cc9ba.css` (70.6 KiB) — built 2026-03-01

---

## [6.1.0] - 2026-03-01 — UI/UX Modernization (Design System, Homepage, Animations, Mobile, Accessibility)

### Added

#### 6.1 — Design System Tokens
- **Extended CSS token set** (`css/theme.css`) — New `:root` variables: `--primary-text: #128c7e`, `--shadow-xl`, `--shadow-inner`, `--spacing-2xl`, `--spacing-3xl`, `--font-size-2xl/3xl/4xl`, `--leading-tight/normal/relaxed`
- **Dark mode auto-detect** (`css/theme.css`, `js/components/header.js`) — `@media (prefers-color-scheme: dark)` block using `body:not(.light-mode-forced)` selector; mirrors all `body.dark-mode` overrides. JS `_applyThemePreference()` reads stored preference on load, falls back to system preference if none stored. `light-mode-forced` class blocks the CSS media query when user manually selects light mode.
- **Skeleton loaders** (`css/theme.css`, `src/index.template.html`) — `@keyframes skeleton-shimmer` + `.skeleton` / `.skeleton-card` / `.skeleton-text` classes; `#topic-selection-screen` now starts with a skeleton grid as its initial HTML state, replaced by real content once `initTopicSelectionUI()` runs.

#### 6.2 — Homepage Redesign
- **Hero section** (`js/modules/ui-manager.js`) — Green gradient banner injected at the top of `initTopicSelectionUI()`, with headline "Discover Yourself. Test Your Knowledge.", sub-headline, and "Start a Quiz" + "Go Premium" CTAs; styled via `.hero-section`, `.hero-title`, `.btn-hero`, `.btn-hero-outline` in `theme.css`.
- **"Continue Where You Left Off" card** (`js/modules/ui-manager.js`) — Scans all knowledge topics for `iqp_progress_{topicId}` in `localStorage`; if any valid (non-expired) in-progress entries are found, renders a `.resume-section` with `.resume-card` items showing topic name, progress percentage, and a "Resume Quiz" button before the topic grid.
- **Premium upgrade CTA strip** (`js/modules/ui-manager.js`) — `.upgrade-cta-strip` block rendered below the topic grid for non-premium users, with headline and "Upgrade to Premium" button linking to `/premium.html`.

#### 6.3 — Quiz Experience Animations
- **Question fade-in** (`js/modules/quiz-engine.js`, `css/theme.css`) — `showQuestion()` removes and re-adds `quiz-question-animate` class with a forced reflow, triggering `@keyframes quiz-fade-in` (opacity 0→1, translateY 12→0).
- **Correct/incorrect option animation** (`css/theme.css`) — `option.correct` gets `@keyframes option-correct-pulse` (scale 1→1.04→1, green glow); `option.incorrect` gets `@keyframes option-incorrect-shake` (horizontal shake).
- **Score count-up** (`js/modules/quiz-engine.js`) — Knowledge results screen uses `requestAnimationFrame` to animate the score from 0 to final value over 700ms with a cubic-ease-out curve; personality results get `score-reveal-animate` pop animation.
- **Hero slide-in** (`css/theme.css`) — Hero section uses `@keyframes hero-slide-in` (opacity + translateY) on page load.

#### 6.4 — Mobile Optimization
- **Bottom navigation bar** (`src/index.template.html`, `css/theme.css`, `js/components/header.js`) — Fixed `<nav class="bottom-nav">` with Home/Quizzes/Dashboard/Premium items; hidden on desktop via `@media (max-width: 768px)` only; `env(safe-area-inset-bottom, 0px)` for iPhone X+ notch; `_initBottomNav()` in `header.js` sets `.active` class based on `window.location.pathname`.
- **44px touch targets** (`css/layout.css`) — `min-height: 44px; display: flex; align-items: center` added to `.option` on both desktop and mobile overrides, meeting WCAG 2.5.5.
- **Haptic feedback** (`js/modules/quiz-engine.js`) — `navigator.vibrate()` called in `selectAnswer()`: `[40,30,40]` for correct answer, `[120]` for wrong answer, `[30]` for personality option tap (where correct/wrong is undefined).

#### 6.5 — Accessibility (WCAG 2.1 AA)
- **Skip navigation link** (`src/index.template.html`) — `<a href="#main-content" class="skip-nav-link">Skip to main content</a>` immediately after `<body>`; styled to be visible only on focus.
- **`<main>` landmark** (`src/index.template.html`) — All quiz screens wrapped in `<main id="main-content" aria-label="Quiz Application">`.
- **`aria-checked` live update** (`js/modules/quiz-engine.js`) — `selectAnswer()` now queries all `.option[role="radio"]` buttons and sets `aria-checked="true"` on the selected option, `"false"` on all others, so screen readers announce the selection correctly.
- **Keyboard navigation in radiogroup** (`js/modules/quiz-engine.js`) — `showQuestion()` attaches `keydown` listeners to each `.option[role="radio"]`: `ArrowDown`/`ArrowRight` focuses next option, `ArrowUp`/`ArrowLeft` focuses previous, compliant with ARIA radiogroup pattern.
- **Focus management** (`js/modules/quiz-engine.js`) — After rendering a new question, `setTimeout(..., 80)` focuses the first `.option[role="radio"]`, so keyboard users are placed at the answer options immediately.
- **`prefers-reduced-motion`** (`css/theme.css`) — `@media (prefers-reduced-motion: reduce)` block disables all `transition` and `animation` properties site-wide.
- **Link contrast fix** (`css/theme.css`) — Global `a { color: #128c7e }` (dark green, 4.1:1 on white) replaces the default `#25d366` (2.9:1) for body-text links, meeting WCAG AA for normal text.

### Changed
- **`css/theme.css`** — Extended `:root` tokens; appended ~390 lines of new CSS for all of the above features.
- **`css/layout.css`** — `.option` desktop and mobile rules updated with `min-height: 44px`.
- **`js/modules/quiz-engine.js`** — `selectAnswer()`, `showQuestion()`, `showResults()` all extended with accessibility and animation logic.
- **`js/modules/ui-manager.js`** — `initTopicSelectionUI()` now prepends hero section, resume card section, and appends premium CTA strip.
- **`js/components/header.js`** — Added `_applyThemePreference()`, `_initBottomNav()`, system dark-mode change listener; `toggleTheme()` updated to manage `light-mode-forced` class.
- **`src/index.template.html`** — Added skip-nav link, `<main>` wrapper, skeleton loader initial state for `#topic-selection-screen`, bottom nav HTML.

### Notes
- New bundle: `app.e1ff33dc.js` / CSS: `app.4cc919f5.css` (deployed 2026-03-01, 504 files, 3 new uploads)
- Deferred to Phase 7+: shareable result image cards (Canvas API), "how others answered" aggregation, testimonials section, pull-to-refresh, swipe gestures, play counts / popular quizzes badge

---

## [6.0.0] - 2026-03-01 — Leaderboard, Server Sync, Retake UX & Accessibility

### Added
- **Live Audience — Nickname** (`live-audience.html`) — Extension prompts for nickname on join. Reads from `localStorage('iqp_nickname')`, then `#waiting-nickname` DOM element (set by pre-built bundle), then `#nickname-input`, then falls back to `'Player_' + key.slice(-4)`. Written to `sessions/{code}/participants/{key}/nickname` in RTDB.
- **Live Audience — Score tracking** (`live-audience.html`) — After submitting a timed-question response, computes `floor(timeRemaining / totalTime * 100)` points (0–100). Writes `scoreDelta_{slideIdx}` to participant node; atomically increments cumulative `score` via RTDB transaction. Shows "+N points! ⚡" notice in submitted state.
- **Live Audience — Server timestamp sync** (`live-audience.html`, task 6.2) — On init, subscribes to RTDB `.info/serverTimeOffset`; stores offset in `serverTimeOffset` var. `startTimer()` now computes remaining time as `(endTime - (Date.now() + serverTimeOffset)) / 1000` for accurate multi-device countdown.
- **Live Presenter — Leaderboard overlay** (`live-presenter.html`, task 6.1) — Floating 🏆 button (fixed, bottom-right). Opens full-screen overlay with real-time ranking of all participants sorted by cumulative `score` descending. Top 3 get medal emojis. Listener attached on open and detached on close. `escHtml()` helper prevents XSS in nicknames.
- **Live Presenter — Server timestamp write** (`live-presenter.html`, task 6.2) — "Apply to Current Slide" now writes `timerStartedAt: firebase.database.ServerValue.TIMESTAMP` instead of `Date.now()` for accurate cross-device timer sync.
- **Retake confirmation modal** (`app.js`, task 6.3) — After fetching the AI quiz on retake, shows a branded confirmation card (quiz title, topic, question count) with "▶ Start Quiz" and "Cancel" buttons before calling `QuizProsEngine.startGeneratedQuiz()`. Cancel calls `resetAndReturn()`.
- **Accessibility — topic grid** (`js/modules/ui-manager.js`, task 6.4) — `role="list"` on all `.topics-grid` containers; `role="listitem"` + `aria-label="[name] quiz"` on all `.topic-card` divs.
- **Accessibility — quiz question** (`js/modules/quiz-renderer.js`, task 6.4) — `aria-live="polite"` on `.question-banner`; `role="radiogroup"` + `aria-label="Answer options"` on `.options` container; `role="radio"` + `aria-checked="false"` on each option button. Applied to both `renderQuestion()` and `renderZodiacQuestion()` text-option branch.
- **Accessibility — progress bar** (`src/index.template.html` + `js/modules/quiz-engine.js`, task 6.4) — `role="progressbar"` + `aria-valuemin="0"` + `aria-valuemax="100"` + `aria-valuenow="0"` added to `#progress` element; `aria-valuenow` updated at every progress change (reset, per-question, zodiac question, results).
- **Database rules — participant fields** (`database.rules.json`) — `.validate` rules for `nickname` (string, 1–20 chars) and `score` (number ≥ 0) under `sessions/{code}/participants/$uid`.

### Changed
- **`live-audience.html`** — `submitResponse()` now accepts and computes `scoreDelta`; `showSubmitted()` accepts score argument and displays score note.
- **`live-presenter.html`** — Timer write changed from `Date.now()` to `firebase.database.ServerValue.TIMESTAMP`.

### Notes
- New bundle: `app.ae1cb728.js` / CSS: `app.d92689bb.css`
- Deploy pending Firebase re-authentication (all code complete)

---

## [5.1.0] - 2026-02-28 — New Quiz Content, Explanation Mode & Question Randomisation

### Added
- **4 new knowledge quiz topics** (`js/modules/question-bank.js`) — Technology & Computing, Sports, Music, Food & Cooking — each with 15 questions and `funFact` fields on key questions
- **3 new personality quiz templates** — Travel Personality (`lifestyle/travel-personality-quiz.json`, 4 types: Adventurer, Culture Seeker, Relaxer, Social Explorer), Love Language (`relationships/love-language-quiz.json`, 5 types: Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, Physical Touch), Color Personality (`self-discovery/color-personality-quiz.json`, 4 types: Red, Blue, Yellow, Green)
- **Explanation / fun fact banner** (`js/modules/quiz-engine.js`, `css/layout.css`) — After answering a knowledge quiz question, a branded banner displays the question's `funFact` or `explanation` field with a 💡 icon; delay extended to 2.8 s when a banner is shown; animated fade-in with dark-mode support
- **Question pool randomisation** (`js/modules/quiz-engine.js`) — Knowledge quiz questions are Fisher-Yates shuffled and capped at 10 when the pool exceeds 10, ensuring variety on repeat plays

### Changed
- **`js/modules/question-bank.js`** — `defaultTopics` array expanded from 7 to 11 entries; `getQuestions()` switch handles 4 new topic IDs
- **`app.js`** — `templateFiles` array in `loadFullQuizTemplates()` extended with 3 new personality quiz paths
- **Bundle** — `app.df495c83.js` / `app.d92689bb.css` — deployed 2026-02-28

---

## [5.0.0] - 2026-02-28 — Live Presenter Expansion, Dashboard Retake & Nav Link

### Added
- **`live-audience.html` extension overlay** (tasks 5.3 + 5.4) — Lightweight extension layer alongside the pre-built audience bundle. Activates automatically when the current question's `type` field in RTDB is not `multiple-choice`. Supports:
  - **Word cloud** (`type: "word-cloud"`) — text input (max 20 chars); CSS word-cloud results sized by response frequency
  - **Rating scale** (`type: "rating"`) — tap-to-select number buttons (1–5 or 1–10); bar chart + bold average in results
  - **True / False** (`type: "true-false"`) — two full-width buttons; animated percentage fill bars in results
  - **Countdown timer** — synced via `timerStartedAt` + `timer` fields in RTDB; locks new submissions when expired
  - All responses stored at `sessions/{code}/responses/{participantKey}_{slideIdx}`
- **`live-presenter.html` extension layer** (tasks 5.3–5.5) — Floating ⚙️ panel to set question type and timer on any slide:
  - Buttons for Multiple Choice / True–False / Rating / Word Cloud
  - Timer-seconds input (0 = no timer); rating-scale selector (1–5 or 1–10)
  - "Apply to Current Slide" writes `{ type, timer, ratingScale, timerStartedAt }` to `sessions/{code}/questions/{idx}` in RTDB
  - `createdAt` patch: polls DOM for session code, writes `createdAt: Date.now()` to RTDB if absent (required by `cleanupExpiredSessions`)
  - Stores session code in `localStorage` (`iqp_session_code`) for the audience extension to discover
- **`QuizProsEngine.startGeneratedQuiz(quizData)`** (`js/modules/quiz-engine.js`) — New public API method that loads an AI-generated quiz (from `getGeneratedQuiz` Cloud Function response) into the engine and starts it; converts `correctIndex` → `answer` format; exposed in public API
- **Retake URL handler** (`app.js`) — IIFE at end of file; reads `?retake={quizId}`, removes param from URL, waits for auth state, calls `getGeneratedQuiz` Cloud Function, then calls `QuizProsEngine.startGeneratedQuiz()`
- **Dashboard link in user dropdown** (`js/modules/auth-manager.js`) — "/dashboard.html" link with fa-tachometer-alt icon added to signed-in user dropdown; shown only when authenticated

### Changed
- **`src/index.template.html`** — Added `firebase-functions-compat.js` CDN script (v9.6.0); required for `firebase.app().functions('europe-west2')` calls in `app.js` retake handler
- **`js/modules/auth-manager.js`** — Fixed residual purple gradient (`#667eea` / `#764ba2`) in `_showProfileModal` → brand green `#25d366` / `#128c7e`

### Notes
- Pre-built live-presenter/audience webpack bundles remain untouched; all new question types are handled by extension scripts injected via HTML
- New JS bundle hash: `app.3c1e2f8d.js` / CSS: `app.ccf26fb1.css`
- Deployed 2026-02-28

---

## [4.2.0] - 2026-02-28 — Full Brand Colour Audit

### Changed
- **Brand colour standardised to `#25d366` (logo green) across the entire codebase**
- **`premium.html`** — replaced purple hero/header gradient, featured card border, badges, card headings, buttons, comparison table header, FAQ question colour (`#667eea`/`#764ba2` → `#25d366`/`#128c7e`)
- **`dashboard.html`** — replaced purple header, hero gradient, spinner accent, buttons, stat values, usage bar, card hover border, card icons with brand green
- **`css/theme.css`** — CSS variables aligned: `--primary-color: #25d366`, `--primary-dark: #128c7e`, `--primary-light: #3ed664`; secondary variables also updated: `--secondary-color: #25d366`, `--secondary-dark: #128c7e`, `--secondary-light: #e8faf0`
- **`css/quiz-detail.css`** — quiz detail header gradient, info icons, "Start Live" button gradient all changed from old purple to brand green; hover shadow updated to `rgba(18,140,126,0.4)`
- **`css/layout.css`** — all personality quiz purple (`#7d5ba6`) → `#25d366`; purple tint backgrounds (`#f0e8ff`, `#e6dbff`, `#f9f5ff`, `#f8f5ff`) → green equivalents (`#e8faf0`, `#d4f5e9`, `#f0faf5`)
- **`styles.css`** — all personality quiz purple (`#7d5ba6`) → `#25d366`; personality question banner, option borders, hover backgrounds, result headings, avatar borders, detail section headings, "Try Another Quiz" button all updated; hover state `#6a4a91` → `#128c7e`
- **`js/components/header.js`** — "Upgrade to Premium" dropdown button gradient changed from purple to brand green
- **`js/modules/ui-manager.js`** — "Self-Discovery & Identity" category colour changed from `#9b59b6` to `#25d366`

### Notes
- Intentionally unchanged: zodiac=dark-blue, career=blue (quiz-specific theming); toast colours (semantic); premium gold `#ffc107` (tier indicator); enterprise button `#2c3e50` (neutral CTA)
- New CSS bundle hash: `app.ce4c676b.css` (theme.css change triggered re-hash)
- Deployed 2026-02-28

---

## [4.0.0] - 2026-02-28 — Dashboard, Subscription Management & Infrastructure

### Added
- **`dashboard.html`** — New premium dashboard page at `/dashboard.html`:
  - Auth-gated: redirects unauthenticated visitors to the sign-in flow
  - Subscription panel: shows current tier + badge; "Manage Subscription" button for paid users (opens Stripe Customer Portal via `createPortalSession`); "Upgrade Plan" link for free users
  - AI usage stats: calls `getUserUsageStats` Cloud Function to display used/limit/remaining counts + animated usage bar (turns amber/red at 80%+; green unlimited bar for null-limit tiers)
  - Score trend: CSS bar chart of last 10 scored quiz results
  - Quiz history: last 20 quizzes from `users/{uid}/quizHistory` Firestore collection with colour-coded score badges (green/amber/red for scored, blue for personality)
  - AI quiz library: grid cards from `listUserQuizzes` Cloud Function with Retake and Delete actions
  - Matches `premium.html` visual style (same gradient header, card layout, brand colours)
  - Standalone page (inline Firebase init + CDN SDKs) — no webpack bundle needed
- **`createPortalSession` Cloud Function** (`europe-west2`) — callable function that creates a Stripe Customer Portal session for a subscribed user; reads `stripeCustomerId` from `users/{uid}.subscription` (map field); returns `{ url }` for redirect
- **`cleanupExpiredSessions` Cloud Function** (`europe-west2`) — scheduled daily (`every 24 hours`, `Europe/London`); deletes Realtime Database sessions under `sessions/{code}` with `createdAt` older than 24 hours; uses `admin.database().ref('sessions').orderByChild('createdAt').endAt(cutoff)`
- **`database.rules.json`** — Realtime Database security rules for live presenter sessions:
  - Everyone reads `sessions/{code}` (audience joins without auth)
  - Authenticated users create sessions; only presenter (by `presenterId` field) can update/delete
  - Per-question data writable only by presenter
  - Participants write only their own record; presenter reads all
  - Responses enforce `slideIndex`, `value`, `submittedAt` fields; no overwrite after submission (except by presenter)
- **`firebase.json`** — Added `"database": { "rules": "database.rules.json" }` block

### Changed
- **`webpack.config.js`** — `dashboard.html` added to CopyPlugin patterns so it is copied to `dist/` on each build

### Notes
- Live presenter new question types (word cloud, rating scale, true/false), countdown timer, and leaderboard (Phase 4.3/4.4) are **deferred to Phase 5** — the live-presenter webpack bundles are pre-built and cannot be modified without the original source project
- `createPortalSession` reads from `users/{uid}` map field (not subcollection) — consistent with how `stripeWebhook` writes subscription data

---

## [3.2.0] - 2026-02-28 — Pricing Restructure (v3.2 pricing update)

### Added
- **Enterprise tier** — New "Enterprise" plan with custom pricing (Contact Us); added to `js/config.js` premium tiers and `premium.html`
- **Pro tier** — New "Pro" plan at $29.99/month with 500 AI quiz generations/month; replaces the old "Unlimited" plan in frontend and Cloud Functions

### Changed
- **Pricing update** — Premium: $9.99 → $12.99/month (100 AI gen/month, down from 200); Pro replaces Unlimited at $29.99/month (500 AI gen/month, replacing unlimited)
- **Free tier** — AI generation quota increased from 3 → 5 per month
- **`functions/index.js`** — `RATE_LIMITS` updated: `free` 3→5, `premium` 200→100, added `pro: 500`; `unlimited: null` kept for backward-compat with legacy subscribers; upgrade error messages updated
- **`js/config.js`** — `premium.tiers` restructured: `free` renamed to `Basic` with 5 AI gen, `premium` updated to $12.99/100 gen, `pro` tier added at $29.99/500 gen, `enterprise` tier added with custom pricing; `stripe.paymentLinks` updated with `pro` key (replaces `unlimited`) and TODO comments for new Stripe URLs at new prices
- **`premium.html`** — Completely rewritten as a **4-tier pricing page** (Basic, Premium, Pro, Enterprise): responsive 4-column grid, Enterprise card with "Contact Us" mailto button (no Stripe redirect), updated feature comparison table with 4 tiers, updated FAQ with rollover/trial/educational discount questions; `PAYMENT_LINKS` uses `pro` key

### Notes
- Existing "unlimited" subscribers are NOT affected — `unlimited` key retained in `RATE_LIMITS` and `config.js` with `null` (unlimited) generation quota and `legacy` label
- New Stripe Payment Links must be created at $12.99/month (Premium) and $29.99/month (Pro) in the Stripe Dashboard; replace TODO URLs in `js/config.js` and `premium.html` before going live
- **`firebase-functions` SDK upgraded**: `^4.3.1` → `^5.1.0`; deprecated `runWith()` removed — secrets now passed as options to `.onCall(opts, handler)` / `.onRequest(opts, handler)`; affected functions: `generateQuiz`, `generateAdaptiveQuestion`, `stripeWebhook`
- **Orphan `us-central1` functions deleted** — 13 leftover functions from pre-Phase-3 deployment removed during this deploy
- **Deployment**: hosting `app.eb7cc2d9.js` + functions deployed 2026-02-28

---

## [3.1.0] - 2026-02-27 — Phase 3 Post-Deploy: UI Fixes & Live Presenter Stability

### Added
- **Live presenter chunk stubs** — `js/915.49413b2e638323945e38.js` (AuthModal), `js/889.809a4e3dd18bb1f977d5.js` (PremiumModal), `js/763.a199c2bc453ad46625c0.js` (PaymentService) created as pre-built webpack chunk stubs; copied to `dist/js/` via CopyPlugin; fixes `ChunkLoadError` on live presenter auth/premium flows
- **Firestore security rules** — `firestore.rules` created at project root; `firebase.json` updated with `"firestore": {"rules": "firestore.rules"}`:
  - `_health/check` readable by authenticated users (live presenter heartbeat)
  - `live_sessions` collection and all subcollections with appropriate read/write rules
  - `users/{uid}` owner-only access with explicit subcollection rules for `usage`, `quizHistory`, `subscription`
  - `generatedQuizzes` — owner read, Cloud Function write only
- **View Profile modal** — clicking "View Profile" in the user dropdown now opens an inline overlay showing avatar, display name, email, quiz count, and subscription tier
- **Quiz History modal** — clicking "Quiz History" opens an overlay listing last 20 completed quizzes (title, score, date) from localStorage/Firestore

### Fixed
- **View Profile / Quiz History links navigating to `/#`** — `auth-manager.js` was re-rendering the dropdown on auth state change, destroying event listeners set by `header.js`; listeners and modal functions now attached directly inside `_updateHeaderForSignedIn()` in `auth-manager.js`
- **Dark mode toggle having no visual effect** — `base.css` uses hardcoded hex values, not CSS custom properties; added explicit `body.dark-mode` style overrides in `theme.css` for backgrounds, text, cards, header, footer, and quiz UI elements
- **Footer overlapping quiz tabs** — removed `position: sticky; bottom: 0; z-index: 10` from footer's injected CSS; removed excess `margin-bottom: 200px–280px !important` workarounds on topic/category screens
- **Quizzes nav "Personality"/"Knowledge" links reloading the page** — added `id="personality-section"` and `id="knowledge-section"` to the respective sections in `ui-manager.js`; updated nav links to anchor hashes; added hash-scroll logic after topic screen renders
- **All `premium/index.html` links** corrected to `/premium.html` across `header.js`, `footer.js`, `auth-manager.js`, `ui-manager.js` (10+ occurrences)
- **`users/{uid}/subscription` Firestore rule** — subscription subcollection was not explicitly covered; added `match /subscription/{docId}` rule (read by owner only, write by Cloud Functions via Admin SDK)

### Changed
- **`auth-manager.js`** — Added `_showProfileModal()`, `_showHistoryModal()`, `_showInfoModal()` functions; click listeners for `view-profile-button` and `view-results-button` attached inside `_updateHeaderForSignedIn()`
- **`css/theme.css`** — Extended with ~40 lines of explicit `body.dark-mode` overrides
- **`js/components/footer.js`** — Removed sticky footer CSS; fixed Premium and nav links
- **`js/components/header.js`** — Fixed Premium links; Quizzes nav updated to anchor hashes
- **`js/modules/ui-manager.js`** — Added section IDs; hash-scroll on load; fixed Premium link
- **`webpack.config.js`** — Added CopyPlugin entries for three live-presenter chunk stubs

### Deployment
- Hosting: bundle `app.de7cb9b7.js`, deployed 2026-02-27
- Firestore rules: deployed with `firebase deploy --only firestore:rules`

---

## [3.0.0] - 2026-02-26 — Phase 3: Premium, Payments & AI Cloud Functions

### Added
- **Firebase Cloud Functions** — `functions/` directory with Node.js 18 runtime, region `europe-west2`
  - `generateQuiz` — AI quiz generation via Google Gemini 1.5 Flash; rate-limited per tier
  - `getUserUsageStats` — Returns monthly AI generation usage and tier limits
  - `getGeneratedQuiz` — Fetches a previously generated quiz by Firestore ID
  - `listUserQuizzes` — Lists all AI-generated quizzes for the authenticated user
  - `deleteGeneratedQuiz` — Deletes a generated quiz document from Firestore
  - `generateAdaptiveQuestion` — Generates a single follow-up question for live sessions
  - `stripeWebhook` — Stripe subscription lifecycle webhook (HTTP); handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- **Secrets management** — API keys stored in Google Cloud Secret Manager via `defineSecret`; zero secrets in frontend code
- **Firebase Functions SDK** — `firebase-functions-compat.js` added to `live-presenter.html`; fixes `"Firebase Functions service is required"` error preventing AI quiz modal from opening
- **Rate limiting tiers**: Free = 3 AI quiz generations/month; Premium = 200/month; Unlimited = unlimited
- **Stripe Payment Links** integration in `premium.html` — redirects with `client_reference_id={firebase_uid}` so webhook can link payment to user
- **Three-tier pricing page** (`premium.html` — complete rewrite): Free ($0), Premium ($9.99/mo), Unlimited ($19.99/mo) with feature comparison table and FAQ
- **Premium feature gating** in `quiz-engine.js` — `QuizProsPremium.requiresPremium(quizId)` checked before quiz loads; shows upgrade modal for free users
- **Upgrade modal** — `QuizProsPremium.showUpgradeModal()` displays a polished overlay with "View Premium Plans" CTA
- **Gated quiz IDs** — `career-deep-dive` and `emotional-intelligence` require paid subscription (configured in `config.js`)
- **Quiz history → Firestore** — `user-manager.js` writes `users/{uid}/quizHistory/{docId}` on every quiz completion for authenticated users; falls back silently if unauthenticated

### Changed
- **`js/modules/premium.js`** — Complete rewrite: real Payment Link redirect (with UID), `requiresPremium()`, `checkQuizAccess()`, `showUpgradeModal()` (replaces fake simulation); `showSignupModal()` kept as backward-compat wrapper
- **`js/config.js`** — Added `stripe` block (publishable key + Payment Link URL placeholders); updated `premium.tiers` to three tiers (free/premium/unlimited); added `premium.gatedQuizIds`
- **`firebase.json`** — Added `"functions": { "source": "functions", "runtime": "nodejs18" }` block
- **`js/modules/quiz-engine.js`** — Added premium gating check in `startQuiz()`; added quiz history save call in `showResults()`
- **`js/modules/user-manager.js`** — `saveQuizResult()` now also writes to Firestore (`_writeQuizHistoryToFirestore`)

### Removed
- **11 old auth scripts** (not loaded since Phase 1, now physically deleted):
  `js/firebase-auth-fix.js`, `js/auth-service-fix-v2.js`, `js/auth-service-fix.js`,
  `js/auth-fix.js`, `js/auth-persistence-fix.js`, `js/auth-button-fix.js`,
  `js/direct-auth-fix.js`, `js/modules/auth-service.js`, `js/modules/auth-ui.js`,
  `js/modules/auth-helper.js`, `js/components/auth-header-integration.js`

### Deployment
- Cloud Functions: `firebase deploy --only functions` (requires `firebase login --reauth` then secrets set)
- Hosting: `npm run build && firebase deploy --only hosting`
- Stripe webhook URL: `https://europe-west2-quizpros.cloudfunctions.net/stripeWebhook`

---

## [2.2.0] - 2026-02-26 — Phase 2B: Image Optimisation & Live Presenter

### Added
- **48 personality quiz result images** — Created with Ideogram AI; illustration style, 1:1 aspect ratio, placed in `assets/images/`
- **`live-presenter.html`** — Recovered from production and added to webpack CopyPlugin so it deploys correctly
- **`live-audience.html`** — Recovered from production and added to webpack CopyPlugin so it deploys correctly
- **`onerror` fallback** on personality result `<img>` tag — falls back to `default-personality.webp` if image missing
- **Two-column Strengths/Challenges layout** — CSS Grid added for personality result cards (`css/layout.css`)
- **Styled personality result bullet points** — Accent dot, proper spacing for Key Characteristics list

### Changed
- **All images converted to WebP** — 56 PNG/JPEG files in `assets/images/` and `assets/images/spirit-animals/` converted to WebP at 800×800px max, quality 85 using Python + Pillow. Total size reduced from 204 MB to 2.8 MB (99% savings).
- **All template JSON references updated** — 14 personality quiz templates + 2 premium quiz templates: `.jpg`/`.jpeg` → `.webp`
- **All JS references updated** — `question-bank.js`, `quiz-renderer.js`, `quiz-engine.js`, `config.js`, and 4 other JS files: `.jpeg`/`.jpg` → `.webp`
- **`live-presenter.html`** — Added `<style>#connection-status{top:105px!important}</style>` to prevent notification overlapping header buttons

### Fixed
- `live-presenter.html` and `live-audience.html` returning main app (SPA rewrite intercept) — fixed by adding both to webpack CopyPlugin
- Personality quiz result images not loading — 48 images added and all path references corrected to `.webp`

---

## [2.1.0] - 2026-02-25 — Phase 2: Build Pipeline & SEO

### Added
- **webpack build system** — `webpack.config.js`, `src/app-entry.js`, `src/index.template.html`
  - Bundles 25+ scripts → `dist/js/app.[hash].js`
  - Bundles 9 CSS files → `dist/css/app.[hash].css`
  - CopyPlugin copies `assets/`, `templates/`, `fonts/`, all HTML pages, pre-built live bundles
- **`sitemap.xml`** — SEO sitemap listing all main pages and quiz topic URLs
- **`robots.txt`** — Allows all bots, references sitemap
- **npm scripts**: `npm run build`, `npm run build:dev`, `npm start`, `npm run deploy`, `npm run serve`

### Changed
- **`firebase.json`** — `"public": "."` → `"public": "dist"`. Added SPA rewrite and enhanced cache headers (JS/CSS `immutable`, images 30-day)
- **`index.html` / `src/index.template.html`** — Added `<meta name="description">`, Open Graph tags, Twitter Card tags, JSON-LD structured data. Title updated to "iQuizPros - Free Online Quizzes & Personality Tests"
- **`styles.css`** — Changed `url('assets/...')` to `url('/assets/...')` (absolute path required for webpack CSS bundling)

---

## [Unreleased] — Phase 1 Refactoring (2026-02-25)

### Added
- **`js/modules/auth-manager.js`** — Unified auth module (~709 lines) replacing 10 separate auth scripts. Exposes `window.QuizProsAuthManager` with backward-compat facades for `QuizProsAuth`, `QuizProsAuthUI`, `QuizProsHeaderAuth`, and legacy globals (`forceShowSignInModal`, `createEmergencySignInModal`, etc.).
- **`js/modules/question-bank.js`** — Static data extracted from topics.js. Owns all question arrays and default personality types. Exposes `window.QuizProsQuestionBank`.
- **`js/components/mobile-menu.js`** — Mobile hamburger menu logic extracted from header.js. Exposes `window.QuizProsMobileMenu`.
- **`js/modules/quiz-timer.js`** — Loading-fallback timer utility extracted from quiz-engine.js. Exposes `window.QuizProsTimer`.
- **`js/modules/quiz-scoring.js`** — Pure scoring functions extracted from quiz-engine.js. Exposes `window.QuizProsScoring` (`getDominantType`, `getScoreMessage`).
- **`js/modules/quiz-renderer.js`** — Pure HTML-generation functions extracted from quiz-engine.js. Exposes `window.QuizProsRenderer` (`renderQuestion`, `renderZodiacQuestion`, `renderPersonalityResult`, `renderScoreResult`, `createFallbackTemplate`).

### Changed
- **`js/modules/topics.js`** — Refactored from 1,069-line monolith to ~160-line thin facade. Static data delegated to question-bank.js; mutable state and public API unchanged.
- **`js/modules/quiz-engine.js`** — `showQuestion`, `showZodiacQuestion`, and `showResults` now delegate HTML generation to quiz-renderer.js (with graceful fallbacks). `addLoadingFallbackTimer` delegates to quiz-timer.js. `window.createFallbackTemplate` moved to quiz-renderer.js with backward-compat guard.
- **`js/components/header.js`** — Mobile menu setup delegated to mobile-menu.js. Duplicate auth event listeners (already handled by auth-manager.js) removed.
- **`index.html`** — Replaced 9 auth `<script>` tags with single `js/modules/auth-manager.js`. Added `<script>` tags for new modules (question-bank, mobile-menu, quiz-timer, quiz-scoring, quiz-renderer) in correct dependency order.

### Fixed
- **Broken image path** — `assets/images/zodiac/zodiac-banner.jpg` corrected to `zodiac-banner.webp` in both quiz-renderer.js and quiz-engine.js (fallback template). The `.jpg` file does not exist; the `.webp` version does.

---

## [2.0.0] - 2025-10-26 (Current Live Release)

### Added
- **Live Presentation System** — Mentimeter-style live quiz sessions
  - Presenter view (`live-presenter.js`) for hosting real-time sessions
  - Audience view (`live-audience.js`) for participant interaction
  - Firebase Realtime Database integration for instant sync
  - Webpack bundled modules for optimized delivery
- **Stripe Payment Integration** — Premium subscription billing
- **Firebase Realtime Database** — Added for live session data
- **Quiz Detail Page** — New `quiz-detail.css` for enhanced quiz views
- **Expanded Topic System** — topics.js grew from 664 to 1,069 lines
  - New quiz categories: Visual Personality Tests, Image Quizzes
  - Additional personality quiz templates across 6 categories
- **Enhanced Results Display** — New `final-result` section with score badges
- **Emergency CSS Fallbacks** — Inline emergency styles if CSS fails to load
- **Emergency Icon Fallbacks** — Font Awesome fallback with emoji replacements
- **Footer Initialization** — Dynamic footer via QuizProsFooter module

### Changed
- **Content Security Policy** — Updated to use wildcard `firebase*.googleapis.com`
- **Firebase SDK** — Removed storage and analytics compat, added database compat
- **index.html** — Minified/optimized HTML structure for production
- **Quiz Engine** — Minor refinements (55.5KB vs 55.3KB)
- **Header Component** — Updated navigation and auth state display (66 changes)
- **Direct Auth Fix** — Enhanced auth modal handling (43 changes)

### Removed
- `firebase-storage-compat.js` — No longer loaded in production
- `firebase-analytics-compat.js` — No longer loaded in production
- `auth-modals-container` div — Auth handled differently

### Deployment
- 4 rapid deploys on Oct 26, 2025 (commits: 78ebfd → fb2330 → db36a7 → 49017d)
- Deployed by: ceo@stargeneral.co.uk
- Custom domain: iquizpro.com (Connected)
- Firebase domains: quizpros.web.app, quizpros.firebaseapp.com

---

## [1.5.0] - 2025-10-14

### Added
- **Zodiac Sign Quiz** — Full visual zodiac quiz with 120+ webp images
- **Spirit Animal Quiz** — Image-based personality quiz with 10 animals
- **Image Quiz Category** — New "Visual Personality Tests" category
- **Auth Service Fix v2** — GoogleAuthProvider initialization fix
- **CSP Updates** — Expanded Content Security Policy for Firebase services

### Changed
- **topics.js** — Added image quiz categories and templates
- **quiz-engine.js** — Support for image-based question types
- **index.html** — Added auth-service-fix-v2.js script

---

## [1.4.0] - 2025-10-12

### Added
- **Cookie Consent System** — GDPR-compliant cookie management
- **Audio Feedback** — Correct/wrong answer sound effects
- **Social Sharing** — WhatsApp, Facebook, Twitter, Instagram sharing
- **Personality Quiz Templates** — 14 quiz templates across 6 categories:
  - Self-Discovery: Historical Era, TV Character
  - Professional: Career Path, Leadership, Decision Making
  - Relationships: Communication Language, Friendship Style
  - Learning: Learning Style, Creative Thinking, Artist Process
  - Lifestyle: City Personality
  - Image: Spirit Animal, Zodiac Sign

### Changed
- **Premium Module** — Stripe integration preparation
- **Analytics Module** — Enhanced event tracking categories

---

## [1.3.0] - 2025-04-02

### Added
- **Authentication System** — Full Firebase auth implementation
  - Email/password sign-in and sign-up
  - Google sign-in support
  - Auth state persistence
  - Auth modal UI components
- **Auth Fix Scripts** — Series of targeted fixes:
  - `firebase-auth-fix.js` — Firebase initialization order
  - `auth-fix.js` — Auth state management
  - `auth-persistence-fix.js` — Session persistence
  - `auth-button-fix.js` — UI button event binding
  - `direct-auth-fix.js` — Direct modal invocation
- **Premium Subscription** — Basic ($4.99) and Plus ($9.99) tiers
- **Premium Dashboard** — User analytics and quiz history
- **User Manager** — Profile and premium status tracking

---

## [1.0.0] - 2025-03-XX (Initial Release)

### Added
- Core quiz engine with question progression and scoring
- Topic selection screen with category tabs
- Knowledge quiz support (General Knowledge, Science, History, Geography, Uganda, Entertainment)
- Basic personality quiz framework
- Results display with score calculation
- WhatsApp share-to-unlock results mechanism
- Mobile-responsive design
- Google Analytics integration
- Feature flag system
- LocalStorage for quiz state persistence
- Firebase Hosting deployment
- Custom domain setup (iquizpro.com)
