# iQuizPros — Phase 10: Retention, Parity & Reporting

## Project Context

I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, module system, conventions, pitfalls (all 33 numbered pitfalls)
2. `docs/development/PHASE9_HANDOFF.md` — What changed in Phase 9, competitive re-audit, known issues
3. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap; Phase 10 section has all task specs
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, handoff/prompt templates

---

## What Changed in Phase 9 (Summary)

### New Live Presenter Features (extension layer v9.0 — `live-presenter.html`)
- **🏅 Ranking** question type — audience sees current leaderboard when presenter activates
- **💬 Q&A** question type — audience submits questions (max 120 chars); floating 💬 button opens real-time Q&A overlay on presenter screen; `setupQandA()`, `renderQAList()` functions added
- **😊 Emoji reactions** — 😊 toggle button expands emoji bar (👍🎉😂😮❤️); each click writes to `sessions/{code}/lastReaction` via `ServerValue.TIMESTAMP`; `setupEmojiReactions()` function added
- **📥 CSV export** — `#export-btn` downloads `iquizpros_{code}_{date}.csv`; `setupCSVExport()` function added
- Timer config panel hidden for `ranking` and `q-and-a` types (stored in `noTimerTypes` object)
- Init sequence: `setupLeaderboard(); setupQandA(); setupEmojiReactions(); setupCSVExport();`

### New Live Audience Features (extension layer v9.0 — `live-audience.html`)
- `renderRanking()` — reads RTDB `participants`, renders top-10 with medals, highlights current user
- `renderQandA(slideIdx)` — text input (maxlength 120), pushes to `sessions/{code}/qa/{key}` via `.push()`
- `showEmojiReaction(emoji)` — CSS `@keyframes iqp-emoji-float` animation on `lastReaction` change
- `showExtension()` dispatcher handles `'ranking'` and `'q-and-a'` types

### RTDB Rules (`database.rules.json`)
Two new paths under `sessions/$sessionCode`:
- `qa/$qaKey` — unauthenticated audience can push (no-overwrite); presenter can delete; validates `text/nickname/ts`, text 1–120 chars
- `lastReaction` — public read; presenter-only write

### Daily Challenge System
- **`css/theme.css`**: `.daily-challenge-section`, `.daily-challenge-card`, `.daily-badge`, `.daily-streak`, `.daily-done` classes
- **`js/modules/ui-manager.js`**: `_getTodayStr()`, `_getDailyChallengeData()`, `_buildDailyChallengeHTML()`, `completeDailyChallenge(quizId)` — deterministic date-seeded topic selection; streak tracking; DOM patching on completion
- **`app.js`**: persistent `quizpros:quiz:completed` listener → calls `QuizProsUI.completeDailyChallenge(quizId)`
- **localStorage keys**: `iqp_daily_challenge` → `{ date, topicId, completed }`, `iqp_daily_streak` → `{ lastDate, count }`

### Question Bank & Difficulty (Phase 9.0)
- `question-bank.js` rewritten: 25 questions/topic, `difficulty` + `explanation` on every question
- `getRandomQuestions(topicId, count, difficulty)`, `getDifficultyCounts(topicId)` exported
- `quiz-engine.js`: `_showDifficultyPicker(topicId)` modal before knowledge quizzes; `_selectedDifficulty` in `localStorage('iqp_difficulty')` (global — per-topic is Phase 10.8b)

### Current Build
- Bundle: `app.8d7012b3.js` / `app.e903b0d7.css`
- Deploy: 532 files, hosting + database rules
- Tests: **66 passing** (3 suites: quiz-scoring, auth-manager, analytics)

---

## Naming & Code Conventions (Mandatory)

- Window globals: `window.QuizPros[ModuleName]` (PascalCase)
- Files: `kebab-case.js`
- CSS classes/IDs: `kebab-case`
- Module pattern: IIFE with `return { publicAPI }` (see CLAUDE.md)
- No circular dependencies. Modules never depend on components.
- Search entire codebase before renaming or removing anything.
- **Brand colours**: `#25d366` (primary), `#128c7e` (dark), `#3ed664` (light). Never use `#667eea` / `#764ba2` / any purple.
- **Standalone pages** (`live-presenter.html`, `live-audience.html`, `dashboard.html`, `admin.html`) have inline `<style>` and inline Firebase init — they do NOT use the webpack bundle. Changes go directly in those HTML files; `npm run build` copies them via CopyPlugin.
- **Extension layer pattern**: New features on `live-presenter.html` and `live-audience.html` are additive inline `<script>` sections — never touch the pre-built webpack chunks.

---

## Phase 10 Objectives

### 10.1 — Q&A Upvoting (Live Presenter + Audience)

**Goal:** Audience can upvote submitted Q&A questions so the best ones surface to the top. Closes the Mentimeter Q&A upvoting gap.

**RTDB data model:**
```
sessions/{code}/qa/{key}/
  text        — string (existing)
  nickname    — string (existing)
  ts          — number (existing)
  votes/      — NEW map: { voterId: true }
    {voterId} — true (write-once, no-retract)
```

**`database.rules.json` change** — add `votes` under `qa/$qaKey`:
```json
"votes": {
  "$voterId": {
    ".read": true,
    ".write": "!data.exists()",
    ".validate": "newData.val() === true"
  }
}
```

**`live-audience.html` changes:**
- `renderQandA()`: Each Q&A slide shows a scrollable list of existing questions (read-only listener on `qa`) with a 👍 button per question
- Vote key: `localStorage('iqp_anon_id')` — generate UUID if absent; use `auth.uid` if authenticated
- On 👍 click: `db.ref('sessions/' + code + '/qa/' + key + '/votes/' + voterId).set(true)`
- Disable 👍 button after voting (check if `votes/{voterId}` exists)

**`live-presenter.html` changes:**
- `renderQAList()`: count `Object.keys(item.votes || {}).length` for each question; sort by vote count descending; show vote badge `<span class="ext-qa-votes">👍 N</span>` next to each question

**Acceptance criteria:**
- Audience taps 👍 → count increments on presenter overlay in real time
- Sorted by most votes at top
- Cannot vote twice on same question

---

### 10.2 — Global Daily Leaderboard

**Goal:** Firestore-backed leaderboard showing today's top 10 daily challenge scores. Closes the Sporcle daily leaderboard gap. Drives daily return visits.

**Firestore collection:** `dailyLeaderboard/{YYYY-MM-DD}/scores/{uid}` — `{ nickname, score, topicId, completedAt }`
- `score` = number of correct answers (integer 0–10)
- Written by authenticated users only; readable by anyone

**`js/modules/quiz-engine.js`:**
- `quizpros:quiz:completed` CustomEvent `detail` currently: `{ quizId, isPersonality }` — add `correctCount: N` (count of `_correctAnswers` already tracked)

**`js/modules/ui-manager.js`:**
- `completeDailyChallenge(quizId, correctCount)` — updated signature
  - If `firebase.auth().currentUser` exists: write to Firestore `dailyLeaderboard/{today}/scores/{uid}` (merge: only update if new score > existing)
  - Pull nickname from `firebase.auth().currentUser.displayName` or `localStorage('iqp_nickname')` (set by audience join flow)
- `_loadDailyLeaderboard()` — new function: reads top 10 by `score` desc; renders `#daily-leaderboard-section` immediately below the daily challenge card
  - Table: rank, nickname, score (e.g. "8/10"), topic icon
  - Current user's row highlighted with green border
  - Called from `initTopicSelectionUI()` after injecting daily challenge HTML

**`app.js`:** Forward `correctCount` from event detail to `completeDailyChallenge()`

**`firestore.rules`:** Add rule for `dailyLeaderboard/{date}/scores/{uid}`:
```
match /dailyLeaderboard/{date}/scores/{uid} {
  allow read: if true;
  allow create, update: if request.auth != null && request.auth.uid == uid;
}
```

**CSS (`css/theme.css`):** `.daily-leaderboard-section`, `.daily-lb-row`, `.daily-lb-me` styles

**Acceptance criteria:**
- Top 10 shown below daily challenge card on homepage
- Authenticated user's score written after challenge completion
- Guest users see leaderboard read-only (no write)
- Current user's row highlighted

---

### 10.3 — Session History & Archive

**Goal:** Presenter can review past sessions from their dashboard. Closes the Mentimeter session replay gap.

**Firestore collection:** `sessionArchive/{code}` — written when presenter ends a session:
```js
{
  presenterId: string,
  date: ISO string,
  participantCount: number,
  slides: [{ idx, type, text, options, responseSummary: { 'A': N, 'B': N, ... } }],
  topScores: [{ nickname, score }],  // top 5
  endedAt: serverTimestamp
}
```

**`live-presenter.html`:** On "End Session" button click (existing `endSession()` call):
- Before clearing RTDB session, snapshot `participants` + `responses` from RTDB
- Build archive object from the snapshot; compute `responseSummary` per slide
- Write to Firestore `sessionArchive/{code}` — gated: only if `firebase.firestore` is available
- Function: `archiveSession(code, sessionData)` — async, fire-and-forget (do not block session end)

**`dashboard.html`:** New "Past Sessions" section (add after quiz history section):
- Lists archived sessions sorted by `endedAt` desc
- Columns: date, participant count, number of slides
- Clicking a row opens a modal or inline expand showing:
  - Each slide's question text + inline horizontal bar chart of `responseSummary`
  - Bar chart: `<div class="arch-bar" style="width: X%">A (N)</div>` — no external lib
  - Top 5 scores table
- Reads `where('presenterId', '==', uid)` from `sessionArchive` collection

**`firestore.rules`:** Add:
```
match /sessionArchive/{code} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.presenterId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.presenterId;
}
```

**Acceptance criteria:**
- Session appears in dashboard "Past Sessions" within seconds of presenter ending session
- Slide-by-slide view shows response distribution
- Only the presenter who created the session can see it

---

### 10.4 — PDF Result Export (Premium Feature)

**Goal:** Users can download a PDF of their quiz results. Premium-gated. Closes Mentimeter + Quizgecko PDF gap.

**Libraries (lazy CDN load — no bundle impact):**
- `html2canvas` v1.4.1: `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`
- `jsPDF` v2.5.1: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`

**`js/modules/quiz-engine.js`:**
- New function `_exportResultsPDF()`:
  1. Check `QuizProsPremium.getUserTier()` — if `'free'` or undefined, call `QuizProsPremium.showUpgradeModal('pdf-export')` and return
  2. Lazy-load html2canvas + jsPDF scripts if not already present (`document.createElement('script')`)
  3. On load: capture `#results-container` via `html2canvas({ scale: 2, useCORS: true })`
  4. Create jsPDF (`orientation: 'portrait', unit: 'mm', format: 'a4'`)
  5. Add header: iQuizPros logo text (green `#25d366`), quiz title, completion date
  6. Add captured canvas as image (scaled to fit A4 width)
  7. Add footer: `iquizpro.com` and page number
  8. Save as `iquizpros_{topicId}_{YYYY-MM-DD}.pdf`
- Add "📄 Download PDF" button to results HTML (inside the share buttons section, after the canvas share button)
- Button: `<button id="export-pdf-btn" class="btn-secondary">📄 Download PDF</button>`
- Wire `addEventListener('click', _exportResultsPDF)` in the results rendering block

**CSS (`css/theme.css`):** `#export-pdf-btn` — same style as `.btn-secondary`; add `.btn-secondary.loading` spinner state

**Acceptance criteria:**
- Premium user clicks "Download PDF" → PDF downloads with quiz title, score, Q&A
- Free user sees upgrade modal
- File named correctly; no console errors

---

### 10.5 — Admin Analytics Dashboard

**Goal:** Internal page showing quiz health metrics. Auth-gated to a single admin UID set in config.

**`js/config.js`:** Add `adminUid: ''` field (leave blank in repo; set to real UID in config before using — document this)

**New `admin.html`** (standalone, same inline Firebase init pattern as `dashboard.html`):

**Auth gate (runs immediately on DOMContentLoaded):**
```js
firebase.auth().onAuthStateChanged(function(user) {
  if (!user || user.uid !== ADMIN_UID) {
    window.location.href = '/';
    return;
  }
  loadDashboard();
});
```

**`loadDashboard()` sections (all load in parallel via `Promise.all`):**

1. **Top Quizzes by Play Count** — reads all `quizStats/{topicId}` docs, maps `playCount`, renders sorted table
2. **Daily Challenge Today** — counts `dailyLeaderboard/{today}/scores` with `getCountFromServer()`; shows "N completions today"
3. **Total Registered Users** — `getCountFromServer()` on `users` collection
4. **Live Sessions (last 24h)** — reads RTDB `sessions` node; filters `createdAt > Date.now() - 86400000`; counts active + recent
5. **AI Quiz Generations (this month)** — queries `users/{uid}/usage/{YYYY-MM}` across all users (use a collection group query on `usage` if available, else approximate from Firestore `generatedQuizzes` count)

**CSS:** Inline `<style>` block; brand green `#25d366`; admin card grid layout

**CopyPlugin (`webpack.config.js`):** Add `{ from: 'admin.html', to: 'admin.html' }` to CopyPlugin patterns

**`firebase.json`:** No special hosting rules needed (admin.html is just a static HTML file)

**Acceptance criteria:**
- Navigating to `/admin.html` as non-admin redirects to `/` immediately
- Admin UID sees all 5 metric sections load with real data
- Page uses brand green styling

---

### 10.6 — Quiz Embed (iframe Support)

**Goal:** AI-generated quizzes can be embedded on external sites via `<iframe>`. Closes Quizgecko embed gap.

**Embed mode detection (`app.js` init block):**
```js
var _embedMode = new URLSearchParams(window.location.search).get('embed') === '1';
if (_embedMode) window._iqpEmbedMode = true;
```

**When `window._iqpEmbedMode === true`:**

**`js/modules/ui-manager.js`** — in `initTopicSelectionUI()`:
- If `_embedMode` and `?quizId=` param present: call `QuizProsEngine.startGeneratedQuiz(quizId)` directly; skip topic grid render entirely
- If `_embedMode` but no `quizId`: show a simple "Quiz not found" message

**`js/modules/quiz-engine.js`** — in `showResults()`:
- If `_embedMode`: append "🎯 Play more on iQuizPros →" link (`target="_parent"` to open in parent window) to results; hide all share buttons except this CTA

**`src/index.template.html`** / `index.html`:
- If `_embedMode`: add class `embed-mode` to `<body>` — CSS hides header, footer, bottom-nav, install prompt sheet

**`css/theme.css`:** `.embed-mode header`, `.embed-mode footer`, `.embed-mode .bottom-nav`, `.embed-mode #install-prompt-sheet` → `{ display: none !important }`

**`dashboard.html`:** In the AI quiz library section, add "🔗 Get Embed Code" button per quiz:
- On click: copy `<iframe src="https://iquizpro.com?embed=1&quizId={id}" width="100%" height="620" frameborder="0" allowfullscreen></iframe>` to clipboard
- Show toast "Embed code copied!"

**`firestore.rules`:** No change needed — `getGeneratedQuiz` Cloud Function already reads quiz data; unauthenticated embed reads are already permitted

**Acceptance criteria:**
- `https://iquizpro.com?embed=1&quizId=VALID_ID` shows just the quiz with no header/footer
- Results show "Play more on iQuizPros" CTA
- Dashboard "Get Embed Code" button copies correct iframe snippet

---

### 10.7 — E2E Tests (Playwright)

**Goal:** Automated browser tests for the 3 most critical user journeys.

**Install:**
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

**`playwright.config.js`** (project root):
```js
module.exports = {
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5000' },
  webServer: { command: 'firebase serve --only hosting', port: 5000, reuseExistingServer: true }
};
```

**`tests/e2e/quiz-flow.spec.js`:**
- Navigate to `/`; wait for topic grid; click "Science" topic card
- Difficulty picker appears → click "All Difficulties"
- Answer all 10 questions (click first option each time)
- Assert results page shows score badge and share buttons

**`tests/e2e/personality-flow.spec.js`:**
- Navigate to `/`; click "Love Language" personality quiz
- Answer all questions
- Assert personality result type heading is visible

**`tests/e2e/daily-challenge.spec.js`:**
- Navigate to `/`; assert `#daily-challenge-section` or `.daily-challenge-card` is visible
- Click the daily challenge CTA button
- Assert quiz starts (difficulty picker or first question visible)

**`package.json`:** Add `"test:e2e": "playwright test"` script

**Note:** E2E tests run against `firebase serve --only hosting` (port 5000). They do NOT require Firebase emulators — they connect to real Firebase services (read-only paths for quiz data are public). Tests should NOT authenticate or write data.

**Acceptance criteria:**
- `npm run test:e2e` runs all 3 specs and passes
- Tests work on a clean `firebase serve` instance with no pre-seeded state

---

### 10.8 — Quick Wins & Carry-Forwards

These are low-effort polish items from Phase 9 known issues. Implement in any order; they are independent.

**10.8a — Q&A Moderation (Presenter Delete)**
- In `live-presenter.html` `renderQAList()`: add `<button class="ext-qa-delete-btn" data-key="${key}">🗑️</button>` per question row
- Event delegation: `extQaList.addEventListener('click', function(e) { if (e.target.classList.contains('ext-qa-delete-btn')) { db.ref('sessions/' + currentCode + '/qa/' + e.target.dataset.key).remove(); } })`
- RTDB rule already allows presenter delete — no rule change needed
- CSS: `.ext-qa-delete-btn` — small grey button, right-aligned in the row

**10.8b — Per-Topic Difficulty Preference**
- In `quiz-engine.js` `_showDifficultyPicker(topicId)`:
  - Change read key: `localStorage.getItem('iqp_difficulty_' + topicId) || localStorage.getItem('iqp_difficulty') || 'all'`
  - Change write key: `localStorage.setItem('iqp_difficulty_' + topicId, val)`
- Backward compat: fall back to old global key if no per-topic key exists; do not delete old key
- Update `_selectedDifficulty` assignment to also use per-topic key

**10.8c — Daily Challenge Thumbnail Image**
- In `ui-manager.js` `_buildDailyChallengeHTML(regularTopics)`:
  - Find the matching topic from `regularTopics` array (already available in scope)
  - Insert `<img src="${topic.image || 'assets/images/default-personality.webp'}" class="daily-challenge-thumb" alt="">` inside `.daily-challenge-inner`
- CSS (`theme.css`): `.daily-challenge-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }`
- Place thumbnail left of `.daily-topic-info`

**10.8d — Stripe End-to-End Verification**
- This is a **manual test**, not a code change
- Steps: Sign in as a test user → go to `/premium.html` → click "Go Premium" → use card `4242 4242 4242 4242`, expiry `12/34`, CVC `123` → verify redirect to `/?payment=success` → check Firestore `users/{uid}` for `subscription.tier === 'premium'` → verify `getUserTier()` returns `'premium'` → test `createPortalSession` opens Stripe Customer Portal
- If webhook is not firing: check Firebase Console → Functions → logs for `stripeWebhook` errors; ensure `STRIPE_WEBHOOK_SECRET` secret is set correctly in Cloud Secret Manager
- Document result in PHASE10_HANDOFF.md

---

## Files Likely to Be Touched

| File | Why |
|---|---|
| `live-presenter.html` | Q&A upvoting sort + delete button (10.1, 10.8a) |
| `live-audience.html` | Q&A upvote button + vote write (10.1) |
| `database.rules.json` | Add `votes/$voterId` rule under `qa/$qaKey` (10.1) |
| `js/modules/ui-manager.js` | Daily leaderboard render, completeDailyChallenge signature update, thumbnail (10.2, 10.8c) |
| `js/modules/quiz-engine.js` | correctCount in event, PDF export function, per-topic difficulty, embed results (10.2, 10.4, 10.6, 10.8b) |
| `app.js` | Forward correctCount to completeDailyChallenge, embed mode detection (10.2, 10.6) |
| `firestore.rules` | dailyLeaderboard + sessionArchive rules (10.2, 10.3) |
| `js/config.js` | Add adminUid field (10.5) |
| `css/theme.css` | Daily leaderboard CSS, embed-mode hide rules, daily thumbnail CSS (10.2, 10.6, 10.8c) |
| `dashboard.html` | Past Sessions section, embed code copy button (10.3, 10.6) |
| `admin.html` | New standalone page (10.5) |
| `webpack.config.js` | Add admin.html to CopyPlugin (10.5) |
| `playwright.config.js` | New file (10.7) |
| `tests/e2e/*.spec.js` | New E2E test files (10.7) |
| `package.json` | Add @playwright/test, test:e2e script (10.7) |

---

## Known Issues & Constraints Carried Forward

1. **Stripe E2E test pending** — test card `4242 4242 4242 4242`; verify full payment → webhook → Firestore flow (10.8d)
2. **Firebase Storage not initialised** — `storage.rules` exists (deny-all) but undeployed; not blocking Phase 10
3. **PWA icons are placeholders** — `icon-192.png` / `icon-512.png`; replace with real logo when available
4. **Multi-device audience Q&A** — session code discovery is localStorage-only between same browser/device; RTDB fallback for multi-device
5. **vendors bundle 584 KB** — Firebase SDK; Phase 8.3 (CDN splitting) still deferred
6. **Daily challenge streak** — Resets to 1 (not 0) on missed day; this is intentional
7. **`iqp_difficulty` global key** — Phase 10.8b changes to per-topic key; old key remains for backward compat
8. **Admin analytics** — `admin.html` requires `adminUid` set in `config.js` before it is useful; default value is empty string (no one can access)
9. **`html2canvas` + `jsPDF`** for PDF export — lazy CDN load; add to CSP if needed. Current CSP in `index.html` may need `script-src` update to allow cdnjs.cloudflare.com

---

## How to Work

1. Read the required files first (they contain critical pitfalls)
2. Use Desktop Commander to read/edit files
3. Make targeted, incremental changes — one task at a time
4. **Build:** `"/c/Program Files/nodejs/npm.cmd" run build` after any change to `js/`, `css/`, `src/`, or `app.js`
5. **For `live-presenter.html`, `live-audience.html`, `admin.html`:** these are standalone pages copied by CopyPlugin — edit source files, then `npm run build`
6. **Tests:** `"/c/Program Files/nodejs/node.exe" node_modules/jest-cli/bin/jest.js` for unit tests
7. **E2E tests:** `npm run test:e2e` (requires `firebase serve --only hosting` running on port 5000)
8. **Deploy:** Full command (with database + Firestore rules):
   ```
   "/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting,firestore:rules,database
   ```
9. Search codebase before renaming/removing anything

---

## Implementation Order (Recommended)

Work in this order to build on dependencies correctly:

1. **10.8a** Q&A delete (smallest change, warms up live-presenter.html context)
2. **10.8b** Per-topic difficulty (tiny quiz-engine.js change)
3. **10.8c** Daily challenge thumbnail (tiny ui-manager.js change)
4. **10.1** Q&A upvoting (extends Q&A system just warmed up in 10.8a)
5. **10.2** Global daily leaderboard (extends daily challenge just warmed up in 10.8c)
6. **10.3** Session history & archive (dashboard.html + live-presenter.html + Firestore)
7. **10.4** PDF export (quiz-engine.js addition, lazy CDN load)
8. **10.5** Admin dashboard (new standalone page)
9. **10.6** Quiz embed (app.js + ui-manager.js + CSS)
10. **10.7** E2E tests (Playwright — do last, tests the full system)
11. **10.8d** Stripe verification (manual test — do after deploy)

Build and run unit tests after steps 2, 5, 7, and 10. Deploy to staging after step 10 before production.

---

## Success Criteria

- [ ] Q&A questions sorted by upvote count on presenter overlay; audience can upvote once per question
- [ ] Global daily leaderboard top-10 visible on homepage after daily challenge completion
- [ ] Session archive written to Firestore on session end; past sessions visible in dashboard
- [ ] "Download PDF" button on results page; premium users download PDF; free users see upgrade modal
- [ ] `admin.html` loads for admin UID and shows 5 metric sections; non-admin redirects to `/`
- [ ] `?embed=1&quizId=X` URL shows bare quiz with no header/footer; "Play more on iQuizPros" CTA in results
- [ ] `npm run test:e2e` — all 3 Playwright specs pass against `firebase serve`
- [ ] Q&A delete button removes question from RTDB in real time
- [ ] Per-topic difficulty preserved independently (Hard on Science ≠ Hard on Geography)
- [ ] Daily challenge card shows topic thumbnail image
- [ ] Stripe E2E test verified (documented in handoff)
- [ ] No new console errors introduced
- [ ] All existing quiz topics still function correctly
- [ ] All 66 existing Jest unit tests still passing
- [ ] `npm run build` completes without errors
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md updated if architecture changed

---

## End-of-Phase Checklist

When all objectives are complete, before ending the session:

- [ ] Run `npm run build` and fix any build errors
- [ ] Run `"/c/Program Files/nodejs/node.exe" node_modules/jest-cli/bin/jest.js` — all tests pass
- [ ] Run `npm run test:e2e` — all E2E specs pass
- [ ] Deploy to production: `hosting,firestore:rules,database`
- [ ] Verify at https://iquizpro.com
- [ ] Update `CHANGELOG.md` with all Phase 10 changes
- [ ] Update `CLAUDE.md` — add `adminUid` field note, session archive collection, daily leaderboard collection, embed mode pitfall
- [ ] Create `docs/development/PHASE10_HANDOFF.md` — using Handoff Document Template in `PROMPT_FRAMEWORK.md`
- [ ] Create `docs/development/PHASE11_PROMPT.md` — using Phase Prompt Template in `PROMPT_FRAMEWORK.md`
- [ ] Update `memory/MEMORY.md` with new bundle hash and Phase 10 summary
