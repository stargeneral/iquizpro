# PHASE 14 PROMPT — Study Mode, Content Expansion & Conversion Optimisation

## Context
I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

iQuizPros is a static Firebase-hosted quiz platform (vanilla JS, IIFE modules, webpack bundle).

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, module system, conventions, all pitfalls
2. `docs/development/PHASE13_HANDOFF.md` — What changed in Phase 13
3. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, handoff/prompt templates
4. `docs/development/DEVELOPMENT_PLAN.md`

## Current State After Phase 13

- **MedEd Hub** (`meded.html`) live at `/meded` — "Do you make these psychiatry learning mistakes?"
- **2 free diagnostic quizzes** (`psych-mistakes-med-student`, `psych-mistakes-nurse`) with 8 Qs each
- **Diagnostic result routing** — `showResults()` injects mistake analysis + recommended quizzes for psych-mistakes topics
- **Per-question explanations** — already fully implemented (Phase 5B)
- **Latest bundle:** `app.03ede69d.js` / `app.6134aff4.css`
- **Unit tests:** 66 passing
- **Landing page** live at `/` (`landing.html` → `dist/index.html`)
- **Quiz SPA** at `/app` (`dist/app.html`)
- **Healthcare section** with 10 psychiatry topics (250 Qs) + 2 free diagnostic topics

## Suggested Phase 14 Goals

### 14.1 — Study Mode
Add a "Study Mode" toggle that lets users review questions without time pressure or score tracking:
- Shows all options simultaneously
- Reveals correct answer immediately on click (no "wrong" state — just highlight)
- Shows explanation immediately below
- No score tracking — purely for learning
- Progress saved to localStorage so users can resume
- Toggle accessible from the difficulty picker overlay (add a "Study Mode" button alongside "Start Quiz")

**Implementation hints:**
- Add `studyMode: false` state variable in `quiz-engine.js`
- In `selectAnswer()`: if study mode, skip score tracking, show correct answer + explanation immediately
- Add a `_isStudyMode` flag; use it in `showResults()` to show "Study Complete" instead of score
- The difficulty picker overlay (`_showDifficultyPicker`) should have a secondary "Study Mode" button

### 14.2 — Additional Quiz Category: Emergency Medicine
Add a new quiz category using the same Healthcare pattern from Phase 12.

New topics (25 questions each):
- `emerg-triage` — START triage, AVPU, primary survey, C-A-B-C-D-E assessment
- `emerg-resuscitation` — BLS/ALS, ROSC, post-arrest care, defibrillation thresholds
- `emerg-toxicology` — Common overdoses (paracetamol, TCA, opioid), antidotes, charcoal criteria
- `emerg-trauma` — Trauma triad, haemostasis, tension pneumothorax, fluid resuscitation
- `emerg-nursing` — Shock recognition, IV access, critical care handover, deteriorating patient

**Architecture:**
- Add `category: 'emergency'` to all topic objects
- Gate all 5 topics in `config.premium.gatedQuizIds` (or make 1 free)
- Add Emergency section in `ui-manager.js` (same pattern as Healthcare section)
- Add `fas fa-ambulance` icon for the section
- New question arrays in `question-bank.js`
- Add placeholder images in `assets/images/emergency/` (similar to psychiatry placeholders)

### 14.3 — MedEd Hub: Track Diagnostic Conversions
Add basic funnel tracking so we know how many diagnostic takers go on to play a recommended quiz.

- In `_injectMedEdDiagnosticResults()`, fire a GA4 `meded_diagnostic_complete` event with:
  `{ topic_id, mistakes_found, score, total }`
- On each recommended quiz link click, fire `meded_recommendation_click` with:
  `{ from_topic, to_topic }`
- Both events go through `window.QuizProsAnalytics.trackAppEvent()` (or GA4 directly via `gtag`)

### 14.4 — "Retake with Study Mode" Button
After completing a knowledge or healthcare quiz, add a secondary "Study Mode" button to the results
screen (alongside "Try Again") that restarts the quiz in study mode.

### 14.5 — Sitemap Update
Add `meded.html` and the two new diagnostic quiz deep-links to `sitemap.xml`.

### 14.6 — SEO: Dynamic Page Titles for Quiz SPA
Currently the quiz SPA (`app.html`) has a static `<title>`. After `startQuiz()`, the engine
calls `_updatePageSEO()` — extend this to also update the canonical URL so sharing via browser
address bar captures the topic:
- On quiz start: push `?topic=<topicId>` to `history.replaceState`
- On results: push `?topic=<topicId>&result=<score>-<total>`
- On return to topic selection: restore canonical URL

## Critical Architecture Notes

### ⚠️ NEVER add `async` to `firebase-auth-compat.js`
All Firebase compat scripts must remain synchronous. See CLAUDE.md Pitfall #34.

### ⚠️ CSP wildcards do not work mid-string
`https://firebase*.googleapis.com` is invalid CSP syntax. See CLAUDE.md Pitfall #35.

### Question format in `question-bank.js`
Always use `answer` (0-based integer), never `correct` (letter). See CLAUDE.md Architecture Notes.

### Diagnostic results rely on fixed question order
`_injectMedEdDiagnosticResults()` maps question position (0–7) to mistake categories.
Do NOT reorder or insert questions into `psychMistakesMedStudent` / `psychMistakesNurse`.

### Healthcare UI section pattern (Phase 12)
New category sections follow the same pattern as `healthcareQuizzes` in `ui-manager.js`.
Use `topic.category === 'emergency'` filter; add section after Healthcare section.

## End-of-Phase Deliverables

- `PHASE14_HANDOFF.md` — what changed, files modified, known issues
- `PHASE15_PROMPT.md` — next phase goals
- Updated `CLAUDE.md`
- Updated `memory/MEMORY.md`

## Environment Reminders

- Brand colours: `#25d366` / `#128c7e` — never use purple
- `answer` field is **always a 0-based integer**, never a letter like "B"
- Options are plain strings — never include "A)" / "B)" prefixes
- Admin UID: `93fNHZN5u7YLk5ITbPTHfsFYTI13`
- Shell: PowerShell on Windows
- Node: `& "C:\Program Files\nodejs\node.exe"`
- npm: `& "C:\Program Files\nodejs\npm.cmd"`
- Firebase CLI: `& "C:\Program Files\nodejs\node.exe" "C:\Users\user\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js"`
- Jest: `& "C:\Program Files\nodejs\node.exe" node_modules\jest-cli\bin\jest.js`
- Build: `& "C:\Program Files\nodejs\npm.cmd" run build`
- Always build before deploying; `dist/` is the public dir
