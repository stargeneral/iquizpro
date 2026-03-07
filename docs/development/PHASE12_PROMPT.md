# iQuizPros — Phase 12: Psychiatry & Medical Quiz Expansion

## Project Context

I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, module system, conventions, all 34+ numbered pitfalls
2. `docs/development/PHASE11_HANDOFF.md` — What changed in Phase 11 (including the post-deploy sign-in bug fix in §11.7), files modified, known issues
3. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap; Phase 12 section for context
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, handoff/prompt templates

---

## What Changed in Phase 11 (Summary)

### 11.1 — Session Archive Title from RTDB
- `live-presenter.html` `setupArchiveButton()` reads `sessions/{code}/title` from RTDB before archiving; falls back to `'Session {code}'`

### 11.2 — Playwright CI
- `.github/workflows/e2e.yml` created — GitHub Actions runs Playwright E2E on every push/PR

### 11.4 — Share Session QR Overlay
- `live-presenter.html`: `📲` floating button + fullscreen black QR overlay with audience join URL; closes on ✕ / Escape

### 11.5 — Quiz Search / Filter
- `js/modules/ui-manager.js`: `#quiz-search-input` bar + `_initSearchFilter()` — debounced (200ms), filters `.topic-card` by `data-title`/`data-category`; ✕ clear; no-results message
- `css/theme.css`: search bar styles + dark mode

### 11.6 — Lazy-Load Firebase Auth SDK (PARTIALLY REVERTED — see 11.7)
- `src/index.template.html`: `firebase-auth-compat.js` was changed to `async`
- `js/modules/auth-manager.js`: `_waitForAuthAndInit(20)` polling guard added
- ⚠️ The `async` attribute introduced a mobile regression and was subsequently removed in §11.7.

### 11.7 — Post-Deploy Mobile Sign-In Bug: Diagnosis & Fix ⭐
This was the most significant work of the post-Phase-11 period. A native Android debug app was built to diagnose a mobile sign-in failure that could not be reproduced in browser DevTools.

**Debug app location:** `docs/development/debug app/debug-app/` (Android Studio project, 3 build phases)

**Root causes found and fixed:**

1. **`async` on `firebase-auth-compat.js` (Phase 11.6 regression):** The auth SDK arriving asynchronously caused a race condition — `auth-manager.js` would call `firebase.auth()` before the SDK had parsed. On fast desktop connections: invisible. On mobile: silent hang. **Fix:** `async` attribute removed. This is now Pitfall #34 in CLAUDE.md — **never add `async` to `firebase-auth-compat.js`.**

2. **CSP blocking `apis.google.com`:** Firebase Auth internally requests `apis.google.com` to initialise its op queue. The CSP `script-src` didn't include it, so the request was blocked and all subsequent auth calls hung silently. **Fix:** `https://apis.google.com` added to `script-src`.

3. **Invalid `connect-src` wildcard:** `https://firebase*.googleapis.com` is syntactically invalid CSP — wildcards only work as subdomain prefixes. Chrome silently ignored it, so Firestore was actually blocked on mobile. **Fix:** Replaced with explicit host entries (`https://firestore.googleapis.com`, `https://firebase.googleapis.com`, `https://firebaseinstallations.googleapis.com`, `wss://*.firebaseio.com`, etc.).

**Additional hardening applied:**
- Auth handlers now have a 15-second timeout guard + button restore in `.then()` (not just `.catch()`)
- `signInWithGoogle()` uses `signInWithPopup` on mobile, `signInWithRedirect` on desktop
- `_waitForAuthAndInit` polling raised from 20×50ms to 60×50ms (3s)
- SW cache bumped `v8.0 → v8.2`

**Current state (post Phase 11 + all hotfixes, deployed 2026-03-03):**
- Bundle: `app.2a61d3d1.js` / `css/app.6134aff4.css`
- 533 dist files; all 9 Cloud Functions deployed; 66 unit tests passing
- Admin UID `93fNHZN5u7YLk5ITbPTHfsFYTI13` set in `admin.html`, `js/config.js`, `functions/index.js`
- Admin bypass active in `premium.js` and Cloud Functions (no rate limits, enterprise tier)
- Mobile sign-in working — confirmed via native Android debug app on physical device
- Stripe E2E test still pending (manual)

---

## Phase 12 Goal: Psychiatry & Medical Quiz Expansion

Add a professional-grade **Medical Psychiatry** (doctor-focused, DSM-5 aligned) and **Nursing Psychiatry** (NCLEX-style, care-focused) quiz section — 250+ questions across 10 sub-categories, a new "🏥 Healthcare" category tab, "Psych Score Profile" result messages, AI generation presets for psychiatry, and premium gating for advanced categories.

This makes iQuizPros uniquely valuable to healthcare professionals, medical students, and nursing candidates.

---

## Critical Architecture Notes — Read Before Writing Any Code

### ⚠️ NEVER add `async` to `firebase-auth-compat.js` (Pitfall #34)
All Firebase compat scripts must remain synchronous. The auth SDK is the only one accessed immediately at `initialize()` time — making it async silently breaks mobile auth. This was the root cause of the Phase 11 mobile sign-in regression.

```html
<!-- CORRECT — always synchronous: -->
<script src="https://www.gstatic.com/firebasejs/9.20.0/firebase-auth-compat.js"></script>

<!-- WRONG — breaks mobile: -->
<script src="https://www.gstatic.com/firebasejs/9.20.0/firebase-auth-compat.js" async></script>
```

### ⚠️ CSP wildcards do not work mid-string (Pitfall #35)
`https://firebase*.googleapis.com` is invalid CSP syntax — Chrome silently ignores it. Always use explicit host entries for Firebase services. The current working `connect-src` set is in `src/index.template.html`.

### Auth submit handlers must restore the button in `.then()` (not just `.catch()`)
`_handleSignInSubmit` and `_handleSignUpSubmit` must call `_setButtonLoading(btn, false, text)` + `clearTimeout()` inside the `.then()` handler before `_closeAllModals()`. A missing `.then()` restore is invisible on desktop (fast network) but leaves the button permanently disabled on mobile.

### Question format in `question-bank.js`
**IMPORTANT:** iQuizPros uses `answer` as a **0-based integer index**, NOT a letter. Options are plain strings, no "A)" prefix.

```javascript
// CORRECT iQuizPros format:
{
  question: 'A 28-year-old male hears voices commanding self-harm. Best initial treatment?',
  options: ['Lithium', 'Haloperidol', 'Fluoxetine', 'Lorazepam'],
  answer: 1,            // ← integer index (Haloperidol = index 1)
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
  explanation: 'Command hallucinations indicate acute psychosis. Haloperidol, a high-potency typical antipsychotic, provides rapid symptom control.',
  tags: ['psychosis', 'schizophrenia', 'antipsychotics'],
  category: 'medical-psychiatry'
}

// WRONG — never use letter format:
{ correct: 'B', options: ['A) Lithium', 'B) Haloperidol', ...] }
```

### How question-bank.js works
- `js/modules/question-bank.js` exports `window.QuizProsQuestionBank`
- Questions stored as arrays keyed by topic ID: `questionBank['psych-schizophrenia'] = [...]`
- `getRandomQuestions(topicId, count, difficulty)` draws a random subset per attempt
- `difficulty: 'all'` = no filter; `'easy'`/`'medium'`/`'hard'` = filtered subset

### How topics.js works
- `js/modules/topics.js` owns the `topics[]` array (thin facade over question-bank.js)
- Each topic object: `{ id, name, category, image, description, questionCount, isPremium }`
- Category tabs in the UI filter by `topic.category` — add `category: 'healthcare'` to new topics
- The "Healthcare" tab needs adding to `src/index.template.html` category tabs section
- The Phase 11.5 search filter already handles `data-category="healthcare"` — no search code change needed

### How question images work
- Images stored as WebP in `assets/images/` — max 800×800px
- Topic card image: `topic.image` field references path relative to `assets/images/`
- For new psychiatry topics use: `assets/images/psychiatry/psych-[id].webp` (create placeholders)
- CopyPlugin in `webpack.config.js` already copies all of `assets/` to `dist/` — no config change needed

### Premium gating
- `config.premium.gatedQuizIds` array in `js/config.js` lists topic IDs that require paid tier
- `quiz-engine.js` checks `QuizProsPremium.checkQuizAccess(topicId)` before starting
- Admin (`93fNHZN5u7YLk5ITbPTHfsFYTI13`) bypasses all gates automatically

### AI generation (Cloud Functions)
- `functions/index.js` `generateQuiz` callable — accepts `{ topic, questionCount, difficulty, style }`
- Adding a `promptPrefix` field to the data lets the function inject specialized instructions into the Gemini prompt
- Admin has no rate limit on AI generation

---

## Development Tool — Native Android Debug App

A native Android WebView debug app exists at:
```
docs/development/debug app/debug-app/    ← Android Studio project
```

Use it whenever a bug is suspected to be mobile-specific or network-related. It captures:
- All JS console output (including errors hidden from remote DevTools)
- All network requests with host, method, and Firebase service category
- Auth events, RTDB events, Functions calls — all tagged separately

Build: open in Android Studio → Build APK, or run:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-18.0.1.1"; .\gradlew.bat assembleDebug
```
APK: `app\build\outputs\apk\debug\app-debug.apk`

---

## Tasks — Implement in Order

### 12.1 — Medical Psychiatry Question Bank (Doctor-Focused, DSM-5 Aligned)

Add to `js/modules/question-bank.js`. 25 questions per sub-category = 125 total.

**Sub-categories and topic IDs:**

| Topic ID | Name | Clinical Focus |
|----------|------|---------------|
| `psych-schizophrenia` | Schizophrenia & Psychosis | Delusions, hallucinations, first-rank symptoms, antipsychotics, negative vs positive symptoms |
| `psych-mood` | Mood Disorders | Depressive/Bipolar DSM-5 criteria, mood stabilisers, ECT, suicide risk assessment |
| `psych-anxiety` | Anxiety, OCD & Trauma | GAD, PTSD, OCD, exposure therapy, SSRIs/SNRIs, medical differentials |
| `psych-neurocognitive` | Neurocognitive & Substance | Dementia subtypes (Alzheimer's vs Lewy body vs FTD), addiction, withdrawal syndromes, detox pharmacology |
| `psych-personality` | Personality & Neurodevelopmental | BPD, NPD, antisocial PD, ADHD/autism spectrum across lifespan, DBT/CBT indications |

**Difficulty target per category:** 40% easy / 40% medium / 20% hard

**Quality standards:**
- DSM-5 aligned — all diagnostic criteria must match DSM-5 (not ICD-10 unless specified)
- Explanations cite the mechanism, not just the fact ("Haloperidol blocks D2 receptors, reducing positive psychotic symptoms")
- Wrong answer distractors should be clinically plausible (commonly confused drugs/diagnoses)
- No made-up drug doses — use standard reference ranges

### 12.2 — Nursing Psychiatry Question Bank (NCLEX-Style, Care-Focused)

Add to `question-bank.js`. 25 questions per sub-category = 125 total. NCLEX priority framework (safety first, therapeutic communication, least restrictive).

**Sub-categories and topic IDs:**

| Topic ID | Name | Care Focus |
|----------|------|-----------|
| `psych-nursing-communication` | Therapeutic Communication & Safety | De-escalation, suicide assessment (Columbia Scale), Milieu therapy, seclusion/restraint criteria |
| `psych-nursing-mood` | Mood & Anxiety Nursing Care | Mania nursing interventions, panic attack management, lithium toxicity signs & levels, patient teaching |
| `psych-nursing-psychosis` | Psychotic Disorders & Medications | EPS types (acute dystonia, akathisia, parkinsonism, TD), clozapine WBC monitoring, ECT pre/post care |
| `psych-nursing-personality` | Personality & Substance Disorders | Limit-setting with BPD, detox protocols (alcohol/opioid/benzo), motivational interviewing approach |
| `psych-nursing-special` | Special Populations & Ethics | Eating disorder physical monitoring, child/adolescent psych, involuntary admission, confidentiality, restraint documentation |

**NCLEX style notes:**
- Questions ask "Priority nursing action" or "Best response" — phrased from nurse's perspective
- Use "select all that apply" sparingly (hard to render in current quiz engine — stick to single-answer)
- Safety questions always prioritise physical safety over therapeutic goals

### 12.3 — "Healthcare" Category Tab + Topic Registration

**In `js/modules/topics.js`**, add 10 new topic objects to the `topics` array:

```javascript
{
  id: 'psych-schizophrenia',
  name: 'Schizophrenia & Psychosis',
  category: 'healthcare',
  description: 'DSM-5 psychotic disorders, antipsychotics, and differential diagnosis.',
  image: 'assets/images/psychiatry/psych-schizophrenia.webp',
  questionCount: 25,
  isPremium: false   // taster topic — free
},
{
  id: 'psych-mood',
  name: 'Mood Disorders',
  category: 'healthcare',
  description: 'Depressive and bipolar disorders — DSM-5 criteria, ECT, and pharmacotherapy.',
  image: 'assets/images/psychiatry/psych-mood.webp',
  questionCount: 25,
  isPremium: true    // premium gate
},
// ... repeat for all 10 topics
```

**Free topics (tasters):** `psych-schizophrenia`, `psych-nursing-communication`
**Premium topics:** all remaining 8

**In `js/config.js`**, add the 8 premium topic IDs to `config.premium.gatedQuizIds`.

**In `src/index.template.html`**, add Healthcare tab to the category tabs:
```html
<button class="category-tab" data-category="healthcare">🏥 Healthcare</button>
```
Place it after the existing last category tab (before the closing `</div>` of the tabs container).

### 12.4 — Placeholder WebP Images

Create `assets/images/psychiatry/` directory. Add 10 placeholder WebP images (800×800px, brand green `#25d366` background, white icon/text label). One per topic:

```
psych-schizophrenia.webp   — brain icon or abstract neural pattern
psych-mood.webp            — mood/emotion icon
psych-anxiety.webp         — calming/waves icon
psych-neurocognitive.webp  — memory/brain icon
psych-personality.webp     — person silhouette icon
psych-nursing-communication.webp  — speech bubble icon
psych-nursing-mood.webp           — heart + medication icon
psych-nursing-psychosis.webp      — pill/tablet icon
psych-nursing-personality.webp    — handshake icon
psych-nursing-special.webp        — family/group icon
```

Use the same approach as existing placeholder images (solid green background, white text label is fine as a placeholder until real images are provided).

### 12.5 — "Psych Score Profile" Result Messages

In `js/modules/quiz-scoring.js`, extend `getScoreMessage()` to recognise psychiatry topic IDs and return specialty messages:

```javascript
// If topicId starts with 'psych-', use psychiatry messages:
const psychTopics = ['psych-schizophrenia','psych-mood','psych-anxiety','psych-neurocognitive',
  'psych-personality','psych-nursing-communication','psych-nursing-mood',
  'psych-nursing-psychosis','psych-nursing-personality','psych-nursing-special'];

if (psychTopics.includes(topicId)) {
  if (percentage >= 90) return { title: '🧠 Brilliant Diagnostician', message: 'You think like a seasoned psychiatrist! Top-tier clinical reasoning.' };
  if (percentage >= 70) return { title: '💡 Sharp Clinician', message: 'Strong foundations. Keep building your clinical expertise!' };
  if (percentage >= 50) return { title: '📚 Developing Practitioner', message: 'You\'re on the right path. Review your pharmacology and DSM-5 criteria.' };
  if (percentage >= 30) return { title: '🌱 Keen Learner', message: 'Great start for a challenging field. Study those mechanisms!' };
  return { title: '🎓 Beginning the Journey', message: 'Psychiatry is complex — keep studying and you\'ll get there!' };
}
```

Also add fun WhatsApp share text for psychiatry topics in `quiz-engine.js` share handler:
- "I scored {score}% on the {topicName} quiz! 🧠 Think you can beat me? Test your clinical knowledge at iquizpro.com"

### 12.6 — AI Generation Presets for Psychiatry

In the AI quiz generation UI (wherever `generateQuiz` is called from in the frontend), add a **"Subject Presets"** `<select>` dropdown with options:

```
-- Select a preset (optional) --
🧠 Medical Psychiatry — DSM-5 MCQs
💊 Nursing Psychiatry — NCLEX Style
🦠 General Medicine — Clinical Cases
📖 Anatomy & Physiology
🧪 Pharmacology
```

When a preset is selected, it:
1. Pre-fills the topic input field with the preset name
2. Sets `difficulty` to `'medium'`
3. Passes a `promptPrefix` string in the `generateQuiz` data payload

In `functions/index.js` `generateQuiz`, read `data.promptPrefix` and prepend it to the Gemini prompt:

```javascript
const promptPrefix = (data.promptPrefix || '').slice(0, 300); // cap at 300 chars for safety
const fullPrompt = promptPrefix ? `${promptPrefix}\n\n${prompt}` : prompt;
```

Preset prompt prefixes (stored client-side in config or UI):
- Medical Psychiatry: `"Generate DSM-5 aligned multiple-choice questions for medical doctors. Focus on diagnosis, pharmacotherapy, and clinical presentation. Include realistic case vignettes. Explain why wrong answers are tempting."`
- Nursing Psychiatry: `"Generate NCLEX-style multiple-choice questions for nursing students. Focus on nursing interventions, patient safety, therapeutic communication, and medication monitoring. Use priority-based clinical reasoning."`

### 12.7 — Build, Test & Deploy

```bash
# Build
npm run build

# Unit tests (must stay at 66 passing)
npm test

# Deploy
firebase deploy --only hosting
```

---

## Acceptance Criteria

- [ ] 125 Medical Psychiatry questions in `question-bank.js` across 5 topic IDs
- [ ] 125 Nursing Psychiatry questions in `question-bank.js` across 5 topic IDs
- [ ] "🏥 Healthcare" tab visible on home page; filters to show 10 psychiatry topics
- [ ] 2 free taster topics work without login; 8 premium topics show upgrade modal for free users
- [ ] Admin account bypasses premium gate on all psychiatry topics
- [ ] "Psych Score Profile" result titles appear for all psychiatry quiz completions
- [ ] AI generation presets dropdown appears; selecting a preset pre-fills topic and sends `promptPrefix`
- [ ] 10 placeholder WebP images exist in `assets/images/psychiatry/`
- [ ] 66 unit tests still passing after all changes
- [ ] Build succeeds with no new errors

---

## End-of-Phase Deliverables

- `PHASE12_HANDOFF.md` — what changed, files modified, known issues
- `PHASE13_PROMPT.md` — next phase goals
- Updated `CLAUDE.md` — add Healthcare category, psychiatry question bank keys, promptPrefix field, Pitfalls #34 and #35 if not already present
- Updated `memory/MEMORY.md`

---

## Rules

- Brand colours: `#25d366` / `#128c7e` — never use purple
- `answer` field is **always a 0-based integer**, never a letter like "B"
- Options are plain strings — never include "A)" / "B)" prefixes
- Admin UID: `93fNHZN5u7YLk5ITbPTHfsFYTI13` — bypass already active, do not remove
- **Never add `async` to `firebase-auth-compat.js`** — mobile auth will break silently
- **Never use `https://firebase*.googleapis.com` in CSP** — invalid syntax, silently ignored
- Never rename or remove a `window.QuizPros*` global without searching the whole codebase
- All questions must be medically accurate — cite DSM-5 for medical, NCLEX blueprints for nursing
- Difficulty distribution: ~40% easy / 40% medium / 20% hard per topic
- Use full paths: `/c/Program Files/nodejs/node.exe` and `/c/Program Files/nodejs/npm.cmd`
- Firebase deploy: `"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting`
- Functions deploy may timeout on first attempt — retry once if so
