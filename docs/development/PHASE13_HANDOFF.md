# PHASE 13 HANDOFF — MedEd Hub & Diagnostic Quizzes

## What Was Built

Phase 13 added a psychiatry-focused MedEd Hub funnel (`meded.html`) with two free 8-question
diagnostic quizzes (`psych-mistakes-med-student`, `psych-mistakes-nurse`) that identify
learners' study blind spots and route them to targeted psychiatry practice quizzes.

The per-question explanation display (13.4) was already fully implemented from Phase 5B —
no code changes were needed.

---

## Changes by Task

### 13.1 — Landing Page ✅ (completed prior session)
`landing.html` built and deployed. `dist/index.html` = landing page; `dist/app.html` = quiz SPA.

### 13.2 — Question Review
Skipped — requires domain-expert human review.

### 13.3 — Additional Quiz Categories
Deferred — no new category added this phase.

### 13.4 — Per-Question Explanation Display ✅ (already done Phase 5B)
`selectAnswer()` in `quiz-engine.js` already injects `.explanation-banner` with `question.explanation`
after each answer, with a 2800ms delay before advancing. CSS in `layout.css`.

### 13.5 — Study Mode
Deferred to Phase 14.

### 13.6 — MedEd Hub Landing Page
**New file:** `meded.html`

- Standalone marketing page at `/meded` (same pattern as `landing.html`)
- Hero: "Do you make these psychiatry learning mistakes?" with dark overlay + brand green gradient
- Two CTA buttons: Medical Student → `/app?topic=psych-mistakes-med-student`, Nurse → `/app?topic=psych-mistakes-nurse`
- Benefits section: Clinical vignettes / Game-like practice / Instant feedback
- How It Works: 3-step process
- Final CTA strip (both roles)
- Inline GA4 analytics (same measurement ID: `G-0QZSJ62FJV`)
- Uses brand colours `#25d366` / `#128c7e` exclusively (no purple)

**`webpack.config.js`:** Added `{ from: 'meded.html', to: 'meded.html', noErrorOnMissing: true }` to CopyPlugin patterns.

**`firebase.json`:** Added two rewrites:
```json
{ "source": "/meded",    "destination": "/meded.html" },
{ "source": "/meded/**", "destination": "/meded.html" }
```
(Both appear before the catch-all `**` rewrite.)

**`landing.html`:** Added `<a href="/meded">MedEd Hub</a>` nav link in `.nav-links`.

### 13.7 — Two New Diagnostic Quiz Topics
**File:** `js/modules/question-bank.js`

**Two new `defaultTopics` entries** (appended after existing healthcare topics):
- `psych-mistakes-med-student` — 8 Qs, free, category: `healthcare`, icon: `fas fa-user-graduate`
- `psych-mistakes-nurse` — 8 Qs, free, category: `healthcare`, icon: `fas fa-user-nurse`

**Two new question arrays** (added before `// ─── Public API ─────`):
- `psychMistakesMedStudent` — 8 study-habits questions for med students
- `psychMistakesNurse` — 8 clinical-learning questions for psychiatric nurses
  - Both use `answer` (0-based integer index), `difficulty: 'easy'`, `category: 'healthcare'`, `explanation` field
  - All correct answers map to the most evidence-based learning behaviour (index 2 or 3)

**Two new switch cases** in `getQuestions()`:
```js
case 'psych-mistakes-med-student': return psychMistakesMedStudent;
case 'psych-mistakes-nurse':       return psychMistakesNurse;
```

### 13.8 — Diagnostic Results Routing
**File:** `js/modules/quiz-engine.js`

**New private function `_injectMedEdDiagnosticResults(topicId, answers, score, total)`:**
- Called at end of `showResults()` when `currentQuiz` is `psych-mistakes-med-student` or `psych-mistakes-nurse`
- Analyses `selectedAnswers` array to detect up to 4 mistake patterns:
  - Med student: Passive learning habit / Avoiding clinical scenarios / Not learning from wrong answers / Cramming
  - Nurse: Passive preparation habit / Skipping safe scenario practice / Avoiding medication questions / Infrequent knowledge refreshers
- Shows top 3 mistakes (or a "Strong learning approach!" card if no mistakes detected)
- Renders "Best next quizzes for you" block with 3 recommended psychiatry topic links:
  - Med students → `psych-schizophrenia`, `psych-mood`, `psych-anxiety`
  - Nurses → `psych-nursing-psychosis`, `psych-nursing-mood`, `psych-nursing-special`
- Links use `/app?topic=<id>` format, styled as hover cards with `→` arrow
- Appended into `#result-message` element; displayed ABOVE the share/PDF buttons
- All user-supplied strings are HTML-escaped via `.replace(/</g,'&lt;').replace(/>/g,'&gt;')`

---

## Test Results

- **Unit tests:** 66/66 passing (3 suites — unchanged)
- **Build:** `app.03ede69d.js` / `app.6134aff4.css` — webpack compiled with 3 pre-existing warnings, 0 errors
- **New pages in dist/:** `dist/meded.html` added via CopyPlugin

---

## Deployment Steps

```bash
# 1. Re-authenticate if needed
firebase login --reauth

# 2. Deploy hosting
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting

# 3. Deploy Cloud Functions (promptPrefix already in place from Phase 12 — redeploy if not yet done)
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only functions
```

---

## Files Modified

| File | Change |
|------|--------|
| `js/modules/question-bank.js` | +2 diagnostic topic objects, +2 question arrays (16 Qs), +2 switch cases |
| `js/modules/quiz-engine.js` | `_injectMedEdDiagnosticResults()` function; call in `showResults()` for psych-mistakes topics |
| `meded.html` | **NEW** — MedEd Hub standalone landing page |
| `webpack.config.js` | Added `meded.html` CopyPlugin entry |
| `firebase.json` | Added `/meded` and `/meded/**` rewrites |
| `landing.html` | Added MedEd Hub nav link |

---

## Known Pitfalls Added

- **`psych-mistakes-*` topics are 8 questions only** — `getRandomQuestions` will respect `questionCount: 8`; the difficulty picker will show all 8 as "easy". No special handling needed.
- **Diagnostic results rely on `selectedAnswers` index order** — The analysis maps question position (0–7) to specific mistake categories. Adding or reordering questions in `psychMistakesMedStudent` / `psychMistakesNurse` will break the analysis logic in `_injectMedEdDiagnosticResults`. Keep question order stable.
- **Recommended quiz links may hit premium gate** — The "Best next quizzes" block links to premium-gated topics. The footnote warns users; no auth changes needed.
- **`meded.html` is standalone** — Uses CDN assets only (Fonts, Font Awesome). Does NOT load the webpack bundle. No Firebase init — it's a marketing page only.
