# PHASE 13 PROMPT — Advanced Quiz Analytics & Content Expansion

## Context
I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

iQuizPros is a static Firebase-hosted quiz platform (vanilla JS, IIFE modules, webpack bundle).

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, module system, conventions, all 34+ numbered pitfalls
2. `docs/development/PHASE12_HANDOFF.md` — What changed in Phase 12 
3. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, handoff/prompt templates
4  `docs/development/DEVELOPMENT_PLAN.md`

## Current State After Phase 12 + Landing Page (Phase 13.1)

- **250 psychiatry questions** across 10 healthcare topics (5 Medical, 5 Nursing)
- **Healthcare section** in the main quiz UI, premium-gated for 8 of 10 topics
- **Psych Score Profile** — specialty result messages for `psych-*` topic IDs
- **AI generation presets** panel in `dashboard.html` with `promptPrefix` support in Cloud Function
- **Latest bundle:** `app.de279f41.js` / `app.6134aff4.css`
- **Unit tests:** 66 passing
- **All images uploaded** — 10 psychiatry images in `assets/images/psychiatry/` replaced with real artwork; all personality result images (Music Taste, Stress Response, Work-Life Balance, Travel, Love Language, Default) replaced with real artwork. No code changes needed — images are referenced by path and will be served correctly after the next `npm run build`.
- **Landing page built** (`landing.html`) — standalone marketing page; hero uses `assets/images/iquizpro4.png` (2048×2048 wide-format hero banner created by user). Quiz SPA output renamed from `index.html` → `app.html`; landing page copies to `dist/index.html` via CopyPlugin. Firebase rewrites updated. `dashboard.html` retake/generated URLs updated to `/app?…`. `header.js` links updated from `/index.html` → `/app`.
- **Deployment:** Firebase login --reauth needed before deploy

## Suggested Phase 13 Goals

### 13.1 — Landing Page ✅ COMPLETE
`landing.html` built and integrated. See `docs/development/PHASE13_LANDING_BRIEF.md` for the
full design brief. Key routing changes deployed:
- Quiz SPA: `dist/app.html` (served at `iquizpro.com/app`)
- Landing page: `dist/index.html` (served at `iquizpro.com/`)
- Hero image: `assets/images/iquizpro4.png` (wide-format 2048×2048 hero banner)

### 13.2 — Question Review / Accuracy Pass( this phase item might require human review and if so can be skipped for now)
Have a domain expert review the 250 psychiatry questions in `question-bank.js` for:
- Clinical accuracy (DSM-5 alignment for medical, NCLEX alignment for nursing)
- Answer correctness
- Explanation quality
- Difficulty calibration

### 13.3 — Additional Quiz Categories
Potential new category: **Emergency Medicine** or **Pharmacology**.
Same pattern as Healthcare: add to `defaultTopics`, add question arrays, update switch,
gate premium topics in `config.gatedQuizIds`, add UI section in `ui-manager.js`.

### 13.4 — Per-Question Explanation Display
Currently explanations are stored in `question-bank.js` but not shown to users after
answering. Add an "Explanation" panel that appears below the correct/incorrect feedback
in `quiz-engine.js`, showing `question.explanation` for knowledge quizzes.

### 13.5 — Study Mode
Add a "Study Mode" toggle that lets users review questions without time pressure:
- Shows all options simultaneously
- Reveals correct answer on click
- Shows explanation immediately
- No score tracking — purely for learning

### 13.6 — MedEd Hub Landing & "Mistakes" Diagnostics

**Purpose:** Add a psychiatry MedEd funnel using the "Do you make these mistakes...?" hook. Converts cold traffic into quiz takers via 2 free diagnostic quizzes (students + nurses) that lead to your existing 250 psychiatry questions.

**New files/routing:**
- `meded.html` → served at `/meded` (add CopyPlugin entry, Firebase rewrite)
- Link from `landing.html` hero/nav: "For Medical & Nursing" → `/meded`
- New topics in `question-bank.js` + `defaultTopics`:
  - `psych-mistakes-med-student` (8 questions, free)
  - `psych-mistakes-nurse` (8 questions, free)
- Add "MedEd Hub" section in `ui-manager.js` healthcare block (surfaces both diagnostics)

**meded.html structure** (use landing page as template):

<!DOCTYPE html> <html lang="en"> <head> <!-- your existing head --> <title>Psychiatry Learning Mistakes | iQuizPro MedEd Hub</title> </head> <body> <div class="hero-container"> <div class="hero-content"> <h1>Do you make <strong>these</strong> psychiatry learning mistakes?</h1> <p class="hero-subtitle">Take a 3-minute quiz to uncover your study or clinical learning blind spots and get tailored practice quizzes.</p>

  <div class="cta-buttons">
    <a href="/app?topic=psych-mistakes-med-student" class="btn btn-primary btn-large">
      I'm a medical student
    </a>
    <a href="/app?topic=psych-mistakes-nurse" class="btn btn-secondary btn-large">
      I'm a psychiatric nurse
    </a>
  </div>
  
  <div class="benefits-strip">
    <div class="benefit">
      <h3>Clinical vignettes</h3>
      <p>Turn passive reading into active recall using real-world cases.</p>
    </div>
    <div class="benefit">
      <h3>Game-like practice</h3>
      <p>Low-pressure scenarios that build confidence before exams or shifts.</p>
    </div>
    <div class="benefit">
      <h3>Instant feedback</h3>
      <p>Explanations so you know *why*—not just what.</p>
    </div>
  </div>
  
  <div class="trust-badges">
    <p>250+ psychiatry questions | DSM-5 aligned | Used by med students & nurses</p>
  </div>
</div>

</div> </body> </html> ```
13.8 — Diagnostic Results Routing

In quiz-engine.js results screen for psych-mistakes-* topics:

Show 2-4 "mistakes" (logic below)

Add "Best next quizzes for you" block → buttons to 2-3 existing psychiatry topics

Example: students weak on vignettes → psych-med-cases, psych-med-psychosis

Nurses weak on meds → psych-nurse-pharm, psych-nurse-risk


## 2. defaultTopics Entries

Add these to your `defaultTopics` array in `question-bank.js`:

```javascript
{
  id: "psych-mistakes-med-student",
  title: "Do you make these psychiatry study mistakes?",
  description: "Answer 8 quick questions to see which common psychiatry study mistakes you're making and get targeted practice quizzes.",
  difficulty: "easy",
  length: 8,
  premium: false,
  category: "healthcare",
  tags: ["psychiatry", "med-student", "study-skills"]
},
{
  id: "psych-mistakes-nurse",
  title: "Do you make these psychiatric nursing learning mistakes?",
  description: "Answer 8 quick questions to see where your mental health nursing knowledge and confidence could grow—then jump into targeted practice cases.",
  difficulty: "easy",
  length: 8,
  premium: false,
  category: "healthcare",
  tags: ["psychiatry", "nursing", "clinical-practice"]
}

3. Full Quiz Data: psych-mistakes-med-student
Add this array to question-bank.js:

const psychMistakesMedStudent = [
  {
    id: "q1-study-method",
    question: "How do you usually prepare for psychiatry exams?",
    options: ["Mostly read or highlight notes and textbooks", "Mix of reading and doing practice questions", "Mostly practice questions and cases with some reading", "I'm not sure / changes every time"],
    correct: 2, // C - Mostly practice questions
    explanation: "Active recall through questions beats passive reading for retention in psychiatry."
  },
  {
    id: "q2-test-frequency",
    question: "How often do you test yourself with questions during a normal study week?",
    options: ["Only in the last few days before an exam", "Once a week", "A few times per week", "Almost every day"],
    correct: 3, // D - Almost every day
    explanation: "Regular testing creates stronger memory links than sporadic cramming."
  },
  {
    id: "q3-question-type",
    question: "What type of psychiatry questions do you use most often?",
    options: ["Simple recall (definitions, lists, criteria)", "Short facts plus a few clinical scenarios", "Mostly clinical vignettes and OSCE-style questions", "I rarely use questions"],
    correct: 2, // C - Mostly clinical vignettes
    explanation: "Psychiatry exams test clinical reasoning, not trivia."
  },
  {
    id: "q4-feedback",
    question: "When you get a psychiatry question wrong, what usually happens next?",
    options: ["I move on and hope it doesn't come up again", "I quickly check the right answer but don't read explanations", "I read the explanation and update my notes", "I discuss it with a friend or mentor"],
    correct: 2, // C - Read explanation and update notes
    explanation: "Explanations turn mistakes into your most valuable learning moments."
  },
  {
    id: "q5-spacing",
    question: "How do you space your psychiatry study over time?",
    options: ["Long cramming sessions just before exams", "Mostly short sessions close to exams", "Short, regular sessions throughout the rotation", "I don't really have a pattern"],
    correct: 2, // C - Short regular sessions
    explanation: "Spaced repetition works better than massed practice for complex topics."
  },
  {
    id: "q6-confidence",
    question: "How confident do you feel applying psychiatry knowledge to real clinical scenarios?",
    options: ["I know the theory but freeze in real-life style questions", "I'm okay on simple cases but struggle with complex ones", "I'm generally confident with most cases I've practised", "I avoid thinking about it until exams or ward rounds"],
    correct: 2, // C - Generally confident
    explanation: "Confidence comes from deliberate practice with realistic cases."
  },
  {
    id: "q7-environment",
    question: "What best describes your typical learning environment for psychiatry?",
    options: ["Studying alone with notes and textbooks", "Alone with some online question banks or apps", "Regular small-group case discussions or quizzes", "Mostly lectures with little interaction"],
    correct: 2, // C - Regular small-group
    explanation: "Discussion and teaching others strengthens understanding."
  },
  {
    id: "q8-quiz-attitude",
    question: "How do you feel about quizzes and MCQs in psychiatry?",
    options: ["They're stressful and I avoid them until I have to", "They're useful, but I don't use them regularly", "They're one of my main study tools", "I enjoy them when they're case-based or game-like"],
    correct: 3, // D - Enjoy when case-based
    explanation: "When done right, quizzes feel like productive practice, not punishment."
  }
];
4. Full Quiz Data: psych-mistakes-nurse
const psychMistakesNurse = [
  {
    id: "q1-learn-method",
    question: "How do you usually learn new psychiatry/mental health content?",
    options: ["Reading protocols, guidelines, or textbooks", "Watching videos or attending lectures", "Practising with cases, scenarios, or quizzes", "Mostly learning on the job during shifts"],
    correct: 2, // C - Practising with cases
    explanation: "Practice in safe scenarios builds confidence faster than reading alone."
  },
  {
    id: "q2-scenario-practice",
    question: "Before facing a challenging situation (e.g., agitation, suicide risk), how often have you practised similar scenarios in a safe environment?",
    options: ["Almost never", "Occasionally in class or training days", "Quite regularly through simulations or quizzes", "Only during real shifts"],
    correct: 2, // C - Quite regularly
    explanation: "Simulations let you make mistakes safely before they matter."
  },
  {
    id: "q3-wrong-answer",
    question: "When you answer a psychiatry-related question incorrectly, what usually happens?",
    options: ["I feel discouraged and avoid similar questions", "I check the correct answer quickly and move on", "I read the explanation and think about how it applies to practice", "I ask a colleague or educator to clarify"],
    correct: 2, // C - Read explanation
    explanation: "Linking explanations to real practice turns errors into growth."
  },
  {
    id: "q4-med-confidence",
    question: "How confident are you with medication-related questions in mental health (doses, side-effects, interactions)?",
    options: ["Not confident at all", "Somewhat confident, but I avoid tricky questions", "Generally confident with most common medications", "Very confident, I enjoy testing myself"],
    correct: 2, // C - Generally confident
    explanation: "Regular short quizzes can build medication confidence without stress."
  },
  {
    id: "q5-refresh-frequency",
    question: "How often do you use short quizzes or scenarios to refresh your psychiatry knowledge between shifts?",
    options: ["Never", "A few times per month", "A few times per week", "Almost every day"],
    correct: 2, // C - Few times per week
    explanation: "Quick refreshers keep knowledge sharp between busy shifts."
  },
  {
    id: "q6-assessment-prep",
    question: "What best describes how you prepare for assessments or mandatory training in psychiatry?",
    options: ["Last-minute cramming", "Reading through policies and hoping for the best", "Doing practice questions or mini-tests ahead of time", "Regularly reviewing small chunks throughout the year"],
    correct: 2, // C - Practice questions
    explanation: "Regular practice makes assessments feel like a formality."
  },
  {
    id: "q7-helpful-questions",
    question: "Which type of question feels *most* helpful for your real-world work?",
    options: ["Fact recall (definitions, lists)", "Matching terms / basic MCQs", "Short clinical vignettes with decisions", "Practical 'what would you do next?' scenarios"],
    correct: 3, // D - Practical scenarios
    explanation: "Real-world nursing decisions come from scenario practice."
  },
  {
    id: "q8-quiz-feel",
    question: "How do you feel about quizzes in general?",
    options: ["They feel like an exam and I avoid them", "They're okay but often boring or irrelevant", "They help me feel safer and more prepared", "I actually enjoy them when they're realistic"],
    correct: 3, // D - Enjoy realistic
    explanation: "Realistic quizzes build practical confidence, not just test anxiety."
  }
];

5. Result Logic (for quiz-engine.js)
Add this logic to calculate mistakes (simple score per bucket):

// Example for psych-mistakes-med-student (adapt for nurse)
function calculateMedStudentMistakes(answers) {
  const mistakes = {
    passiveLearning: 0,
    noScenarios: 0,
    weakFeedback: 0,
    cramming: 0
  };

  // Passive learning (Q1=A, Q2=A, Q7=A/D)
  if (answers.q1 === 0 || answers.q2 === 0 || answers.q7 === 0 || answers.q7 === 3) mistakes.passiveLearning++;

  // No scenarios (Q3=A/D, Q6=A/B, Q8=A/B)
  if (answers.q3 === 0 || answers.q3 === 3 || answers.q6 === 0 || answers.q6 === 1 || answers.q8 === 0 || answers.q8 === 1) mistakes.noScenarios++;

  // Weak feedback (Q4=A/B)
  if (answers.q4 === 0 || answers.q4 === 1) mistakes.weakFeedback++;

  // Cramming (Q5=A/B)
  if (answers.q5 === 0 || answers.q5 === 1) mistakes.cramming++;

  return mistakes;
}

Result display (show top 2-3 mistakes with text blocks from above, then "Best next quizzes" buttons).

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






### 13.7 — Firebase Function: Deploy Updated generateQuiz
Don't forget to deploy the updated `functions/index.js` with `promptPrefix` support:
```bash
firebase login --reauth
firebase deploy --only functions
firebase deploy --only hosting
```

## End-of-Phase Deliverables

- `PHASE13_HANDOFF.md` — what changed, files modified, known issues
- `PHASE14_PROMPT.md` — next phase goals
- Updated `CLAUDE.md` —
- Updated `memory/MEMORY.md`
 
## Environment Reminders


 Brand colours: `#25d366` / `#128c7e` — never use purple
- `answer` field is **always a 0-based integer**, never a letter like "B"
- Options are plain strings — never include "A)" / "B)" prefixes
- Admin UID: `93fNHZN5u7YLk5ITbPTHfsFYTI13` — bypass already active, do not remove
- **Never add `async` to `firebase-auth-compat.js`** — mobile auth will break silently
- **Never use `https://firebase*.googleapis.com` in CSP** — invalid syntax, silently ignored
- Never rename or remove a `window.QuizPros*` global without searching the whole codebase
- All questions must be medically accurate — cite DSM-5 for medical, NCLEX blueprints for nursing
- Difficulty distribution: ~40% easy / 40% medium / 20% hard per topic


- Shell: PowerShell on Windows
- Node: `& "C:\Program Files\nodejs\node.exe"`
- npm: `& "C:\Program Files\nodejs\npm.cmd"`
- Firebase CLI: `& "C:\Program Files\nodejs\node.exe" "C:\Users\user\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js"`
- Jest: `& "C:\Program Files\nodejs\node.exe" node_modules\jest-cli\bin\jest.js`
- Build: `& "C:\Program Files\nodejs\npm.cmd" run build`
- Always build before deploying; `dist/` is the public dir
- Functions deploy may timeout on first attempt — retry once if so

