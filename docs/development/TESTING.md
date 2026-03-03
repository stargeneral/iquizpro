# iQuizPros — Testing Guide

## Overview

Tests live in `tests/unit/`. We use **Jest** with **jsdom** as the test environment and **Babel** for ES-module transpilation.

---

## Running Tests

```bash
# Run all unit tests
npm test

# Run a specific file
npx jest tests/unit/analytics.test.js

# Watch mode (re-runs on file change)
npx jest --watch
```

---

## Test Files

| File | What it covers |
|------|----------------|
| `tests/unit/quiz-scoring.test.js` | `getDominantType()` and `getScoreMessage()` from `js/modules/quiz-scoring.js` |
| `tests/unit/analytics.test.js` | All Phase 7 GA4 event methods in `js/modules/analytics.js` |

---

## Adding New Tests

1. Create `tests/unit/<module-name>.test.js`.
2. At the top, stub any global dependencies the IIFE module expects (e.g. `QuizProsConfig`, `QuizProsUtils`).
3. `require('../../path/to/module.js')` — the IIFE executes and sets `global.window.QuizProsXxx`.
4. Write `describe` / `test` blocks against the returned public API.

### Stub Pattern

```js
global.window = global;
global.QuizProsConfig = { features: {} };
global.QuizProsUtils = {
  logger: { info: () => {}, debug: () => {}, warn: () => {}, error: () => {} }
};
require('../../js/modules/some-module.js');
const mod = global.QuizProsXxx;
```

---

## Bundle Size Check

After every production build, webpack reports asset sizes. The current budget is **500 KB per asset** (set in `webpack.config.js`). If a warning appears:

1. Check which asset exceeds the threshold:
   ```bash
   npm run build 2>&1 | grep "WARNING in"
   ```
2. Identify the cause (usually a newly imported library).
3. Consider code-splitting, tree-shaking, or CDN-loading the dependency.

---

## Manual Test Checklist

Run these checks before every deployment:

- [ ] `npm run build` succeeds with no errors
- [ ] No new bundle-size warnings (or warnings are justified)
- [ ] Home page loads and topic cards render
- [ ] Knowledge quiz: start → answer all questions → see score
- [ ] Personality quiz: start → answer all questions → see result type
- [ ] Leaderboard opens on `live-presenter.html`
- [ ] Nickname overlay appears on first visit to `live-audience.html`
- [ ] Offline banner appears when DevTools → Network → Offline
- [ ] 404 page at `https://iquizpro.com/404.html` renders correctly
- [ ] GA4 DebugView shows `quiz_start` and `quiz_complete` events
- [ ] Screen reader (VoiceOver/NVDA): tab through options, confirm aria-checked updates

---

## CI (Future)

A GitHub Actions workflow (`.github/workflows/test.yml`) running `npm test` on every PR is recommended for Phase 8.
