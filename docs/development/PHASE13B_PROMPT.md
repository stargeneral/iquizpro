# PHASE 13B — Bug Fix Prompt

## Context

You are continuing development of iQuizPros, a vanilla JS quiz platform on Firebase Hosting.

**Read first:**
- `docs/development/PHASE13B_HANDOFF.md` — root causes and proposed fixes for all 3 bugs
- `CLAUDE.md` — architecture, conventions, pitfalls
- `docs/development/PHASE13_HANDOFF.md` — Phase 13 changes (MedEd Hub, diagnostic quizzes)

**Current production bundle:** `app.03ede69d.js` / `app.6134aff4.css` (Phase 13)
**Unit tests:** 66 passing (`npm test`)
**Build:** `"/c/Program Files/nodejs/npm.cmd" run build`

---

## ⚠️ CRITICAL PITFALLS — Read Before Writing Any Code

These caused real production regressions in previous phases. They apply directly to the work in this phase (Bug 1 adds auth sign-in code, Bug 2 touches auth gating). Do not repeat them.

### 1. NEVER add `async` to `firebase-auth-compat.js` (Phase 11 regression)

All Firebase compat scripts must remain **synchronous**. The auth SDK is the only one accessed immediately at `initialize()` time — making it `async` silently breaks mobile auth (sign-in hangs indefinitely on slow connections; no error is shown). This was the root cause of the Phase 11 mobile sign-in regression that required two emergency hotfixes.

```html
<!-- CORRECT — always synchronous: -->
<script src="https://www.gstatic.com/firebasejs/9.20.0/firebase-auth-compat.js"></script>

<!-- WRONG — silently breaks mobile auth: -->
<script src="https://www.gstatic.com/firebasejs/9.20.0/firebase-auth-compat.js" async></script>
```

**This phase:** Do not touch the `<script>` tags for Firebase compat SDKs in `src/index.template.html` or `dashboard.html`. If you need to add a script tag, never add `async` to Firebase compat scripts.

---

### 2. Auth submit handlers MUST restore the button in `.then()` — not just `.catch()`

When writing the Bug 1 sign-in form (email/password button in the dashboard auth gate), the submit handler **must** have both a `.then()` and a `.catch()` handler. A missing `.then()` is invisible on desktop (fast network) but leaves the button permanently disabled/spinning on mobile — sign-in appears frozen.

**Required pattern:**
```javascript
var btn = document.getElementById('dashboard-signin-btn');
var originalText = btn.textContent;
btn.disabled = true;
btn.textContent = 'Signing in…';

var timeout = setTimeout(function() {
  btn.disabled = false;
  btn.textContent = originalText;
  showError('Sign-in timed out. Please try again.');
}, 15000);

firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function() {
    clearTimeout(timeout);
    btn.disabled = false;
    btn.textContent = originalText;
    // onAuthStateChanged will handle the rest — no redirect needed
  })
  .catch(function(err) {
    clearTimeout(timeout);
    btn.disabled = false;
    btn.textContent = originalText;
    showError(err.message);
  });
```

Apply the same pattern to the Google sign-in button.

**Do NOT** call `firebase.auth().setPersistence()` inside the sign-in handler — persistence is already set globally at auth init time. Adding it again creates unnecessary latency before `signInWithEmailAndPassword` executes.

---

### 3. CSP wildcards do not work mid-string

`https://firebase*.googleapis.com` is **invalid CSP syntax** — Chrome silently ignores it. This caused Firestore requests to be blocked on mobile in Phase 11 despite the apparent rule being present.

**This phase:** Do not modify the `Content-Security-Policy` meta tag in `src/index.template.html` or `dashboard.html` unless absolutely required. If you do need to add a CSP entry, use explicit host names only:

```
# VALID — explicit subdomain wildcard:
https://*.firebaseio.com

# INVALID — silently ignored by Chrome:
https://firebase*.googleapis.com
```

The current working `connect-src` set is already in `src/index.template.html`. Do not replace explicit entries with wildcards.

---

### 4. `auth-manager.js` re-renders the header dropdown — attach listeners inside the render function

If you call any `QuizProsAuthManager` method that triggers `_updateHeaderForSignedIn()`, be aware it replaces `body.innerHTML` for the dropdown, destroying any previously attached event listeners. This is not relevant to Bug 1 (dashboard is standalone), but is relevant if you test the main app sign-in modal — all dropdown listeners must be re-attached inside `_updateHeaderForSignedIn()`, not in `header.js`.

---

### 5. Standalone pages have their own inline Firebase init — never cross-wire them

`dashboard.html`, `premium.html`, and `meded.html` each have their own inline `<script>` block that initialises Firebase independently. They do **not** load the webpack bundle. Do not call `window.QuizProsAuthManager` or `window.QuizProsPremium` from inside `dashboard.html` — those globals only exist in the main app SPA (`/app`). Bug 1's sign-in UI must use `firebase.auth()` directly.

---

### 6. Service Worker cache must be bumped after CSS changes

`sw.js` has `CACHE_VERSION = 'v8.0'` (or higher depending on current state). If you add new CSS rules to `theme.css` (Bug 3's `.topic-card--highlighted`), the new styles will be served correctly on first visit, but returning users with a cached version of `theme.css` will not see them until the SW detects an update. Bump `CACHE_VERSION` in `sw.js` if the highlight animation needs immediate visibility on all devices.

---

## Your Task

Fix **3 bugs** reported after Phase 13. Implement them in the order listed. After all fixes, build, run tests, verify manually, and write `PHASE13B_HANDOFF.md` (update it) with the final implementation details.

---

## Bug 1 — Dashboard Sign-In Gate Redirects to Landing Page

### Problem
Unauthenticated users visiting `/dashboard` see an auth gate with a "Go to iQuizPros" button. Clicking it goes to `/` (landing page) — the sign-in modal never appears. Users are stranded.

### File to change
`dashboard.html`

### Fix
Replace the static "Go to iQuizPros" link in `#auth-gate` with an inline sign-in UI. The auth gate should show:
- A "Sign in with Google" button that calls `firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())`
- An email/password form (two inputs + sign-in button) that calls `firebase.auth().signInWithEmailAndPassword(email, password)`
- Error handling for both — display error message in the gate if sign-in fails
- On success, `onAuthStateChanged` already handles showing the dashboard — no redirect needed

The existing `firebase.auth()` instance is available as `auth` in the inline script. The existing `onAuthStateChanged` listener is already wired — it shows `#auth-gate` when signed out and `#main-content` when signed in. You only need to replace the static link with working sign-in buttons.

Use brand colours: primary `#25d366`, hover `#128c7e`. Button style should match the `.btn.btn-primary` pattern already in `dashboard.html`.

**Do NOT** create a redirect to `/app?signin=1` — keep the user on `/dashboard`.

---

## Bug 2 — "Start Live Session" Ignores Auth and Tier

### Problem
The "Start Live Session" button in quiz detail screens (rendered by `ui-manager.js`) navigates directly to `live-presenter.html` with no auth or subscription check. Unauthenticated users and free-tier users can reach the live presenter page.

### File to change
`js/modules/ui-manager.js`

### Fix

1. Find the "Start Live Session" button in the topic card / quiz detail HTML template (search for `live-presenter.html` or `start-live-btn`).

2. Replace the inline `onclick` with a call to a named function. Add this function inside the `QuizProsUI` IIFE (or as a window-level function accessible from inline onclick):

```javascript
function _startLiveSession(quizId) {
  // Auth check
  if (!window.QuizProsAuthManager || !QuizProsAuthManager.isSignedIn()) {
    if (window.QuizProsAuthManager) QuizProsAuthManager.showAuthModal();
    return;
  }
  // Tier check — Live Session requires Pro or above
  // Check the actual method signature in premium.js first
  var hasPro = window.QuizProsPremium && (
    QuizProsPremium.hasTierAccess('pro') ||
    QuizProsPremium.hasTierAccess('enterprise')
  );
  if (!hasPro) {
    if (window.QuizProsPremium) QuizProsPremium.showUpgradeModal('pro');
    return;
  }
  window.location.href = 'live-presenter.html?quiz=' + quizId;
}
```

3. Update the button to use: `onclick="_startLiveSession('${quizId}')"` (or expose it on `window`).

4. **Before implementing**, read `js/modules/premium.js` to verify the exact method names for tier checking. The admin user (UID `93fNHZN5u7YLk5ITbPTHfsFYTI13`) should pass all tier checks automatically via the existing admin bypass in `premium.js`.

---

## Bug 3 — Deep-Link `?topic=` from MedEd Hub Does Nothing

### Problem
`meded.html` links to `/app?topic=psych-mistakes-med-student`. When the app loads with this URL param, it renders the generic topic selection grid without scrolling to or highlighting the specific quiz card. The user has no indication of where to look.

### Files to change
1. `js/modules/ui-manager.js` — add `data-topic-id` to `.topic-card` elements; dispatch `quizpros:ui:ready` event
2. `app.js` — add `?topic=` URL param handler
3. `css/theme.css` — add `.topic-card--highlighted` CSS

### Fix

**Step 1 — `ui-manager.js`:** In the topic card HTML template (inside `initTopicSelectionUI()` or the function that renders individual cards), add `data-topic-id="${topic.id}"` to the outer `.topic-card` element. Also at the very end of `initTopicSelectionUI()`, add:
```javascript
document.dispatchEvent(new CustomEvent('quizpros:ui:ready'));
```

**Step 2 — `app.js`:** Add a `?topic=` handler IIFE at the bottom of the file (after the existing embed and retake handlers). Pattern:
```javascript
(function() {
  var topicParam = new URLSearchParams(window.location.search).get('topic');
  if (!topicParam) return;
  // Wait for UI to render
  document.addEventListener('quizpros:ui:ready', function() {
    var card = document.querySelector('[data-topic-id="' + topicParam + '"]');
    if (!card) return;
    setTimeout(function() {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('topic-card--highlighted');
      setTimeout(function() { card.classList.remove('topic-card--highlighted'); }, 2500);
    }, 300);
    // Clean URL param without triggering reload
    history.replaceState(null, '', window.location.pathname);
  });
})();
```

**Step 3 — `theme.css`:** Add the highlight animation:
```css
.topic-card--highlighted {
  animation: topicHighlight 2.5s ease-out forwards;
  outline: 3px solid #25d366;
  outline-offset: 2px;
}

@keyframes topicHighlight {
  0%   { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
  50%  { box-shadow: 0 0 16px 8px rgba(37, 211, 102, 0.3); }
  100% { box-shadow: none; outline-color: transparent; }
}

@media (prefers-reduced-motion: reduce) {
  .topic-card--highlighted {
    animation: none;
    outline: 3px solid #25d366;
  }
}
```

---

## Verification Checklist

After implementing all 3 fixes:

### Bug 1
- [ ] Open `/dashboard` while signed out → auth gate shows with sign-in UI (not just a link)
- [ ] Sign in with Google → dashboard loads correctly
- [ ] Sign in with email/password → dashboard loads correctly
- [ ] Wrong password → error message shown in auth gate, user stays on `/dashboard`

### Bug 2
- [ ] Click "Start Live Session" while signed out → auth/sign-in modal appears
- [ ] Click "Start Live Session" as free-tier user → upgrade modal appears
- [ ] Click "Start Live Session" as Pro user → navigates to `live-presenter.html?quiz=...`
- [ ] Admin user → passes tier check, navigates directly

### Bug 3
- [ ] Navigate to `/app?topic=psych-mistakes-med-student` → page loads, card scrolls into view, green highlight animation plays
- [ ] Navigate to `/app?topic=psych-mistakes-nurse` → same behaviour for nurse card
- [ ] URL param is cleaned (`?topic=...` removed from address bar) after scroll
- [ ] Navigate to `/app` (no param) → no errors, normal topic grid renders
- [ ] Invalid topic param (`/app?topic=nonexistent`) → no errors, no visible effect

---

## Build & Deploy

```bash
# Build
"/c/Program Files/nodejs/npm.cmd" run build

# Unit tests (must all pass — 66 tests)
"/c/Program Files/nodejs/node.exe" node_modules/jest-cli/bin/jest.js

# Deploy hosting only
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting
```

If Firebase CLI auth has expired: `firebase login --reauth` first.

---

## Notes

- `dashboard.html` is standalone (no webpack bundle) — changes take effect via CopyPlugin on rebuild
- `app.js`, `ui-manager.js`, `theme.css` are webpack-bundled — always rebuild after changes
- IIFE pattern: new functions in `ui-manager.js` that need to be called from inline onclick must either be placed on `window` or on the `QuizProsUI` public API object
- Brand green only: `#25d366` / `#128c7e` — never purple or blue
- `hasTierAccess` vs `hasPremiumAccess` — verify the correct method name in `premium.js` before implementing Bug 2
- After deploy, bump `sw.js` `CACHE_VERSION` if the highlight CSS needs to be cache-busted on existing devices
- **Pitfall recap** — all critical pitfalls are documented at the top of this prompt; the most likely traps in this phase are: missing `.then()` button restore in sign-in handler (Bug 1), and accidentally adding `async` to a Firebase script tag if touching `dashboard.html` script order

---

## End of Phase 13B Deliverables

- [ ] Bug 1 fixed and verified
- [ ] Bug 2 fixed and verified
- [ ] Bug 3 fixed and verified
- [ ] `npm test` — 66 tests passing
- [ ] `npm run build` — clean build (0 errors)
- [ ] Deployed to Firebase Hosting
- [ ] Update `PHASE13B_HANDOFF.md` with actual implementation details
- [ ] Write `PHASE14_PROMPT.md` if Phase 14 work is next
