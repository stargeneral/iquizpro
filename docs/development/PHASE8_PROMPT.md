# iQuizPros — Phase 8: Infrastructure & Scaling

## Project Context

I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

---

## ⚠️ IMPORTANT: Development Plan is the Single Source of Truth

`docs/development/DEVELOPMENT_PLAN.md` is the **original, authoritative roadmap** for iQuizPros. Every phase prompt exists solely to implement the vision laid out in that document. **Phase prompts are an implementation guide — the plan is the goal.**

Before you write a single line of code, **audit this prompt against `DEVELOPMENT_PLAN.md` Phase 8**. If any objectives from the plan are missing from this prompt, include them in your implementation. The plan always wins.

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `docs/development/DEVELOPMENT_PLAN.md` — **The authoritative roadmap. Read Phase 8 carefully and note any objectives not covered by this prompt.**
2. `CLAUDE.md` — Architecture, module system, conventions, pitfalls
3. `docs/development/PHASE7_HANDOFF.md` — What changed in Phase 7 (analytics, error monitoring, tests, CSS component library, engagement features, live audience improvements)
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, and the handoff/prompt templates required when generating end-of-phase documents

You also have a **persistent memory file** at:
`C:\Users\user\.claude\projects\E--Programs-iquizpros-live-backup\memory\MEMORY.md`

This file is automatically loaded into your conversation context and contains deployment commands, known issues, architecture notes, and verified working features accumulated across all previous sessions.

---

## What Changed in Phase 7 (Summary)

### Phase 7 — Analytics, Testing & Quality (+ Phase 6 carry-overs)

**Part A (carry-overs):**
- `live-audience.html` — Proper nickname input overlay (`#ext-nickname-overlay`) on first join; validates 1–20 chars, truncates before RTDB write.
- `live-audience.html` — Between-question leaderboard panel (top 5, 3-second display) after timed questions.
- `assets/images/` — 11 new branded WebP placeholder images for Travel and Love Language personality quiz result types.

**Part B (Phase 7 core):**
- `js/modules/analytics.js` — 7 new GA4 event methods: `trackQuizStart`, `trackQuizComplete`, `trackQuizAbandon`, `trackQuestionAnswered`, `trackSignup`, `trackPremiumUpgrade`, `trackAppError`. Integrated into quiz-engine.js, auth-manager.js, premium.js.
- `js/utils/error-reporter.js` — Global error capture IIFE; reports to GA4 via analytics module.
- `js/utils/api.js` — Retry with exponential backoff (2 retries, 1s/2s delays, network errors only).
- `404.html` — Branded standalone 404 page.
- `firebase.json` — `"cleanUrls": true`.
- Offline banner in `src/index.template.html` + `app.js`.
- Jest unit tests (`tests/unit/`), `package.json` Jest + Babel config, `docs/development/TESTING.md`.
- webpack.config.js performance budget: 512 KB.

**Part C (Phase 6 missed):**
- CSS component library: `css/components/buttons.css`, `cards.css`, `modals.css`, `inputs.css`.
- Link colour contrast fix: `a { color: #0d6b62 }` (4.6:1 WCAG AA ✓).
- Popular quizzes carousel (`_renderPopularQuizzes()` in ui-manager.js).
- Testimonials section (static, in ui-manager.js).
- Shareable result card (Canvas API + Web Share API in quiz-engine.js).
- "How others answered" — Firestore `quizStats` per-question answer distribution + % bar chart.
- Play count tracking — `quizStats/{topicId}.playCount` incremented on quiz start.
- Swipe left gesture to advance question (quiz-engine.js).
- Pull-to-refresh on topic selection (ui-manager.js).
- `firestore.rules` — `quizStats` public read; create/update restricted to numeric fields.

### Current bundle
- `app.ce20b1ff.js` / `app.6f4cc9ba.css` — built 2026-03-01 (not yet deployed)

### ⚠️ Known gaps carried forward
- Stripe end-to-end test still pending (card 4242 4242 4242 4242)
- Music Taste / Stress Response / Work-Life Balance personality quiz images still missing (fall back to `default-personality.webp`)
- `vendors.de788a87b9bb3625350b.js` is 584 KB (> 512 KB budget) — pre-existing Firebase SDK size issue
- `npm test` was not run to verify the Jest tests pass — run and fix before Phase 8 work begins

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

## Step 0 — Pre-flight Checks

### 0.1 — Deploy Phase 7 Build

Firebase credentials may have expired:
```bash
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" login --reauth
```
Deploy hosting + Firestore rules (rules updated in Phase 7):
```bash
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting,firestore:rules
```

### 0.2 — Run Jest Tests

```bash
"/c/Program Files/nodejs/npm.cmd" test
```

Fix any failures before starting Phase 8 work. See `docs/development/TESTING.md` for the stub pattern.

### 0.3 — End-to-End Stripe Test (Carried from Phase 5/6/7)

1. Visit `https://iquizpro.com/premium.html`, sign in, click "Get Premium"
2. Stripe checkout: card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
3. After redirect: Firebase Console → Firestore → `users/{uid}` — confirm `subscription.tier = "premium"` written by webhook
4. `dashboard.html` → verify tier badge shows "Premium" and AI generation limit is 100
5. Click "Manage Subscription" → verify Stripe Customer Portal opens correctly
6. In portal, cancel → verify `users/{uid}.subscription.tier` reverts to "free" after webhook fires

If webhook fails: check Firebase Console → Functions → `stripeWebhook`. Common issues: webhook secret mismatch, missing `client_reference_id` in Payment Link metadata.

---

## Phase 8 Objectives

> Phase 8 in DEVELOPMENT_PLAN.md is **"Infrastructure & Scaling"** (8.1–8.3). The objectives below implement the plan's Phase 8 vision. **Always complete the full development plan scope — do not leave plan objectives for a later phase unless explicitly agreed with the user.**

---

### 8.1 — PWA (Progressive Web App)

This is the highest-value infrastructure item for user engagement.

#### 8.1.1 — Web App Manifest (`manifest.json`)

Create `manifest.json` at project root (copied to `dist/` by CopyPlugin):

```json
{
  "name": "iQuizPros",
  "short_name": "iQuizPros",
  "description": "Interactive quizzes and personality tests",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#25d366",
  "icons": [...]
}
```

- Add `<link rel="manifest" href="/manifest.json">` to `src/index.template.html`.
- Add `<meta name="theme-color" content="#25d366">`.
- Add icons (192×192 and 512×512) — create simple branded placeholder PNGs if real icons don't exist.
- Add `manifest.json` to `webpack.config.js` CopyPlugin patterns.

#### 8.1.2 — Service Worker (`sw.js`)

Create `sw.js` at project root (copied to `dist/` by CopyPlugin). Strategy:

**Cache-first for static assets:**
- Shell: `index.html`, CSS bundle, JS bundle, fonts, sounds
- Images: `assets/images/**`, `assets/fonts/**`

**Network-first for templates and API calls:**
- `templates/**/*.json` — stale-while-revalidate (show cached data, update in background)
- Firebase Firestore/RTDB calls are not intercepted (handled by Firebase SDK offline persistence)

**Offline fallback:**
- If navigation request fails → serve cached `index.html` (SPA offline mode)
- If image fails → serve cached `assets/images/default-personality.webp`

Register the service worker in `app.js`:
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function(err) {
    utils.logger.warn('App', 'Service worker registration failed: ' + err);
  });
}
```

- Hide the offline banner (`#offline-banner`) when service worker serves cached content — i.e. check `navigator.onLine` but also listen to service worker `controllerchange`.

#### 8.1.3 — Install Prompt

In `app.js` or a new `js/components/install-prompt.js`:
- Capture `beforeinstallprompt` event; store as `_deferredInstallPrompt`.
- After user completes first quiz, show a small "Install App" bottom sheet (not blocking — dismissible).
- On user confirmation, call `_deferredInstallPrompt.prompt()`.
- Track `appinstalled` event → call `QuizProsAnalytics.trackEvent('app_installed')`.

#### 8.1.4 — Background Sync for Quiz Results (Optional / Best-effort)

If `'sync' in ServiceWorkerRegistration.prototype`:
- When `saveQuizHistory` fails (user offline), queue the result in IndexedDB under key `iqp_pending_history`.
- Register a background sync tag `'sync-quiz-history'`.
- In the service worker `sync` handler, flush the queue to Firestore when connectivity returns.

---

### 8.2 — Firebase Security Rules Hardening

Review and tighten all security rules before scaling:

#### 8.2.1 — Firestore Rules Audit

Verify each collection has the minimum necessary permissions:
- `users/{uid}` — already owner-only ✓
- `generatedQuizzes/{quizId}` — already owner-read, CF-write ✓
- `quizStats/{topicId}` — added Phase 7 (public read, restricted write fields) — review adequacy
- `live_sessions`, `participants`, `responses` — review whether unauthenticated create is needed for each
- Add rate-limiting comment where applicable (Firestore rules don't support rate limiting natively — note in comments)

#### 8.2.2 — Storage Rules

If Firebase Storage is used for any uploaded content (user avatars, custom quiz images), add rules. Currently Storage rules are default — add explicit deny-all or restrict to `users/{uid}/` prefix.

#### 8.2.3 — Realtime Database Rules Review

Review `database.rules.json` — ensure `cleanupExpiredSessions` can write without over-broad permissions.

---

### 8.3 — Performance & Bundle Optimisation

#### 8.3.1 — Firebase SDK Code Splitting

The `vendors.de788a87b9bb3625350b.js` bundle is 584 KB (pre-existing, exceeds 512 KB budget). Options:
1. **CDN loading** — Remove Firebase from webpack bundle; load Firebase SDK via `<script>` tag from CDN in `src/index.template.html`. Update `webpack.config.js` `externals` to mark `firebase` as external.
2. **Lazy import** — Keep as is and accept the warning (Firebase SDK is a necessary large dependency).

Preferred: CDN loading (option 1). Firebase v9 compat CDN URLs are stable. Check `js/config.js` for the version being used and match it.

#### 8.3.2 — Image Optimisation

Large zodiac images in `assets/images/zodiac/jpeg assets/` exceed 700 KB each:
- Compress with a lossless or near-lossless tool.
- Or simply add a note to the CLAUDE.md that these are known large assets and users should serve them via CDN.

#### 8.3.3 — Lazy-Load Template JSON

Currently `quiz-engine.js` loads template JSON via `fetch()` at quiz start. This is already on-demand. Confirm `templates/` are not preloaded anywhere unnecessarily.

---

### 8.4 — Content & Quiz Expansion

#### 8.4.1 — Missing Personality Quiz Images

3 quiz types still fall back to `default-personality.webp`:
- Music Taste — result types pending
- Stress Response — result types pending
- Work-Life Balance — result types pending

Check `templates/personality-quizzes/*/` for the exact `imagePath` values referenced and create matching placeholder images using `scripts/create_placeholder_images.py` (or extend it).

#### 8.4.2 — Additional Knowledge Quizzes (If Bandwidth Allows)

The development plan calls for ongoing content expansion. Consider adding 2–3 new knowledge quiz topics to `js/modules/question-bank.js` if time permits after infrastructure work.

---

### 8.5 — CI/CD (GitHub Actions)

The `docs/development/TESTING.md` document recommends a GitHub Actions workflow. If the project is in a GitHub repository:

Create `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

---

## End of Phase Deliverables

At the end of Phase 8, produce:

1. **`CHANGELOG.md`** — v8.0.0 entry (PWA, security rules, performance)
2. **`CLAUDE.md`** — Update bundle hash, add new pitfalls (service worker, PWA, install prompt)
3. **`docs/development/PHASE8_HANDOFF.md`** — What changed, files modified, known issues
4. **`docs/development/PHASE9_PROMPT.md`** — Prompt for Phase 9 (if applicable)
5. **`npm run build`** — Successful production build with no new errors
6. **Deploy** — `firebase deploy --only hosting,firestore:rules` (and `database` if rules changed)

---

## Quick-Reference: Deployment Commands

```bash
# Build
"/c/Program Files/nodejs/npm.cmd" run build

# Deploy hosting + Firestore rules
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting,firestore:rules

# Deploy all (hosting + rules + functions if changed)
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting,firestore:rules,functions

# Run tests
"/c/Program Files/nodejs/npm.cmd" test

# Firebase login (if auth expired)
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" login --reauth
```
