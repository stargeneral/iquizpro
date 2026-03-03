# iQuizPros — Phase 11: Platform Polish & Live Session Improvements

## Project Context

I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, module system, conventions, all 33+ numbered pitfalls
2. `docs/development/PHASE10_HANDOFF.md` — What changed in Phase 10, files modified, known issues
3. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap; Phase 11 and Phase 12 sections for context
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, and the handoff/prompt templates required when generating end-of-phase documents

---

## What Changed in Phase 10 (Summary)

### 10.1 — Q&A Upvoting
- `live-audience.html`: 👍 button per question writes `+1` to RTDB `sessions/{code}/qa/{key}/votes/{voterId}` with per-user dedup
- `live-presenter.html`: Q&A list sorted by vote count descending; vote badge shown per question
- `database.rules.json`: `qa/{key}/voters/{uid}` write-once rule added

### 10.2 — Daily Challenge Leaderboard
- `js/modules/ui-manager.js`: After `completeDailyChallenge()`, top-10 Firestore `dailyLeaderboard/{today}/scores` rendered in `.daily-leaderboard-section` table; current user row highlighted
- `css/theme.css`: Daily leaderboard table styles + dark mode overrides
- `firestore.rules`: `dailyLeaderboard/{date}/scores/{uid}` — public read; owner create/update

### 10.3 — Session Archive & Dashboard History
- `live-presenter.html`: `setupArchiveButton()` writes `sessionArchive/{code}` to Firestore on session end (participantCount, totalSlides, completedAt)
- `dashboard.html`: "Past Live Sessions" card added; `renderPastSessions()` queries `sessionArchive` where `presenterId == uid`
- `firestore.rules`: `sessionArchive/{code}` — authenticated read; owner create/update/delete

### 10.4 — PDF Result Export
- `js/modules/quiz-engine.js`: `_loadScript()`, `_exportResultsPDF()`, `_injectPDFButton()` added; lazy CDN loads html2canvas 1.4.1 + jsPDF 2.5.1 from cdnjs
- `css/theme.css`: `#export-pdf-btn` styled as outlined green button

### 10.5 — Admin Analytics Dashboard
- `admin.html`: New standalone page; auth guard redirects non-admin to `/`; sections: site overview, quiz play counts, today's leaderboard, recent live sessions
- `js/config.js`: `admin.uid` field added
- `webpack.config.js`: CopyPlugin entry for `admin.html`

### 10.6 — Quiz Embed iframe Support
- `src/index.template.html`: Early inline script detects `?embed=1&quizId=<id>`, adds `body.embed-mode` before CSS renders
- `app.js`: Embed IIFE polls for `QuizProsEngine.startQuiz()` ready then auto-starts quiz
- `js/modules/quiz-engine.js`: `.embed-play-cta` link injected into results when embed mode active
- `css/theme.css`: `body.embed-mode` hides header, footer, bottom-nav, hero, daily challenge, leaderboard, category tabs

### 10.7 — E2E Tests (Playwright)
- `playwright.config.js`: New — Chromium only, `baseURL: http://localhost:5000`, reuses dev server, 1 worker
- `tests/e2e/quiz-flow.spec.js`, `personality-flow.spec.js`, `daily-challenge.spec.js`: Three E2E specs
- `package.json`: `@playwright/test` devDep; `"test:e2e": "playwright test"` script

### Post-Phase 10 — Admin UID & Full-Access Bypass (Already Done)

These were completed after Phase 10 shipped — **do not repeat them**:

- **Admin Firebase UID**: `93fNHZN5u7YLk5ITbPTHfsFYTI13`
- Set in `admin.html` (`const ADMIN_UID`) and `js/config.js` (`admin.uid`)
- **`js/modules/premium.js`**: `_isAdmin()` helper checks UID at call time (not cached). When admin:
  - `hasPremiumAccess()` → `true`
  - `hasTierAccess(any)` → `true`
  - `checkQuizAccess(any)` → `true` (no upgrade modal ever shown)
  - `getCurrentTier()` → `'enterprise'`
  - Tier array extended to `['free','premium','pro','unlimited','enterprise']`
- **`functions/index.js`**: `ADMIN_UID` constant. In `generateQuiz` + `getUserUsageStats`: rate-limit bypassed, counter not incremented, returns `tier: 'enterprise'`
- `showUpgradeModal` purple gradient fixed: `#667eea`/`#764ba2` → `#25d366`/`#128c7e`
- All 9 functions redeployed; hosting redeployed

### Current Build State
- Bundle: `app.[hash].js` / `app.[hash].css` — deployed 2026-03-03
- 533 dist files; all 9 Cloud Functions deployed
- **66 unit tests passing** (`npm test`)

---

## Naming & Code Conventions (Mandatory)

- Window globals: `window.QuizPros[ModuleName]` (PascalCase)
- Files: `kebab-case.js`
- CSS classes/IDs: `kebab-case`
- Module pattern: IIFE with `return { publicAPI }` (see CLAUDE.md)
- No circular dependencies. Modules never depend on components.
- Search entire codebase before renaming or removing anything.
- **Brand colours**: `#25d366` (primary), `#128c7e` (dark), `#3ed664` (light). Never use `#667eea` / `#764ba2` / any purple.
- **Standalone pages** (`live-presenter.html`, `live-audience.html`, `admin.html`, `dashboard.html`) have inline `<style>` and inline Firebase init — they do NOT use the webpack bundle. Edit source files directly; `npm run build` copies them via CopyPlugin.
- **Extension layer pattern**: New features on `live-presenter.html` and `live-audience.html` are additive inline `<script>` sections — never touch the pre-built webpack chunks.

---

## Phase 11 Objectives

### 11.1 — Session Archive Title from RTDB

**Goal:** Replace the hardcoded `'Session ' + code` title in archived sessions with the actual session name if the presenter set one.

**`live-presenter.html`** — in `setupArchiveButton()`:
- When archiving, read `sessions/{code}/title` from RTDB before writing the Firestore doc
- If `title` exists and is non-empty, use it; otherwise fall back to `'Session ' + code`
- Update the Firestore write: `title: sessionTitle` (instead of the hardcoded fallback)

**`dashboard.html`** — in `renderPastSessions()`:
- Ensure the session title field (`doc.data().title`) is displayed in the "Past Live Sessions" card (it should already be there if the field name matches)

**Acceptance criteria:**
- Sessions archived after a presenter set a title display that title in the dashboard
- Sessions without a title fall back gracefully to `'Session {code}'`

---

### 11.2 — Playwright CI Integration

**Goal:** E2E tests run automatically on every push via GitHub Actions.

**New file: `.github/workflows/e2e.yml`**:
```yaml
name: E2E Tests
on: [push, pull_request]
env:
  E2E_BASE_URL: http://localhost:5000
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npx serve dist -p 5000 &
      - run: npm run test:e2e
```

**Acceptance criteria:**
- Pushing to GitHub triggers the workflow
- All 3 Playwright specs pass in CI against the static build

---

### 11.3 — Stripe End-to-End Smoke Test

**Goal:** Verify the full payment → webhook → Firestore tier update flow works in Stripe test mode.

**Manual test steps:**
1. Sign in as a test user → go to `/premium.html`
2. Click "Go Premium" → Stripe checkout opens
3. Use card `4242 4242 4242 4242`, expiry `12/34`, CVC `123`
4. Complete checkout → verify redirect to `/?payment=success`
5. Check Firestore `users/{uid}` → `subscription.tier === 'premium'`
6. Verify `getUserUsageStats` callable returns `tier: 'premium'`
7. Test `createPortalSession` callable → Stripe Customer Portal opens

**If webhook is not firing:** Check Firebase Console → Functions → logs for `stripeWebhook` errors; verify `STRIPE_WEBHOOK_SECRET` is set in Cloud Secret Manager.

**Document result** (pass/fail + any fixes applied) in `PHASE11_HANDOFF.md`.

**Acceptance criteria:**
- Full checkout → webhook → Firestore flow verified (or failure documented with fix)
- `createPortalSession` opens Stripe portal without error

---

### 11.4 — "Share Session" QR Code for Live Audience

**Goal:** Presenter can project a QR code linking the audience to the join URL — closes the gap with Mentimeter's projectable join screen.

**`live-presenter.html`** — in the floating control panel:
- Add a `<button id="ext-share-qr-btn">📲 Share</button>` to the `.ext-controls` panel
- On click: create a fullscreen overlay (`position:fixed; inset:0; background:#000; z-index:99999`) containing:
  - A large `<img>` QR code: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=AUDIENCE_JOIN_URL` (same pattern as existing join QR)
  - The join URL as readable text below the QR
  - A `✕ Close` button (top-right corner, white)
- Audience join URL: `https://iquizpro.com/live-audience.html?code={sessionCode}` (use `window._extPresenterSessionCode` for the code)
- Overlay closes on ✕ click or `Escape` key

**Acceptance criteria:**
- Share button appears in the floating control panel during an active session
- Clicking it shows a fullscreen QR code overlay suitable for projecting
- Overlay closes cleanly; no layout shifts

---

### 11.5 — Quiz Search / Filter on Home Page

**Goal:** Users can instantly filter topic cards by name or category — improves discoverability as the topic count grows.

**`src/index.template.html`** — above the category tabs container:
```html
<div class="quiz-search-bar">
  <input type="search" id="quiz-search-input" placeholder="Search quizzes…" aria-label="Search quizzes" autocomplete="off">
  <button id="quiz-search-clear" aria-label="Clear search" style="display:none">✕</button>
</div>
```

**`js/modules/ui-manager.js`** (or `app.js`):
- On `#quiz-search-input` `input` event (debounced 200ms):
  - Get the trimmed lowercase query
  - For each `.topic-card`, check if `card.dataset.title` or `card.dataset.category` contains the query; show/hide accordingly
  - If query is empty: show all cards; reset category tab to active state
  - Show `#quiz-search-clear` button when query non-empty; hide when empty
  - After filtering: if zero visible cards in the grid, inject `<p class="quiz-no-results">No quizzes found for "{query}"</p>` (remove on next search/clear)
- `#quiz-search-clear` `click` event: clear input, reset, trigger input event

**Topic cards** must have `data-title` and `data-category` attributes — add these when rendering the card HTML in `ui-manager.js`.

**`css/theme.css`**:
```css
.quiz-search-bar { display:flex; gap:.5rem; margin-bottom:1rem; max-width:480px; }
.quiz-search-bar input { flex:1; padding:.65rem 1rem; border:2px solid #e0e0e0; border-radius:8px; font-size:1rem; }
.quiz-search-bar input:focus { border-color:#25d366; outline:none; }
#quiz-search-clear { background:none; border:none; font-size:1.2rem; color:#aaa; cursor:pointer; padding:.4rem; }
.quiz-no-results { color:#888; text-align:center; padding:2rem; grid-column:1/-1; }
```

**Acceptance criteria:**
- Typing filters topic cards in real time (debounced 200ms)
- ✕ button clears the search and restores all cards
- "No results" message shown when nothing matches
- Works correctly alongside existing category tab filtering

---

### 11.6 — Performance: Lazy-Load Firebase Auth SDK

**Goal:** Reduce initial page load time by deferring Firebase Auth until needed.

**`src/index.template.html`**:
- Change the `firebase-auth-compat.js` CDN `<script>` tag from synchronous to `async`:
  ```html
  <script async src="https://www.gstatic.com/firebasejs/9.20.0/firebase-auth-compat.js"></script>
  ```

**`js/modules/auth-manager.js`** — in `initialize()`:
- Before calling any `firebase.auth()` method, check that `firebase.auth` is available
- If not yet available, poll with `requestAnimationFrame` or a short `setTimeout` (max 20 attempts × 50ms) until `firebase.auth` is defined, then proceed
- Log a warning if auth never becomes available after the timeout

**Measure improvement:**
- Use Chrome DevTools → Lighthouse → Performance tab; note LCP before and after
- Document the before/after LCP/FID values in `PHASE11_HANDOFF.md`

**Acceptance criteria:**
- Page loads without auth-related console errors
- Sign-in / sign-up still work correctly
- Lighthouse LCP improves (document the numbers)

---

## Files Likely to Be Touched

| File | Why |
|------|-----|
| `live-presenter.html` | 11.1 session archive title; 11.4 share QR overlay |
| `dashboard.html` | 11.1 confirm `title` field displays in Past Sessions card |
| `.github/workflows/e2e.yml` | 11.2 new CI workflow file |
| `js/modules/ui-manager.js` | 11.5 search/filter logic, `data-title`/`data-category` on cards |
| `src/index.template.html` | 11.5 search input HTML; 11.6 async auth script tag |
| `css/theme.css` | 11.5 search bar styles |
| `js/modules/auth-manager.js` | 11.6 auth availability guard |

---

## Known Issues & Constraints Carried Forward

1. **Playwright browser install** — `npx playwright install chromium` must be run once locally before `npm run test:e2e`. Not automated for local dev.
2. **E2E tests depend on dev server** — Run `npm start` or `firebase serve --only hosting` (port 5000) before running `npm run test:e2e` locally.
3. **PDF export CDN dependency** — `_exportResultsPDF()` lazy-loads html2canvas + jsPDF from cdnjs. Fails in offline environments; CSP in `index.html` already allows `cdnjs.cloudflare.com`.
4. **Session archive title** — Currently hardcoded as `'Session ' + code` (Task 11.1 fixes this).
5. **Stripe E2E test pending** — Task 11.3 addresses this.
6. **Firebase Storage not initialised** — `storage.rules` (deny-all) exists but cannot be deployed until Storage is activated in Firebase Console → Storage → "Get Started".
7. **PWA icons are placeholders** — `icon-192.png` / `icon-512.png` are brand-coloured placeholder images. Replace with real logo when available (no code change needed — overwrite files and rebuild).
8. **vendors bundle 584 KB** — Firebase SDK size. Phase 8.3 (CDN splitting) remains deferred.
9. **Admin analytics `admin.html`** — `admin.uid` is now set to `93fNHZN5u7YLk5ITbPTHfsFYTI13`; admin bypass is fully active.

---

## How to Work

1. Read the required files first (they contain critical pitfalls numbered 1–33+)
2. Use Desktop Commander to read/edit files on the machine
3. Make targeted, incremental changes — complete and verify one task before starting the next
4. **Build:** `"/c/Program Files/nodejs/npm.cmd" run build` after any change to `js/`, `css/`, `src/`, or `app.js`
5. **Standalone pages** (`live-presenter.html`, `live-audience.html`, `admin.html`, `dashboard.html`): edit source, then `npm run build` to copy via CopyPlugin
6. **Unit tests:** `"/c/Program Files/nodejs/node.exe" node_modules/jest-cli/bin/jest.js` — must stay at 66 passing
7. **E2E tests:** `npm run test:e2e` (requires `firebase serve --only hosting` running on port 5000)
8. **Deploy hosting:**
   ```
   "/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting
   ```
9. **Deploy functions** (if `functions/index.js` changed): add `,functions` to the deploy command — **first attempt may timeout; retry once if so**
10. Search codebase before renaming or removing anything

---

## Implementation Order (Recommended)

1. **11.1** Session archive title (small change in `live-presenter.html`, immediate UX win)
2. **11.5** Quiz search/filter (visible feature; touches `ui-manager.js` + template + CSS)
3. **11.6** Lazy-load auth (performance; touches `auth-manager.js` + template — build and test auth flows carefully)
4. **11.4** Share Session QR overlay (self-contained addition to `live-presenter.html`)
5. **11.2** Playwright CI workflow (file creation only; validate by pushing to GitHub)
6. **11.3** Stripe smoke test (manual test — do last, after everything else is deployed)

Build and run unit tests after steps 1, 3, and 5. Deploy after step 5 before running the Stripe manual test.

---

## Success Criteria

- [ ] Session archive title shows presenter-set session name, or falls back to `'Session {code}'` when no title set
- [ ] Quiz search input filters topic cards in real time (debounced 200ms); ✕ clears; "No results" message appears when nothing matches; works alongside category tabs
- [ ] Firebase Auth SDK loads `async`; no auth-related console errors on page load; sign-in / sign-up still work
- [ ] Share Session QR overlay appears fullscreen on presenter screen; closes on ✕ or `Escape`; QR code points to correct audience join URL
- [ ] `.github/workflows/e2e.yml` created; Playwright specs pass in GitHub Actions CI
- [ ] Stripe checkout → webhook → Firestore flow verified end-to-end (or failure documented with fix applied)
- [ ] All 66 Jest unit tests still passing (`npm test`)
- [ ] `npm run build` completes without errors or new warnings
- [ ] No new console errors introduced on any page

---

## End-of-Phase Checklist

When all objectives are complete, before ending the session:

- [ ] Run `npm run build` — fix any errors or new warnings
- [ ] Run `"/c/Program Files/nodejs/node.exe" node_modules/jest-cli/bin/jest.js` — all 66 tests pass
- [ ] Run `npm run test:e2e` — all 3 Playwright specs pass
- [ ] Deploy to production: `--only hosting` (add `,functions` only if `functions/index.js` changed)
- [ ] Verify at https://iquizpro.com
- [ ] Update `CHANGELOG.md` with all Phase 11 changes
- [ ] Update `CLAUDE.md` if architecture, module map, or conventions changed (e.g. new Healthcare category in Phase 12 preview)
- [ ] Create `docs/development/PHASE11_HANDOFF.md` — using the Handoff Document Template in `PROMPT_FRAMEWORK.md`
- [ ] Create `docs/development/PHASE12_PROMPT.md` — using the Phase Prompt Template in `PROMPT_FRAMEWORK.md`; use `docs/development/PHASE12_PROMPT.md` (draft) and the Phase 12 section of `DEVELOPMENT_PLAN.md` as the content reference
- [ ] Update `memory/MEMORY.md` with new bundle hash and Phase 11 summary

---

## Phase 12 Preview — Do Not Implement Yet

> **Phase 12 = Psychiatry & Medical Quiz Expansion.** Full spec is in `docs/development/DEVELOPMENT_PLAN.md` (Phase 12 section) and the draft `docs/development/PHASE12_PROMPT.md`. At the **end of Phase 11**, write the final `PHASE12_PROMPT.md` using those references before closing the session.

### What Phase 12 involves (summary for awareness):
- **125 Medical Psychiatry questions** across 5 DSM-5-aligned topic IDs (`psych-schizophrenia`, `psych-mood`, `psych-anxiety`, `psych-neurocognitive`, `psych-personality`)
- **125 Nursing Psychiatry questions** across 5 NCLEX-style topic IDs (`psych-nursing-communication`, `psych-nursing-mood`, `psych-nursing-psychosis`, `psych-nursing-personality`, `psych-nursing-special`)
- **"🏥 Healthcare" category tab** added to the home page topic grid
- **2 free taster topics** + **8 premium-gated topics** added to `config.premium.gatedQuizIds`
- **10 placeholder WebP images** in `assets/images/psychiatry/`
- **"Psych Score Profile"** result messages in `quiz-scoring.js` for all psychiatry topic IDs
- **AI generation presets** dropdown (Medical Psychiatry, Nursing Psychiatry, etc.) in the AI quiz UI; `promptPrefix` field sent in `generateQuiz` payload and prepended in `functions/index.js`

### Critical format reminder for Phase 12 questions:
```javascript
// CORRECT — answer is always a 0-based integer index
{ question: '...', options: ['A text', 'B text', 'C text', 'D text'], answer: 1, difficulty: 'medium', explanation: '...', tags: [...], category: 'medical-psychiatry' }
// WRONG — never use letter format
{ correct: 'B', options: ['A) ...', 'B) ...'] }
```
