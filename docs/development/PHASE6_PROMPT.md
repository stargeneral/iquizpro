# iQuizPros — Phase 6: Leaderboard, Stripe Verification & UX Polish

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
2. `docs/development/PHASE5C_HANDOFF.md` — What changed in the last phase (content update)
3. `docs/development/PHASE5_HANDOFF.md` — What changed in Phase 5 (live presenter)
4. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap for reference
5. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, and the handoff/prompt templates required when generating end-of-phase documents

You also have a **persistent memory file** at:
`C:\Users\user\.claude\projects\E--Programs-iquizpros-live-backup\memory\MEMORY.md`

This file is automatically loaded into your conversation context and contains deployment commands, known issues, architecture notes, and verified working features accumulated across all previous sessions.

---

## What Changed in Phase 5 + 5B (Summary)

### Phase 5 — Live Presenter Expansion
- **`src/index.template.html`** — Added `firebase-functions-compat.js` CDN script
- **`js/modules/quiz-engine.js`** — Added `startGeneratedQuiz(quizData)` public method
- **`app.js`** — Added retake URL handler IIFE (`?retake={quizId}`)
- **`js/modules/auth-manager.js`** — Dashboard link in dropdown; purple gradient fix
- **`live-audience.html`** — Extension overlay: word cloud, rating scale, true/false, countdown timer
- **`live-presenter.html`** — ⚙️ panel for question type + timer; `createdAt` patch

### Phase 5B — New Quiz Content
- **`js/modules/question-bank.js`** — 4 new knowledge topics (Technology, Sports, Music, Food), 60 new questions, `defaultTopics` + `getQuestions()` updated
- **3 new personality quiz templates** — `lifestyle/travel-personality-quiz.json`, `relationships/love-language-quiz.json`, `self-discovery/color-personality-quiz.json`
- **`js/modules/quiz-engine.js`** — Explanation/fun fact banner after answer selection (knowledge quizzes); Fisher-Yates shuffle + slice(10) question pool randomisation
- **`css/layout.css`** — `.explanation-banner` styles
- **`app.js`** — `templateFiles` extended with 3 new templates

### Current bundle
- `app.df495c83.js` / `app.d92689bb.css` — deployed 2026-02-28

### ⚠️ Known gap
- 3 new personality quiz types reference images that do not yet exist (`assets/images/adventurer-personality.webp` etc.) — results screen degrades gracefully.

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

## Step 0 — Phase 5 Deployment Status ✅ Complete

All Phase 5 work deployed 2026-02-28:
- ✅ `npm run build` — bundle `app.3c1e2f8d.js` generated
- ✅ `firebase deploy --only hosting` — 498 files, 4 new uploads

**Still to do in Phase 6** before building new features:
- End-to-end Stripe test (see 6.0 below) — still pending from Phase 5

---

## Phase 6 Objectives

### 6.0 — End-to-End Stripe Test (Critical Prerequisite)

Before building anything else, verify the full payment flow:

1. Visit `https://iquizpro.com/premium.html`, sign in, click "Get Premium"
2. Stripe checkout: card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
3. After redirect: Firebase Console → Firestore → `users/{uid}` — confirm `subscription.tier = "premium"` written by webhook
4. `dashboard.html` → verify tier badge shows "Premium" and AI generation limit is 100
5. Click "Manage Subscription" → verify Stripe Customer Portal opens with correct customer
6. In portal, cancel → verify `users/{uid}.subscription.tier` reverts to "free" after webhook fires

If webhook fails: check Firebase Console → Functions → `stripeWebhook`. Common issues: webhook secret mismatch, missing `client_reference_id` in Payment Link metadata.

### 6.1 — Live Presenter: Leaderboard

**Goal:** Show a ranked leaderboard after each timed question and as the final slide.

**Background:** The Phase 5 timer is in place. The leaderboard needs participant nicknames and cumulative scoring.

**Implementation (extension layer approach — do NOT modify pre-built bundles):**

#### Audience side (`live-audience.html` extension)
- On join (when extension detects session code), prompt for a nickname if not already stored in `localStorage` (`iqp_nickname`)
- Write nickname to `sessions/{code}/participants/{participantKey}/nickname` in RTDB
- After submitting a response to a timed question, compute local score:
  - Correct answer: `floor(timeRemaining / totalTime * 100)` points (0–100 per question)
  - Incorrect or timed-out: 0 points
- Write score delta to `sessions/{code}/participants/{participantKey}/scoreDelta_{slideIdx}`
- Cumulative score: `sessions/{code}/participants/{participantKey}/score` (increment with `.transaction()`)

#### Presenter side (`live-presenter.html` extension)
- After a timed question closes (detected via `closedAt` field or timer expiry), show a leaderboard overlay on the presenter view
- Read all `sessions/{code}/participants`, sort by `score` descending, render top 10
- Add a "Final Leaderboard" button that shows the all-time leaderboard

#### RTDB fields (extension layer)
- `sessions/{code}/participants/{key}/nickname` — string
- `sessions/{code}/participants/{key}/score` — cumulative integer
- `sessions/{code}/participants/{key}/scoreDelta_{slideIdx}` — per-question points

### 6.2 — Live Presenter: Timer Server Sync

**Goal:** Replace client-side `timerStartedAt: Date.now()` with RTDB server timestamp for accurate multi-device sync.

**Implementation:**
- When presenter clicks "Apply to Current Slide", write `timerStartedAt: firebase.database.ServerValue.TIMESTAMP` instead of `Date.now()`
- Audience extension reads `timerStartedAt` and uses RTDB's offset (`.info/serverTimeOffset`) to compute elapsed time accurately

### 6.3 — Dashboard: Retake UX Improvement

**Goal:** Instead of jumping straight into the quiz on retake, show a brief confirmation screen.

**Implementation:**
- In `app.js` retake handler: after `getGeneratedQuiz` resolves, show a modal/card with quiz title + topic + question count + "Start Quiz" button
- Only call `QuizProsEngine.startGeneratedQuiz()` when user clicks Start
- "Cancel" hides the modal and shows the topic selection screen

### 6.4 — Accessibility Pass (Core Screens)

**Goal:** Add minimum viable ARIA attributes to the most-used screens.

**Target screens (prioritised):**
- Topic selection grid — `role="list"` on container, `role="listitem"` on cards, `aria-label` on cards
- Quiz question — `aria-live="polite"` on question text; `role="radio"` on options; `aria-checked` on selected option
- Progress bar — `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

Do NOT attempt a full accessibility audit — just these three screens.

---

## Files Likely to Be Touched

| File | Why |
|------|-----|
| `live-audience.html` | Nickname prompt + scoring + leaderboard (6.1) + server timestamp (6.2) |
| `live-presenter.html` | Leaderboard overlay + server timestamp write (6.1/6.2) |
| `app.js` | Retake confirmation UX (6.3) |
| `js/modules/ui-manager.js` | Accessibility pass on topic selection (6.4) |
| `js/modules/quiz-renderer.js` | Accessibility pass on question + progress (6.4) |
| `database.rules.json` | Add `nickname` and `score` to participant validation |

---

## Known Issues & Constraints Carried Forward

1. **Stripe end-to-end test pending** — Payment infrastructure live; checkout → webhook → Firestore flow unexercised. Must complete 6.0 before building further payment features.
2. **Leaderboard not implemented** — Timer groundwork done in Phase 5; scoring + leaderboard display are Phase 6.
3. **Multi-device audience session code** — Extension uses `localStorage` (`iqp_session_code`) to pass session code from presenter to audience; only works in same browser. Multi-device join relies on the pre-built bundle's URL-based join; extension listens on `currentSlide` which works correctly cross-device once session code is known from the join URL or RTDB path.
4. **Timer sync (client-side only)** — Phase 5 timer uses `timerStartedAt: Date.now()`; accurate within the same device but can drift across different clients. Fix in 6.2.
5. **Live presenter bundle immutable** — Pre-built bundles cannot be changed. All new features via extension layer (see CLAUDE.md pitfall #19).
6. **Missing personality quiz images (Phase 5B)** — 3 new templates reference image assets that don't exist yet. Results screen degrades gracefully — but adding real WebP images would improve the results experience. Not a blocker for Phase 6.

---

## How to Work

1. Read the required files first (especially `CLAUDE.md` and `PHASE5_HANDOFF.md`)
2. Complete the Stripe end-to-end test (6.0) before building on payment features
3. Use Desktop Commander to read/edit files on the machine
4. Make targeted, incremental changes
5. Edit source files (`js/`, `css/`) and run `npm run build` to regenerate `dist/`. Never edit `dist/` directly.
6. For Cloud Functions: edit `functions/index.js` then `firebase deploy --only functions`
7. For hosting changes: `npm run build && firebase deploy --only hosting`
8. Search codebase before renaming/removing anything

---

## Success Criteria

- [ ] End-to-end Stripe test passes (checkout → webhook → Firestore → portal → cancel)
- [ ] Nickname prompt shows on first audience join
- [ ] Leaderboard displays after each timed question (presenter view)
- [ ] Final leaderboard accessible from presenter view
- [ ] Timer uses RTDB server timestamp (no client drift)
- [ ] Retake flow shows confirmation screen before starting quiz
- [ ] Topic selection grid has ARIA list/listitem roles
- [ ] Quiz question has `aria-live` + radio role on options
- [ ] Progress bar has progressbar role + aria-valuenow
- [ ] No new console errors introduced
- [ ] All existing quiz topics still function correctly
- [ ] `npm run build` succeeds without warnings
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md updated if architecture changed

---

## End-of-Phase Checklist

When all objectives are complete, before ending this session:

- [ ] Run final verification of all changes
- [ ] Update CHANGELOG.md with all Phase 6 changes (version 6.0.0)
- [ ] Update CLAUDE.md if module map, conventions, or architecture changed
- [ ] Create `docs/development/PHASE6_HANDOFF.md` — **using the Handoff Document Template in `docs/development/PROMPT_FRAMEWORK.md`**
- [ ] Create `docs/development/PHASE7_PROMPT.md` — **using the Phase Prompt Template in `docs/development/PROMPT_FRAMEWORK.md`**, incorporating all learnings from the handoff
