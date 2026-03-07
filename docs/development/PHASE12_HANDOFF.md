# PHASE 12 HANDOFF — Psychiatry & Medical Quiz Expansion

## What Was Built

Phase 12 added a full Healthcare quiz category with 250 clinically accurate questions
across 10 topics (5 Medical Psychiatry, 5 Nursing Psychiatry), a Psych Score Profile
result system, a Healthcare UI section, placeholder images, and an AI generation
presets panel with `promptPrefix` support in the Cloud Function.

---

## Changes by Task

### 12.1 — Medical Psychiatry Questions (125 Qs)
**File:** `js/modules/question-bank.js`

Added 5 question arrays, each 25 questions, DSM-5 aligned:
- `psychSchizophreniaQuestions` — psychotic disorders, dopamine hypothesis, antipsychotics, EPS, NMS
- `psychMoodQuestions` — MDD, bipolar I/II, lithium, valproate, ECT, mood stabilisers
- `psychAnxietyQuestions` — GAD, panic disorder, PTSD, OCD, social anxiety, pharmacotherapy
- `psychNeurocognitiveQuestions` — Alzheimer's, Lewy body/vascular dementia, delirium, substance use, ADHD
- `psychPersonalityDisordersQuestions` — BPD, ASPD, narcissistic, ASD, ID, DBT, cluster classification

### 12.2 — Nursing Psychiatry Questions (125 Qs)
**File:** `js/modules/question-bank.js`

Added 5 question arrays, each 25 questions, NCLEX-style (safety-first, therapeutic communication):
- `psychNursingCommunicationQuestions` — Peplau's phases, therapeutic vs non-therapeutic, legal, suicidal risk
- `psychNursingMoodQuestions` — depression/mania nursing care, SSRI patient teaching, lithium toxicity monitoring
- `psychNursingPsychosisQuestions` — NMS identification & nursing response, clozapine ANC monitoring, EPS
- `psychNursingPersonalityQuestions` — BPD limit-setting, ASPD manipulation, substance harm reduction
- `psychNursingSpecialQuestions` — safeguarding, perinatal mental health, forensic nursing, elderly, ethics

Also updated `getQuestions()` switch to include all 10 new case branches.

### 12.3 — Healthcare Category & UI
**Files:** `js/modules/question-bank.js`, `js/config.js`, `js/modules/ui-manager.js`

- Added 10 healthcare topic objects to `defaultTopics` with `category: 'healthcare'`
  - Topic IDs: `psych-schizophrenia`, `psych-mood`, `psych-anxiety`, `psych-neurocognitive`,
    `psych-personality-disorders`, `psych-nursing-communication`, `psych-nursing-mood`,
    `psych-nursing-psychosis`, `psych-nursing-personality`, `psych-nursing-special`
  - Free topics: `psych-schizophrenia`, `psych-nursing-communication`
  - Premium topics (8): all others
- Updated `config.premium.gatedQuizIds` to gate the 8 premium psych topics
- Updated `ui-manager.js`:
  - `regularQuizzes` filter now excludes `category === 'healthcare'`
  - Added `healthcareQuizzes` filter
  - Added Healthcare section (`#healthcare-section`) rendered after the Knowledge section
  - Uses `fas fa-stethoscope` icon; renders premium lock badges for gated topics

### 12.4 — Placeholder Images
**Directory:** `assets/images/psychiatry/`

10 WebP images created (800×800, brand green gradient background, white text labels):
- `psych-schizophrenia.webp`, `psych-mood.webp`, `psych-anxiety.webp`,
  `psych-neurocognitive.webp`, `psych-personality-disorders.webp`,
  `psych-nursing-communication.webp`, `psych-nursing-mood.webp`,
  `psych-nursing-psychosis.webp`, `psych-nursing-personality.webp`,
  `psych-nursing-special.webp`

### 12.5 — Psych Score Profile
**Files:** `js/modules/quiz-scoring.js`, `js/modules/quiz-renderer.js`, `js/modules/quiz-engine.js`

- `getScoreMessage(score, total, topicId)` — added optional `topicId` param (backward-compat)
  - If `topicId.startsWith('psych-')`: returns specialist result with `.title` field
  - Five psych brackets: 🧠 Brilliant Diagnostician (≥90%), 💡 Sharp Clinician (≥70%),
    📚 Developing Practitioner (≥50%), 🌱 Keen Learner (≥30%), 🎓 Beginning the Journey (<30%)
- `renderScoreResult(score, total, topicId)` — accepts `topicId`, renders `scoring.title` as `<h2>` if present
- `quiz-engine.js` — passes `currentQuiz` as `topicId` to both scoring and rendering calls
- `quiz-engine.js` — psych-specific WhatsApp share text branch:
  `I just tested my psychiatry knowledge on "${quizLabel}" — scored ${score}/${total}! ...`

### 12.6 — AI Generation Presets
**Files:** `dashboard.html`, `functions/index.js`

**dashboard.html:**
- Added `.hidden { display: none !important; }` CSS rule
- Replaced plain "Generate New" button with a toggle-able AI presets panel (`#ai-gen-panel`)
- Panel contains:
  - Preset dropdown (`#ai-preset-select`) with optgroups: Medical Psychiatry, Nursing Psychiatry
  - Custom topic input (`#ai-custom-topic`)
  - Question count select (`#ai-qcount`): 5, 10, 15, 20
  - Difficulty select (`#ai-difficulty`): easy, medium, hard
  - Generate button calling `dashboardGenerateQuiz()`
- Preset option values use `topicId|promptPrefix` pipe format
- `dashboardGenerateQuiz()` async function:
  - Parses preset or uses custom topic
  - Sets `style: 'NCLEX'` for `psych-nursing-*` topics automatically
  - Calls `fns.httpsCallable('generateQuiz')({ topic, questionCount, difficulty, style, promptPrefix })`
  - On success: redirects to `/?generated={quizId}`
  - On error: shows toast

**functions/index.js:**
- Added `promptPrefix = ''` to `generateQuiz` data destructuring
- `safePrefix = String(promptPrefix || '').slice(0, 300)` (prevents prompt injection via length)
- `fullPrompt = safePrefix ? safePrefix + '\n\n' + prompt : prompt`
- Passes `fullPrompt` (not `prompt`) to `model.generateContent()`

---

## Test Results

- **Unit tests:** 66/66 passing (3 suites: auth-manager, quiz-scoring, analytics)
- **Build:** `app.de279f41.js` — webpack compiled with 3 pre-existing warnings, 0 errors
- **Deploy:** Pending re-authentication (`firebase login --reauth` required)

---

## Deployment Steps

```bash
# 1. Re-authenticate Firebase CLI
firebase login --reauth

# 2. Deploy hosting (built dist/ is ready)
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting

# 3. Deploy updated Cloud Function (promptPrefix support)
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only functions
```

---

## Files Modified

| File | Change |
|------|--------|
| `js/modules/question-bank.js` | +250 questions, 10 topic objects, 10 switch cases |
| `js/config.js` | 8 new gatedQuizIds |
| `js/modules/ui-manager.js` | Healthcare section, filter update |
| `js/modules/quiz-scoring.js` | `topicId` param, psych profiles |
| `js/modules/quiz-renderer.js` | `topicId` param, title rendering |
| `js/modules/quiz-engine.js` | Pass `currentQuiz` to scoring/renderer, psych share text |
| `dashboard.html` | AI presets panel + `dashboardGenerateQuiz()` |
| `functions/index.js` | `promptPrefix` support |
| `assets/images/psychiatry/` | 10 new WebP placeholder images (new directory) |

---

## Known Pitfalls Added

- **`getScoreMessage` topicId param** — third param is optional for backward-compat; existing callers without it still use standard score brackets
- **`promptPrefix` 300-char cap** — enforced server-side in `generateQuiz` via `.slice(0, 300)` to prevent prompt injection; dashboard UI does not need to enforce this
- **Healthcare section requires `category: 'healthcare'`** — topics without this field continue to appear in Knowledge/Personality sections unchanged
- **Psych images are placeholders** — replace `assets/images/psychiatry/*.webp` with real clinical artwork; no code change needed
