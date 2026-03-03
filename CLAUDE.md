# CLAUDE.md — AI Assistant Context for iQuizPros

This file provides context for Claude (or any AI assistant) when working on the iQuizPros codebase.

---

## Project Overview

iQuizPros is a static frontend quiz platform hosted on Firebase Hosting. It uses vanilla JavaScript with the IIFE module pattern (no React/Vue/Angular). The backend is entirely Firebase services accessed client-side. The site is live at https://iquizpro.com and https://quizpros.web.app.

## Critical Context

### Build system (Phase 2+)
The main application is now webpack-bundled. Run `npm run build` to generate `dist/`, then deploy `dist/` via Firebase Hosting. Do NOT deploy from the root directory — `firebase.json` points to `dist/`.
- Entry: `src/app-entry.js` → `dist/js/app.[hash].js` + `dist/css/app.[hash].css`
- HTML template: `src/index.template.html` → `dist/index.html`
- Static assets (images, templates, fonts, HTML pages) copied to `dist/` via CopyPlugin
- Current production bundle: `app.59cbbb09.js` / `app.6f4cc9ba.css` (built 2026-03-01, Phase 8: PWA service worker, manifest, install prompt, security rules hardening)

### Module system
All modules use `window.QuizProsXxx = (function() { ... })()` IIFE pattern. They communicate through the global `window` object. Loading ORDER in index.html is critical — changing it will break dependencies.

### Authentication (Phase 1+)
Consolidated into a single module: `js/modules/auth-manager.js` (`QuizProsAuthManager`). The 10 old auth scripts were **permanently deleted in Phase 3**. Backward-compat aliases: `window.QuizProsAuth`, `window.QuizProsAuthUI`, `window.QuizProsHeaderAuth`.

### Firebase Project Details
- Project ID: `quizpros`
- Auth Domain: `quizpros.firebaseapp.com`
- Firebase SDK: v9.20.0 compat (upgraded for Functions support)
- Services used: Auth, Firestore, Realtime Database, Cloud Functions, Cloud Secret Manager
- Hosting: Firebase Hosting with custom domain iquizpro.com
- Analytics: GA4 (G-0QZSJ62FJV)
- Cloud Functions region: `europe-west2` (London)
- Functions runtime: Node.js 20

### Cloud Functions (Phase 3+)
Server-side code lives in `functions/` — entirely separate from the frontend IIFE modules.

```
functions/
  index.js          ← All exports (Node.js CommonJS, NOT IIFE pattern)
  package.json      ← firebase-admin 11.8, firebase-functions 5.1, @google/generative-ai 0.19, stripe 14 (Node.js 20)
  .gitignore        ← excludes node_modules
  node_modules/     ← 292 packages (not committed)
```

**Exported functions:**
| Function | Type | Secrets |
|---|---|---|
| `generateQuiz` | callable | GEMINI_KEY |
| `getUserUsageStats` | callable | — |
| `getGeneratedQuiz` | callable | — |
| `listUserQuizzes` | callable | — |
| `deleteGeneratedQuiz` | callable | — |
| `generateAdaptiveQuestion` | callable | GEMINI_KEY |
| `createPortalSession` | callable | STRIPE_SECRET |
| `cleanupExpiredSessions` | scheduled (daily) | — |
| `stripeWebhook` | HTTP (not callable) | STRIPE_SECRET, STRIPE_WEBHOOK_SECRET |

**Secrets** stored in Google Cloud Secret Manager (set via `firebase functions:secrets:set NAME`). Access via `defineSecret('NAME').value()` inside functions. Never use `functions.config()` — deprecated and removed March 2026.

**To deploy functions:**
```bash
firebase login --reauth   # if CLI auth has expired
firebase deploy --only functions
```

### New Firestore Collections (Phase 3+)
| Collection | Written by | Purpose |
|---|---|---|
| `generatedQuizzes/{docId}` | `generateQuiz` Cloud Function | AI-generated quiz storage |
| `users/{uid}/usage/{YYYY-MM}` | `generateQuiz` Cloud Function | Monthly AI generation counter |
| `users/{uid}/subscription` | `stripeWebhook` Cloud Function | Stripe tier + customer/subscription IDs |
| `users/{uid}/quizHistory/{docId}` | `user-manager.js` frontend | Quiz completion history |

### Deployment
```bash
npm run build                                    # generate dist/
firebase deploy --only hosting                   # deploy dist/ to production
firebase deploy --only hosting,firestore:rules   # deploy hosting + Firestore rules
firebase deploy --only hosting,firestore:rules,database   # + RTDB rules
firebase deploy --only storage                   # deploy Storage rules (once Storage initialised)
# or combined:
npm run deploy

# Preview channel (for testing before prod):
firebase hosting:channel:deploy phase3-test
```
`firebase.json` public dir = `dist/`. Always build before deploying.

### PWA / Service Worker (Phase 8+)
- `sw.js` — service worker at project root; copied to `dist/` by CopyPlugin
- `manifest.json` — web app manifest at project root; copied to `dist/` by CopyPlugin
- `assets/icons/icon-192.png` / `icon-512.png` — app icons (branded placeholders)
- Cache version in `sw.js`: `CACHE_VERSION = 'v8.0'` — bump when cache invalidation is needed
- `firebase.json` includes `sw.js` no-cache header + `Service-Worker-Allowed: /`
- Storage rules (`storage.rules`) created but NOT yet deployed — Firebase Storage not initialised on project

## Key Files to Understand

| File | Purpose | Size |
|------|---------|------|
| `index.html` | Single entry point, loads all scripts | ~15KB |
| `app.js` | Core app initialization, quiz flow, retake URL handler (Phase 5) | 19.3KB |
| `js/config.js` | All configuration, Firebase creds, Stripe keys, feature flags | 7KB |
| `js/modules/quiz-engine.js` | Quiz state machine, scoring, progression; `startGeneratedQuiz()` (Phase 5) | ~45KB |
| `js/modules/topics.js` | Thin facade — delegates to question-bank.js | ~5KB (refactored) |
| `js/modules/question-bank.js` | All static quiz questions and personality types | ~12KB |
| `js/modules/quiz-renderer.js` | Pure HTML-generation for questions and results | ~8KB |
| `js/modules/quiz-scoring.js` | Pure scoring utils: getDominantType, getScoreMessage | ~2KB |
| `js/utils/error-reporter.js` | Global error/rejection capture, log, forward to analytics | ~2KB (NEW Phase 7) |
| `js/modules/quiz-timer.js` | Loading-fallback timer utility | ~1KB |
| `js/modules/auth-manager.js` | Unified auth — replaces 10 old auth scripts | ~25KB |
| `js/modules/premium.js` | Stripe Payment Links, tier gating, upgrade modal | ~15KB (REWRITTEN Phase 3) |
| `js/modules/user-manager.js` | User profile, quiz history → Firestore | ~10KB |
| `js/components/header.js` | Navigation, auth state, delegates mobile menu | ~20KB (reduced) |
| `js/components/mobile-menu.js` | Hamburger menu toggle and overlay | ~2KB |
| `functions/index.js` | All Cloud Functions — AI quiz generation, Stripe, portal, cleanup | ~480 lines |
| `premium.html` | 4-tier pricing page with Stripe Payment Link buttons | standalone HTML |
| `dashboard.html` | User dashboard — quiz history, AI library, subscription management | standalone HTML |
| `database.rules.json` | Realtime Database security rules for live presenter sessions | NEW Phase 4 |
| `live-presenter.html` | Live presenter page + Phase 5 extension (question type panel, timer, createdAt patch) | ~10KB |
| `live-audience.html` | Live audience page + Phase 5 extension (word cloud, rating, true/false, timer overlay) | ~16KB |
| `assets/images/*.webp` | All personality/quiz images — WebP, max 800×800px | 2.8MB total |

## Module Dependency Graph

```
QuizProsConfig (config.js)
  └── QuizProsUtils (utils/utils.js)
       ├── QuizProsStorage (utils/storage.js)
       ├── QuizProsAPI (utils/api.js)
       ├── QuizProsFeatureFlags (utils/feature-flags.js)
       └── QuizProsAudio (utils/audio.js)
            ├── QuizProsMobileMenu (components/mobile-menu.js)   ← NEW
            ├── QuizProsHeader (components/header.js)
            ├── QuizProsFooter (components/footer.js)
            ├── QuizProsQuestionBank (modules/question-bank.js)  ← NEW
            ├── QuizProsTopics (modules/topics.js) → delegates to QuizProsQuestionBank
            ├── QuizProsTimer (modules/quiz-timer.js)            ← NEW
            ├── QuizProsScoring (modules/quiz-scoring.js)        ← NEW
            ├── QuizProsRenderer (modules/quiz-renderer.js)      ← NEW
            ├── QuizProsEngine (modules/quiz-engine.js)
            ├── QuizProsAnalytics (modules/analytics.js)
            ├── QuizProsPremium (modules/premium.js)
            ├── QuizProsUserManager (modules/user-manager.js)
            ├── QuizProsUI (modules/ui-manager.js)
            └── QuizProsAuthManager (modules/auth-manager.js)    ← NEW (replaces 10 auth scripts)
                 ├── window.QuizProsAuth (backward-compat alias)
                 ├── window.QuizProsAuthUI (backward-compat alias)
                 └── window.QuizProsHeaderAuth (backward-compat alias)
```

## Brand Colours (Mandatory — Do Not Change)

The iQuizPros brand colour is the **green from the logo**. Every page — main app, `premium.html`, `dashboard.html`, any future standalone pages — must use these values and **never** use a different primary colour scheme.

| Role | Hex | Usage |
|------|-----|-------|
| **Primary brand green** | `#25d366` | Logo text, buttons, links, nav highlights, selected states, card headings |
| **Dark green (hover/gradient end)** | `#128c7e` | Hover states, gradient second stop, button pressed states |
| **Light green (tint)** | `#3ed664` | Soft backgrounds, disabled states (`--primary-light`) |

**Gradient pattern** (headers, hero sections, primary buttons):
```css
background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
```

**CSS variables** (defined in `css/theme.css` — use these in new CSS where possible):
```css
--primary-color: #25d366;
--primary-dark:  #128c7e;
--primary-light: #3ed664;
```

**Do NOT use** any of these removed colours — all were eliminated in the 2026-02-28 colour audit. Replace any that appear in the codebase:

| Removed colour | Was used for |
|----------------|-------------|
| `#667eea` | Old primary accent (purple-blue) |
| `#764ba2` | Old gradient dark end (purple) |
| `#7d5ba6` | Personality quiz accents |
| `#5d4580` | Personality quiz dark variant |
| `#9b59b6` | Category icon colour (Self-Discovery) |
| `#6a4a91` | Button hover state (dark purple) |

**Intentionally different colours** (not brand colours — leave them alone):
- Quiz-specific themes: Career=blue (`#3498db`), Relationship=red (`#e74c3c`), Zodiac=dark-blue — these are *thematic*, not branding
- Premium tier indicator: gold (`#ffc107`) — intentional upsell distinction
- Toast colours: success green (`#28a745`), error red (`#c62828`), info blue (`#1565c0`) — semantic, not brand
- Enterprise button: dark slate (`#2c3e50`) — intentional neutral CTA

## Code Conventions

- **No framework** — Pure vanilla JS, no build required for main app
- **IIFE modules** — `window.QuizProsXxx = (function() { return { ... }; })();`
- **DOM manipulation** — Direct `document.querySelector`, `innerHTML`, etc.
- **Event handling** — `addEventListener` on DOM elements
- **Logging** — `utils.logger.info/debug/warn/error()` throughout
- **Error handling** — Try/catch with logger, user-facing toast notifications
- **CSS** — Separate files per concern (base, theme, layout, components)
- **No TypeScript** — All plain JavaScript

## Common Pitfalls — Colour
19. **Never use purple `#667eea` / `#764ba2`** — these were the original accent colours used by mistake in standalone pages; they were replaced in the 2026-02-28 colour audit. The brand green is `#25d366`.
20. **Standalone pages have their own inline `<style>` blocks** — `premium.html` and `dashboard.html` do NOT load the webpack CSS bundle. Any colour fixes must be made directly in their `<style>` blocks, then rebuilt with `npm run build` (CopyPlugin copies the files into `dist/`).

## Common Pitfalls

1. **Script order matters** — Moving a `<script>` tag in index.html can break everything
2. **Firebase compat mode** — Uses v9 compat API (`firebase.auth()` not modular `getAuth()`)
3. **Auth is now one file** — All auth changes go in `js/modules/auth-manager.js`. The old 10 auth scripts were permanently deleted from disk in Phase 3.
4. **Webpack bundles are minified** — live-presenter/audience are single-line minified; source is in the old `src/` directory
5. **CSP restrictions** — Content Security Policy in index.html `<meta>` tag restricts external resources
6. **Feature flags** — Some features are flagged off in config.js (darkMode, newQuizLayout, etc.)
7. **Templates are JSON** — Quiz content in `templates/` is loaded at runtime via fetch
8. **quiz-engine.js delegates to sub-modules** — HTML generation goes through `window.QuizProsRenderer`; scoring through `window.QuizProsScoring`. Both have graceful fallbacks if sub-modules fail to load.
9. **topics.js is a thin facade** — Static question data lives in question-bank.js. topics.js only owns mutable runtime state (topics[], quizTemplates{}).

## Testing Approach

- Test locally with `firebase serve` or `npx serve .`
- Check browser console for errors (all modules log extensively)
- Test on mobile — many past bugs were mobile-specific (footer overlap, touch events)
- Verify auth flows: guest → signup → login → premium
- Test all quiz topics load correctly
- Verify social sharing generates correct links

## Known Pitfalls (Phase 3+)

10. **auth-manager.js re-renders the dropdown** — `_updateHeaderForSignedIn()` calls `bodyEl.innerHTML = ...` which destroys any previously attached event listeners. All dropdown listeners (sign-out, profile, history) MUST be attached inside `_updateHeaderForSignedIn()` itself — not in `header.js`.
11. **base.css uses hardcoded hex colours** — Not CSS variables. Dark mode overrides must use explicit `body.dark-mode selector { ... }` rules in `theme.css`.
12. **premium.html is standalone** — Has its own inline Firebase init and `PAYMENT_LINKS` constant; does NOT read from `config.js`. Keep in sync manually if credentials or payment URLs change.
13. **Live presenter chunk IDs are fixed** — Chunks 915, 889, 763 are referenced by the minified `live-presenter` bundle by numeric ID. Do not change their filenames.
14. **`firebase-functions` v5 API** — `runWith()` was removed in v5. Secrets and options are passed as the first argument: `.onCall({ secrets: [MY_SECRET] }, handler)` and `.onRequest({ secrets: [MY_SECRET] }, handler)`. Never use the old `.runWith({}).https.onCall(handler)` pattern.
15. **Orphan `us-central1` functions** — All 13 orphan functions from pre-Phase-3 (`us-central1`) were deleted during the Phase 3.2 deploy. Do not re-add functions with those names unless intentionally re-implementing them in `europe-west2`.
16. **`dashboard.html` is standalone** — Like `premium.html`, it has its own inline Firebase init and calls `fns` (the `europe-west2` functions app handle) via `firebase.app().functions('europe-west2')`. Keep Firebase config in sync manually.
17. **Subscription stored as map field** — `stripeWebhook` writes to `users/{uid}` with a `subscription: { tier, stripeCustomerId, ... }` map field — NOT a subcollection. `createPortalSession` and `getUserTier()` both read from the same map field. The Firestore rules `match /subscription/{docId}` covers a subcollection that was planned but never used; the actual data is on the root user document.
18. **`cleanupExpiredSessions` requires `createdAt` field** — Sessions in Realtime Database must have a `createdAt` (unix ms) field set by the live presenter on session creation for cleanup to work. The Phase 5 extension script in `live-presenter.html` patches this by writing `createdAt: Date.now()` if absent.
19. **Live presenter extension layer (Phase 5+)** — New question types (word cloud, rating, true/false) and timer are handled by inline extension scripts in `live-presenter.html` and `live-audience.html`. These scripts are NOT part of the pre-built webpack bundles. Changes must be made directly in those HTML files; rebuild (`npm run build`) copies them to `dist/` via CopyPlugin.
20. **Audience extension session code discovery** — The audience extension reads `iqp_session_code` from `localStorage`. This key is set by the presenter extension when it detects the session code. If presenter and audience run in different browsers/devices, the audience extension falls back to querying the RTDB join URL or URL params.
21. **`startGeneratedQuiz` format conversion** — `getGeneratedQuiz` Cloud Function returns `correctIndex` (integer). The engine expects `answer` (integer). The `startGeneratedQuiz` function in `quiz-engine.js` converts `correctIndex → answer` internally; no caller needs to do this.
22. **Leaderboard requires `window._extPresenterSessionCode`** (Phase 6) — The presenter leaderboard overlay reads the session code from `window._extPresenterSessionCode`, which is set by the presenter extension when it detects the session code in the DOM. If that global is not yet set (session not started), the 🏆 button shows an alert and does nothing.
23. **RTDB participant nickname truncation** — ✅ Fixed in Phase 7. `live-audience.html` extension now truncates nickname to 20 chars before RTDB write and validates 1–20 chars in the overlay form.
24. **Retake confirmation modal XSS** — The `_escRetake()` helper in `app.js` escapes HTML in quiz title and topic before injecting into the modal. Never remove this escaping.
25. **`quizStats` Firestore writes are unauthenticated** (Phase 7) — Play count and per-question answer distribution are written by any visitor (including guests). Firestore rules allow `quizStats/{topicId}` create/update only for numeric fields matching `^q[0-9]+o[0-9]+$` or `playCount`/`updatedAt`. Reject any write that tries to set non-numeric or arbitrarily named fields.
26. **`_recordAndShowHowOthersAnswered` is fire-and-forget** (Phase 7) — Errors are silently swallowed. If Firestore is unavailable the "how others answered" panel simply doesn't appear; the quiz flow is unaffected.
27. **Canvas `roundRect` fallback** (Phase 7) — `_buildShareCanvas()` uses `ctx.roundRect` for the score badge background. Not all browsers support it; the code falls back to `ctx.fillRect` if absent.
28. **`QuizProsErrorReporter` loads before `QuizProsAnalytics`** (Phase 7) — `error-reporter.js` calls `window.QuizProsAnalytics.trackAppError` at report time (not at load time), so load order is fine. But if the error fires before `analytics.js` has run (very early in page load), the call is silently skipped.
29. **Auth submit handlers must have both `.then()` and `.catch()`** — `_handleSignInSubmit` and `_handleSignUpSubmit` in `auth-manager.js` must call `_closeAllModals()` in a `.then()` handler on the `signIn()`/`signUp()` promise. Without it, the modal stays open with a disabled "Signing in…" button until `onAuthStateChanged` fires — which can be several seconds on mobile, making sign-in appear frozen. `signIn()` must NOT re-call `setPersistence('local')` (already set in `initialize()`); doing so adds unnecessary latency before `signInWithEmailAndPassword`.
30. **Service Worker cache version must be bumped on breaking changes** (Phase 8) — `CACHE_VERSION = 'v8.0'` in `sw.js` controls all three cache names (`iqp-shell-`, `iqp-runtime-`, `iqp-templates-`). If you change cached shell assets or the SW strategy, bump the version so `activate` cleans old caches. Otherwise stale shell content will be served from the old cache.
31. **`sw.js` must NOT be aggressively cached** (Phase 8) — `firebase.json` includes a `sw.js` header rule with `Cache-Control: no-cache, no-store, must-revalidate` and `Service-Worker-Allowed: /`. This rule MUST appear BEFORE the `**/*.@(js|css)` catch-all in the headers array, or the year-long immutable cache will apply to the SW itself — preventing updates from reaching users.
32. **Storage rules NOT yet deployed** (Phase 8) — `storage.rules` (deny-all) exists at project root but Firebase Storage has not been initialised on the `quizpros` project. Deploy with `firebase deploy --only storage` after visiting Firebase Console → Storage → "Get Started".
33. **Install prompt dismissed flag** (Phase 8) — `_showInstallPromptSheet()` in `app.js` respects `localStorage('iqp_install_dismissed')`. Clearing this flag (e.g. in dev tools) will re-show the prompt on next quiz completion.

## What Needs Improvement

1. **End-to-end Stripe test pending** — Test card `4242 4242 4242 4242` to verify full checkout → webhook → Firestore subscription flow, then test `createPortalSession` opens Stripe Customer Portal correctly
15. **PWA icons are placeholders** (Phase 8) — `icon-192.png` / `icon-512.png` are brand-coloured placeholder images. Replace with proper iQuizPros logo icons when available (no code change needed — just overwrite the files and rebuild).
16. **Firebase Storage not initialised** (Phase 8) — `storage.rules` exists (deny-all) but cannot be deployed until Storage is activated in Firebase Console.
17. **Bundle size** (Phase 8.3 deferred) — `vendors.*.js` is 584 KB (Firebase SDK). Phase 8.3 (CDN loading / code splitting) was deferred by user agreement.
2. **Live presenter leaderboard** — ✅ Implemented in Phase 6. Real-time leaderboard overlay accessible from floating 🏆 button; reads `sessions/{code}/participants` score field.
3. **Audience session code (multi-device)** — Extension layer uses localStorage to pass session code from presenter to audience, which only works when both share the same browser/device. Multi-device audience join relies solely on the RTDB `currentSlide` listener and the session code in the join URL.
4. **Code organization** — `quiz-engine.js` still ~1,300 lines; could be further split
5. **Modern JS** — Could benefit from ES modules instead of IIFE + global window
6. **Testing** — ✅ Phase 7: Jest unit tests added for `quiz-scoring` and `analytics` modules. Run `npm test`. E2E tests still pending.
7. **Error handling** — ✅ Phase 7: `QuizProsErrorReporter` captures global errors and unhandled rejections, forwards to GA4. `api.js` retries network failures with exponential backoff.
8. **Accessibility** — ✅ Phase 6: ARIA added to topic grid (list/listitem roles), quiz question (aria-live, radiogroup, radio roles), and progress bar (progressbar role + aria-valuenow). Full keyboard nav and screen reader audit still pending.
9. **"Your Score: /"** — Personality quizzes show blank score (no numeric score, pre-existing)
10. **Personality quiz images** — ✅ Phase 7: 11 branded placeholder WebP images created for Travel and Love Language quizzes. Music Taste, Stress Response, Work-Life Balance quizzes may still fall back to `default-personality.webp`.
11. **Timed mode server-sync** — ✅ Implemented in Phase 6. Timer uses `firebase.database.ServerValue.TIMESTAMP` on presenter write; audience reads `.info/serverTimeOffset` to correct local clock drift.
12. **Progress saving for personality quizzes** — Currently disabled (personality state is complex/non-scored). Could be added if desired.
13. **Nickname prompt on audience join** — ✅ Phase 7: proper `#ext-nickname-overlay` shown on first join; truncates to 20 chars before RTDB write.
14. **Leaderboard on audience side** — ✅ Phase 7: between-question leaderboard showing top 5 participants after each timed question.

## Development Process

### Phase-Based Development
Development follows a structured phase system. See `docs/development/PROMPT_FRAMEWORK.md` for the full framework.

**Key rules:**
- Every phase ends with a handoff document (`PHASE_N_HANDOFF.md`) and a prompt for the next phase (`PHASE_N+1_PROMPT.md`)
- All handoff docs and prompts live in `docs/development/`
- Always read the most recent handoff document before starting work
- Never rename or remove a `window.QuizPros*` global without searching the entire codebase first
- When splitting a file, keep the original global name as a facade
- Update this file (CLAUDE.md) whenever architecture, module map, or conventions change

### Files in `docs/development/`
| File | Purpose |
|------|---------|
| `DEVELOPMENT_PLAN.md` | Full 8-phase roadmap |
| `PROMPT_FRAMEWORK.md` | Templates for prompts, handoffs, naming rules |
| `PHASE[N]_PROMPT.md` | Session start prompt for phase N |
| `PHASE[N]_HANDOFF.md` | What changed in phase N (created at end) |
| `download-*.ps1` | Scripts used to download the live site |
