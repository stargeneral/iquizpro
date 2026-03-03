# iQuizPros — Phase 5: Live Presenter Expansion & Integration Polish

## Project Context

I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, module system, conventions, pitfalls
2. `docs/development/PHASE4_HANDOFF.md` — What changed in the last phase
3. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap for reference
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, and the handoff/prompt templates required when generating end-of-phase documents

You also have a **persistent memory file** at:
`C:\Users\user\.claude\projects\E--Programs-iquizpros-live-backup\memory\MEMORY.md`

This file is automatically loaded into your context and contains deployment commands, known issues, architecture notes, and verified working features accumulated across all previous sessions. Consult it for deployment commands, known pitfalls, and current project state.

---

## What Changed in Phase 4 (Summary)

### New Files
- **`dashboard.html`** — Standalone premium dashboard at `/dashboard.html`:
  auth-gated, shows subscription tier/usage (via `getUserUsageStats` CF), quiz history (Firestore), AI quiz library (via `listUserQuizzes` CF), score trend CSS bars, "Manage Subscription" button (calls `createPortalSession`), delete AI quizzes (calls `deleteGeneratedQuiz`)
- **`database.rules.json`** — Realtime Database security rules for live sessions

### New Cloud Functions (in `functions/index.js`)
- **`createPortalSession`** (callable) — Creates Stripe Customer Portal session; reads `stripeCustomerId` from `users/{uid}.subscription` map field; returns `{ url }` for redirect
- **`cleanupExpiredSessions`** (scheduled daily, `Europe/London`) — Deletes RTDB sessions at `sessions/{code}` with `createdAt` (unix ms) older than 24 hours

### Config Changes
- `firebase.json` — Added `"database": { "rules": "database.rules.json" }`
- `webpack.config.js` — Added `dashboard.html` to CopyPlugin

### Post-Phase Addition — Full Brand Colour Audit (v4.2.0)
Completed in the same session after Phase 4 deployments. All purple removed codebase-wide. Brand green `#25d366` / dark `#128c7e` established as the only permitted primary colour scheme.

Files changed: `premium.html`, `dashboard.html`, `css/theme.css`, `css/quiz-detail.css`, `css/layout.css`, `styles.css`, `js/components/header.js`, `js/modules/ui-manager.js`

Colour mapping (old → new):
- `#667eea` → `#25d366` (primary accent)
- `#764ba2` → `#128c7e` (dark/gradient end)
- `#7d5ba6` → `#25d366` (personality quiz accents)
- `#9b59b6` → `#25d366` (category icon colour)
- `#5d4580` → `#128c7e` (personality dark)
- `#6a4a91` → `#128c7e` (button hover dark)
- `#f0e8ff` → `#e8faf0` (option hover background)
- `#e6dbff` → `#d4f5e9` (card hover background)
- `#f9f5ff`/`#f8f5ff` → `#f0faf5` (section background tints)

### Deferred from Phase 4 (MUST DO in Phase 5)
- Live presenter new question types (4.3: word cloud, rating, true/false)
- Countdown timer + leaderboard (4.4)
- These were blocked by the pre-built bundle constraint — see Outstanding Work below

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

All pages must use the iQuizPros brand green. **Never introduce a new primary colour scheme.**

| Role | Hex |
|------|-----|
| Primary green (brand) | `#25d366` |
| Dark green (hover / gradient end) | `#128c7e` |
| Light green (tint) | `#3ed664` |

**Gradient pattern:** `linear-gradient(135deg, #25d366 0%, #128c7e 100%)`
**CSS variables** (in `css/theme.css`): `--primary-color`, `--primary-dark`, `--primary-light`

**Do NOT use any of these colours** — all removed in the 2026-02-28 colour audit:

| Removed | Replacement | Was used for |
|---------|-------------|-------------|
| `#667eea` | `#25d366` | Old primary accent |
| `#764ba2` | `#128c7e` | Old gradient dark end |
| `#7d5ba6` | `#25d366` | Personality quiz accents |
| `#5d4580` | `#128c7e` | Personality quiz dark |
| `#9b59b6` | `#25d366` | Category icon (Self-Discovery) |
| `#6a4a91` | `#128c7e` | Button hover dark |

Standalone pages (`premium.html`, `dashboard.html`, any future `.html` pages) have their own inline `<style>` blocks and **do not** inherit the webpack CSS. Colour fixes to those pages must be made in the file itself, then `npm run build` copies them to `dist/`.

---

## Step 0 — Phase 4 Deployment Status ✅ Complete

**All Phase 4 work was deployed at the end of the Phase 4 session (2026-02-28). No deployment step is required before starting Phase 5 features.**

What was deployed and verified:
- ✅ `firebase deploy --only functions` — `createPortalSession` + `cleanupExpiredSessions` live in `europe-west2`
- ✅ `firebase deploy --only database` — Realtime Database instance (`quizpros-default-rtdb`, `europe-west1`) provisioned; `database.rules.json` rules deployed
- ✅ `npm run build && firebase deploy --only hosting` — `dashboard.html` live at `https://iquizpro.com/dashboard.html` (verified loading correctly)
- ✅ Full brand colour audit deployed — all purple replaced with brand green across 8 files

**Still to do in Phase 5** (no blockers, just untested flows):
- End-to-end Stripe test (see 5.0 below) — infrastructure is live, payment flow not yet exercised with a test card

---

## Phase 5 Objectives

### 5.0 — End-to-End Stripe Test (Critical Prerequisite)

Before building anything else, verify the full payment flow works:

1. Visit `https://iquizpro.com/premium.html`, sign in, click "Get Premium"
2. On Stripe checkout page: card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
3. After redirect back: check Firebase Console → Firestore → `users/{uid}` — confirm `subscription.tier = "premium"` was written by the webhook
4. Back on `dashboard.html` → verify tier badge shows "Premium" and AI generation limit is 100
5. Click "Manage Subscription" → verify Stripe Customer Portal opens with the correct customer
6. In the portal, cancel the subscription → verify `users/{uid}.subscription.tier` reverts to "free" after the webhook fires

If the webhook fails: check Cloud Function logs in Firebase Console → Functions → stripeWebhook. Common issues: webhook secret mismatch, missing `client_reference_id` in Payment Link metadata.

### 5.1 — Dashboard: Retake AI Quiz Flow

**Goal:** The "Retake" button on `dashboard.html` links to `/?retake={quizId}`. The main app currently ignores this parameter. Wire it up.

**Implementation:**
- In `js/modules/ui-manager.js` or `app.js`, on `DOMContentLoaded`, check `new URLSearchParams(location.search).get('retake')`
- If present, call `getGeneratedQuiz` Cloud Function with that quiz ID
- If the quiz belongs to the current user, load it into `quiz-engine.js` as a custom quiz and start it immediately
- On completion, save the result to `users/{uid}/quizHistory` (already handled by `quiz-engine.js` → `saveQuizResult()`)
- If the quiz is not found or belongs to another user, show a toast and remove the URL param

### 5.2 — Dashboard Link in Main Nav

**Goal:** Add "Dashboard" to the main site navigation for signed-in users.

**Implementation:**
- In `js/components/header.js` (inside `_updateHeaderForSignedIn()`), add a "Dashboard" link pointing to `/dashboard.html` in the user dropdown or nav bar
- Show only when `firebase.auth().currentUser` is non-null
- Do not show the link to unauthenticated visitors

### 5.3 — Live Presenter: New Question Types

**Background:** The live-presenter and live-audience webpack bundles are pre-built from a separate source project not in this repository. The bundles **cannot be rebuilt** by running `npm run build` in this repo.

**Approach for Phase 5:** Build a lightweight **second audience interaction layer** alongside the pre-built bundle. Rather than modifying the bundles, create a new `live-audience-ext.html` (or add an overlay `<script>` to `live-audience.html`) that handles the new question types when the current question's `type` field in Firestore/RTDB is not `"multiple-choice"`.

**New question types to implement:**

#### Word Cloud
- Presenter side (in `live-presenter.html` or a companion UI): add a "Word Cloud" question type option in session creation/editing
- Audience side: shows a text input (max 20 chars) instead of multiple-choice buttons
- Results: CSS word cloud — render words as `<span>` elements sized by frequency using `font-size: {count}em`
- Store responses in RTDB under `sessions/{code}/responses/{uid}_{slideIdx}.value = "word"`

#### Rating Scale (1–5 or 1–10)
- Presenter: sets scale range (5 or 10) per question
- Audience: shows a horizontal slider or tap-to-select number buttons
- Results: bar chart per rating + bold average score

#### True/False Quick Poll
- Presenter: binary question — True/False or Yes/No
- Audience: two large full-width buttons
- Results: animated fill bars showing percentage split

**Implementation notes:**
- All new question types must be backward-compatible — questions with no `type` field default to `"multiple-choice"`
- Store `type` in the RTDB question object: `sessions/{code}/questions/{qIndex}/type`
- The existing pre-built live-audience bundle handles `type: "multiple-choice"` (or no type); new types are handled by the extension layer
- Do not touch the pre-built bundles (`live-presenter.e6fc5f16770ec082babb.js`, etc.)

### 5.4 — Live Presenter: Timer & Leaderboard

**Same approach as 5.3** — implement as an extension layer alongside the existing bundle.

#### Timer per question
- Presenter can set `sessions/{code}/questions/{qIndex}/timer` (seconds; null = no limit) when creating a slide
- Display a countdown on both presenter and audience views (synced via RTDB server timestamp at `closedAt`)
- When timer expires: lock responses by setting `sessions/{code}/questions/{qIndex}/closedAt` to server timestamp

#### Leaderboard
- Scoring formula: `correct × (timeRemaining / totalTime) × 100`
- Each participant's cumulative score tracked at `sessions/{code}/participants/{uid}/score`
- Nickname chosen at join: `sessions/{code}/participants/{uid}/nickname`
- Leaderboard shown after each timed question + final leaderboard at session end

### 5.5 — Session Infrastructure: `createdAt` Field

**Goal:** Ensure new sessions have a `createdAt` field so `cleanupExpiredSessions` can clean them up.

Since we cannot modify the pre-built presenter bundle, we have two options:
1. If the pre-built bundle already writes `createdAt` — verify and document; no action needed
2. If not — add a small `<script>` to `live-presenter.html` that patches the Firebase write to include `createdAt: Date.now()` after the session is created

Check the RTDB for existing session data to determine which option applies.

---

## Files Likely to Be Touched

| File | Why |
|------|-----|
| `js/modules/ui-manager.js` or `app.js` | Handle `?retake={quizId}` URL param (5.1) |
| `js/components/header.js` | Add Dashboard link for signed-in users (5.2) |
| `live-audience.html` | Add extension overlay for new question types (5.3/5.4) |
| `live-presenter.html` | Add new question type UI controls + timer config (5.3/5.4) |
| `functions/index.js` | Possibly add helper for leaderboard score computation if needed |
| `webpack.config.js` | Add any new HTML files to CopyPlugin if created |
| `database.rules.json` | Add `nickname` and `score` fields to participant validation if needed |

---

## Known Issues & Constraints Carried Forward

1. ~~**Phase 4 functions not yet deployed**~~ — ✅ **Resolved.** `createPortalSession` and `cleanupExpiredSessions` deployed 2026-02-28.
2. ~~**Realtime Database rules not deployed**~~ — ✅ **Resolved.** `database.rules.json` deployed 2026-02-28; RTDB instance `quizpros-default-rtdb` (`europe-west1`) provisioned.
3. **Stripe end-to-end test pending** — Full checkout → webhook → Firestore → portal flow untested. Use test card `4242 4242 4242 4242`. Infrastructure is live; just needs exercising (see 5.0).
4. **Live presenter bundle immutable** — Pre-built bundles cannot be changed without original source. New question types must be implemented as an extension layer (see 5.3/5.4).
5. **`cleanupExpiredSessions` requires `createdAt`** — Sessions created by the existing live-presenter bundle may not set this field. Verify before relying on cleanup (see 5.5).
6. **`dashboard.html` "Retake" link** — Currently links to `/?retake={quizId}` but the main app ignores this param. Implement in Step 5.1.
7. **RTDB rules JSON comments** — Deployed successfully 2026-02-28; Firebase RTDB rules engine supports `//` comments. No action needed.

---

## How to Work

1. Read the required files first (especially `CLAUDE.md` and `PHASE4_HANDOFF.md`)
2. Run the end-to-end Stripe test (5.0) before building on top of subscription/portal features
3. Use Desktop Commander to read/edit files on the machine
4. Make targeted, incremental changes
5. Edit source files (`js/`, `css/`) and run `npm run build` to regenerate `dist/`. Never edit `dist/` directly.
6. For Cloud Functions: edit `functions/index.js` then `firebase deploy --only functions`
7. For hosting changes: `npm run build && firebase deploy --only hosting`
8. Search codebase before renaming/removing anything

---

## Success Criteria

- [x] Phase 4 functions deployed (`createPortalSession`, `cleanupExpiredSessions`) ✅ 2026-02-28
- [x] RTDB rules deployed (`database.rules.json`) ✅ 2026-02-28
- [x] Brand colour audit complete — all purple replaced with `#25d366`/`#128c7e` ✅ 2026-02-28
- [ ] End-to-end Stripe test passes (checkout → webhook → Firestore → Customer Portal)
- [ ] `dashboard.html` "Retake" loads and runs the AI quiz correctly
- [ ] Dashboard link visible in main nav for signed-in users
- [ ] At least 1 new question type working in live audience view (word cloud OR rating OR true/false)
- [ ] Timer countdown visible on both presenter and audience for timed questions
- [ ] Leaderboard shows after each timed question
- [ ] `cleanupExpiredSessions` tested (or `createdAt` field confirmed present in live sessions)
- [ ] No new console errors introduced
- [ ] All existing quiz topics still function correctly
- [ ] `npm run build` succeeds without warnings
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md updated if architecture changed

---

## End-of-Phase Checklist

When all objectives are complete, before ending this session:

- [ ] Run final verification of all changes
- [ ] Update CHANGELOG.md with all Phase 5 changes (version 5.0.0)
- [ ] Update CLAUDE.md if module map, conventions, or architecture changed
- [ ] Create `docs/development/PHASE5_HANDOFF.md` — **using the Handoff Document Template in `docs/development/PROMPT_FRAMEWORK.md`**
- [ ] Create `docs/development/PHASE6_PROMPT.md` — **using the Phase Prompt Template in `docs/development/PROMPT_FRAMEWORK.md`**, incorporating all learnings from the handoff
