# PHASE 13B HANDOFF — Bug Review & Fix Plan

**Date:** 2026-03-07
**Status:** COMPLETE — all 3 bugs fixed and deployed
**Bundle:** `app.091ab80c.js` / `app.7e479268.css`
**Tests:** 66/66 passing
**Scope:** 3 user-reported bugs from post-Phase-13 testing

---

## Bug 1 — Dashboard Auth Gate Redirects to Landing Page (Not Sign-In Modal)

### Reproduction
1. Visit `https://iquizpro.com/meded` (or any page while signed out)
2. Click "Dashboard" in the nav → goes to `https://iquizpro.com/dashboard`
3. Dashboard shows the auth-gate div (correctly)
4. User clicks "Go to iQuizPros" button
5. **Bug:** lands on `https://iquizpro.com/` (landing page) — no sign-in modal

### Root Cause
**File:** `dashboard.html` line ~291

```html
<div id="auth-gate" style="display:none;">
    <i class="fas fa-lock" style="font-size:3rem;color:#25d366;"></i>
    <h2>Sign in to view your dashboard</h2>
    <p>Your quiz history, AI-generated quizzes, and subscription details are waiting for you.</p>
    <a href="/" class="btn btn-primary" style="margin-top:.5rem;">Go to iQuizPros</a>
</div>
```

The `href="/"` sends users to the landing page (`landing.html`), which has no sign-in modal. The quiz SPA is at `/app`, but even `/app` won't auto-open the sign-in modal without additional logic.

### Proposed Fix
**Option A (preferred — simplest):** Change the auth-gate to show the Firebase sign-in modal directly inside `dashboard.html`. Since `dashboard.html` already has its own inline Firebase init and `firebase.auth()`, it can call `firebase.auth().signInWithPopup(provider)` directly, or show a custom sign-in form inline.

**Option B:** Replace the `<a>` with a `<button>` that calls a local `showDashboardSignIn()` function. This function reuses `firebase.auth().signInWithEmailAndPassword` with an inline email/password form rendered into `#auth-gate`, plus a Google sign-in button using `signInWithPopup(googleProvider)`.

**Option C (least code):** Change the link to `/app?signin=1` and add a `?signin=1` handler in `app.js` that calls `QuizProsAuthManager.showSignInModal()` after the app initialises. Then redirect back to `/dashboard` after successful sign-in via `localStorage('iqp_post_signin_redirect')`.

**Recommended: Option B** — inline sign-in inside `dashboard.html`. This avoids a redirect loop and gives the user the sign-in UI immediately without leaving the dashboard.

### Files to Change
| File | Change |
|------|--------|
| `dashboard.html` | Replace auth-gate link with inline sign-in buttons (email/password form + Google button); wire to `firebase.auth()` |

---

## Bug 2 — "Start Live Session" Allows Unauthenticated/Non-Premium Users

### Reproduction
1. Visit `https://iquizpro.com/app` while signed out (or signed in as free user)
2. Click any quiz card → quiz detail screen appears
3. Click "Start Live Session" button
4. **Bug:** User is navigated directly to `live-presenter.html` with no auth or tier check

### Root Cause
**File:** `js/modules/ui-manager.js` line ~965

```javascript
<button class="quiz-action-button start-live-btn"
  onclick="window.location.href='live-presenter.html?quiz=${quizId}'">
  <i class="fas fa-wifi"></i> Start Live Session
</button>
```

No call to `QuizProsAuthManager.isSignedIn()` or `QuizProsPremium.hasTierAccess('pro')` before navigation. The live presenter page itself requires a session code but doesn't gate on subscription tier.

### Proposed Fix
Replace the inline `onclick` with a call to a new `_startLiveSession(quizId)` function defined in `ui-manager.js`. This function:

1. Checks `QuizProsAuthManager.isSignedIn()` — if false, calls `QuizProsAuthManager.showAuthModal()` to prompt sign-in
2. Checks `QuizProsPremium.hasTierAccess('pro')` — if false, calls `QuizProsPremium.showUpgradeModal('pro')` (or shows a custom "Pro feature" message)
3. Only navigates to `live-presenter.html?quiz=${quizId}` if both checks pass

```javascript
// Add to ui-manager.js public API or as private function:
function _startLiveSession(quizId) {
  if (!window.QuizProsAuthManager || !QuizProsAuthManager.isSignedIn()) {
    QuizProsAuthManager.showAuthModal();
    return;
  }
  if (!window.QuizProsPremium || !QuizProsPremium.hasTierAccess('pro')) {
    QuizProsPremium.showUpgradeModal('pro');
    return;
  }
  window.location.href = `live-presenter.html?quiz=${quizId}`;
}
```

Update the button to: `onclick="_startLiveSession('${quizId}')"` (and expose `_startLiveSession` on `window` or move it into the `QuizProsUI` public object).

**Note:** Check whether `QuizProsPremium.hasTierAccess` exists and accepts a tier argument. It may be `hasPremiumAccess()`. Verify signature in `js/modules/premium.js` before implementing. Admin users (UID `93fNHZN5u7YLk5ITbPTHfsFYTI13`) should always pass — `hasTierAccess` already returns `true` for admin.

### Files to Change
| File | Change |
|------|--------|
| `js/modules/ui-manager.js` | Add `_startLiveSession(quizId)` function; update button `onclick` |

---

## Bug 3 — Deep-Link `?topic=` from MedEd Hub Does Nothing

### Reproduction
1. Visit `https://iquizpro.com/meded`
2. Click "I'm a Medical Student" → navigates to `https://iquizpro.com/app?topic=psych-mistakes-med-student`
3. **Bug:** App loads the normal topic selection grid — the specific quiz card is not highlighted, scrolled-to, or auto-started

### Root Cause
**File:** `app.js`

`app.js` handles `?retake=`, `?generated=`, and `?embed=1&quizId=` URL params — but there is **no handler for `?topic=`**. When the URL contains `?topic=psych-mistakes-med-student`, the app renders the full topic grid and ignores the param entirely.

The section IDs already exist in `ui-manager.js`:
- `id="knowledge-section"` (line ~106)
- `id="healthcare-section"` (line ~127)
- `id="personality-section"` (line ~147)

Topic cards in the rendered HTML have `data-title` and `data-category` attributes (added in Phase 11.5 for search), but no `data-topic-id` attribute. The quiz card `onclick` uses the topicId inline: `onclick="QuizProsEngine.startQuiz('${topic.id}')"`.

### Proposed Fix
Add a `?topic=` URL param handler in `app.js`, modelled after the existing `?retake=` handler. The handler should:

1. Parse `new URLSearchParams(window.location.search).get('topic')`
2. Wait for `QuizProsUI` to finish rendering the topic grid (listen for `quizpros:ui:ready` event, or poll `#topic-selection-screen` for content)
3. Find the card for the topic — either by querying `[data-topic-id="${topicId}"]` (requires adding `data-topic-id` to cards in `ui-manager.js`) or by finding the button with `onclick` containing the topicId
4. Scroll the card into view and highlight it (add a CSS class like `topic-card--highlighted` that pulses the card border in brand green for 2s)
5. Clean the URL param with `history.replaceState` to avoid highlight re-triggering on back-navigation

**Option A — scroll + highlight only (recommended for MVP):**
- Add `data-topic-id="${topic.id}"` to each `.topic-card` in `ui-manager.js`
- Add `?topic=` IIFE in `app.js` that scrolls to the card and adds a highlight class
- Add `.topic-card--highlighted` CSS in `theme.css` (pulsing green border)

**Option B — auto-start the quiz:**
- After scroll + highlight, call `QuizProsEngine.startQuiz(topicId)` after a 600ms delay (allows user to see where they landed before quiz starts)
- This is more aggressive — may surprise users who just wanted to see the section

**Recommended: Option A** — scroll + highlight. Gives context (user sees the card in the healthcare section) without immediately starting the quiz.

### Implementation Detail — Timing
The topic grid renders asynchronously (Firebase auth state + Firestore queries may delay it). The `?topic=` handler must wait. Pattern to follow:

```javascript
// After initApp() resolves and UI is rendered:
document.addEventListener('quizpros:ui:ready', function() {
  const topicId = new URLSearchParams(window.location.search).get('topic');
  if (!topicId) return;
  const card = document.querySelector(`[data-topic-id="${topicId}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('topic-card--highlighted');
  setTimeout(() => card.classList.remove('topic-card--highlighted'), 2500);
  history.replaceState(null, '', window.location.pathname);
});
```

If `quizpros:ui:ready` event doesn't already exist, dispatch it from `ui-manager.js` at the end of `initTopicSelectionUI()`.

### Files to Change
| File | Change |
|------|--------|
| `js/modules/ui-manager.js` | Add `data-topic-id="${topic.id}"` to `.topic-card` elements; dispatch `quizpros:ui:ready` event at end of `initTopicSelectionUI()` |
| `app.js` | Add `?topic=` URL param handler IIFE |
| `css/theme.css` | Add `.topic-card--highlighted` CSS (pulsing green border animation) |

---

## Summary of Changes Required

| Bug | File(s) | Complexity |
|-----|---------|------------|
| 1 — Dashboard sign-in | `dashboard.html` | Medium — inline auth form |
| 2 — Live Session gate | `js/modules/ui-manager.js` | Low — add auth/tier check |
| 3 — Deep-link `?topic=` | `app.js`, `ui-manager.js`, `theme.css` | Medium — event + scroll |

**Build required:** Yes — all three bugs involve webpack-bundled files (`app.js`, `ui-manager.js`, `theme.css`). `dashboard.html` is standalone (CopyPlugin).

**Tests:** No new unit tests needed. Verify manually:
- Bug 1: Visit `/dashboard` signed out → click sign-in → confirm modal appears → confirm dashboard loads after sign-in
- Bug 2: Click "Start Live Session" signed out → confirm auth modal. Click as free user → confirm upgrade modal. Click as Pro → confirm navigation to `live-presenter.html`
- Bug 3: Navigate to `/app?topic=psych-mistakes-med-student` → confirm card is visible, highlighted, and scrolled into view; URL param is cleaned

---

## Architecture Notes for Implementer

- **`ui-manager.js` module**: `window.QuizProsUI` — IIFE pattern. `initTopicSelectionUI()` is the main render function. Add `data-topic-id` to the topic card HTML template inside it.
- **`app.js`**: Not an IIFE module — just top-level script. URL param handlers are implemented as IIFEs at bottom of file (search for `// RETAKE HANDLER` and `// EMBED HANDLER` patterns).
- **`dashboard.html`**: Standalone HTML with inline `<script>`. Firebase init is at bottom of file. `auth` variable is `firebase.auth()`. `provider` variable = `new firebase.auth.GoogleAuthProvider()`. `onAuthStateChanged` is already wired — just add sign-in UI to the auth-gate div.
- **`QuizProsPremium.hasTierAccess`**: Verify this method signature in `js/modules/premium.js` before implementing Bug 2 fix. It may be `hasPremiumAccess()` (boolean, no param) or `checkQuizAccess(topicId)`.
- **Brand colours**: Use `#25d366` / `#128c7e` only. Never purple.
- **Build**: `"/c/Program Files/nodejs/npm.cmd" run build` then deploy hosting.
