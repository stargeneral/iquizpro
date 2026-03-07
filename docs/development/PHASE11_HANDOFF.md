# Phase 11 Handoff — Platform Polish & Live Session Improvements

**Completed:** 2026-03-03
**Phase Status:** Complete (includes post-deploy mobile sign-in hotfix — see §11.7)

---

## What Was Done

### 11.1 — Session Archive Title from RTDB
- `setupArchiveButton()` in `live-presenter.html` now reads `sessions/{code}/title` from RTDB before writing the Firestore `sessionArchive` document.
- If the title exists and is non-empty, it is used; otherwise falls back to `'Session {code}'`.
- `dashboard.html` `renderPastSessions()` already uses `doc.data().title` — confirmed correct with the updated field.

### 11.2 — Playwright CI Integration
- Created `.github/workflows/e2e.yml` — runs on push/pull_request; uses Node 20; installs Playwright Chromium; builds app; serves `dist/` on port 5000; runs `npm run test:e2e`.

### 11.3 — Stripe Smoke Test
- Not automatically testable — this is a manual end-to-end test. Steps documented in Phase 11 prompt (test card `4242 4242 4242 4242`). Status: **pending manual verification** by developer. Carried forward to Phase 12 as a known open item.

### 11.4 — Share Session QR Overlay
- Added `#ext-share-qr-btn` (📲) floating button to `live-presenter.html` at `right:16rem`.
- Added `#ext-share-qr-overlay` — fullscreen black overlay with 400×400 QR image, readable join URL text, and ✕ close button.
- `setupShareQR()` function: opens overlay on button click, populates QR from `api.qrserver.com`, closes on ✕ click, backdrop click, or `Escape` key.
- Audience join URL format: `https://iquizpro.com/live-audience.html?code={sessionCode}`.

### 11.5 — Quiz Search / Filter on Home Page
- Added `<div class="quiz-search-bar">` with `#quiz-search-input` and `#quiz-search-clear` to the dynamically-generated topic selection HTML in `ui-manager.js` (placed above the knowledge section).
- All `.topic-card` elements now have `data-title` (lowercase topic name) and `data-category` (`'knowledge'` / `'personality'` / `'premium'`) attributes.
- `_initSearchFilter()` function: debounced (200ms) input handler shows/hides cards by matching query; shows ✕ clear button when query non-empty; injects `.quiz-no-results` paragraph when no cards match; ✕ button click resets input and re-focuses.
- CSS added to `css/theme.css`: `.quiz-search-bar`, `#quiz-search-clear`, `.quiz-no-results` — with dark mode variants.

### 11.6 — Lazy-Load Firebase Auth SDK
- `src/index.template.html`: `firebase-auth-compat.js` `<script>` tag changed to `async`.
- `js/modules/auth-manager.js`: `initialize()` now checks `typeof firebase.auth === 'function'` before proceeding. If not ready, calls `_waitForAuthAndInit(20)` which polls every 50ms up to 20 times (1000ms max). Logs warning if auth never becomes available. Auth logic extracted to `_doInitAuth()`.
- ⚠️ **The `async` attribute on `firebase-auth-compat.js` introduced a mobile sign-in regression** — see §11.7 for the root-cause diagnosis and fix. The `async` attribute was subsequently removed.

---

### 11.7 — Post-Deploy Mobile Sign-In Bug: Diagnosis & Fix

**Reported:** 2026-03-03 (same day as Phase 11 deploy)
**Fixed & deployed:** 2026-03-03
**Final bundle:** `app.2a61d3d1.js` / `css/app.6134aff4.css`

#### The Bug
After Phase 11 deployed, users on mobile (iOS Safari, Android Chrome, Android PWA) reported that sign-in appeared to hang or silently fail. The sign-in button would spin indefinitely or the modal would remain open with no feedback.

#### Diagnosis — Native Android Debug App
A **native Android WebView debug app** was built specifically to capture detailed logs from the live production site running inside a WebView. This was necessary because Chrome DevTools remote debugging cannot reliably reproduce mobile-specific auth failures.

The debug app captures:
- All JS console output (`console.log/warn/error`) via `WebChromeClient.onConsoleMessage`
- All network requests (URL, method, host) via `WebViewClient.shouldInterceptRequest`
- Auth events tagged separately from general network traffic

The debug app lives at:
```
docs/development/debug app/debug-app/    ← Android Studio project
docs/development/debug app/PHASE1_HANDOFF.md
docs/development/debug app/PHASE2_HANDOFF.md
docs/development/debug app/PHASE3_HANDOFF.md
```

It has since been generalised to work on any URL, not just iquizpro.com (Phase 3 of the debug app).

#### Root Cause 1 — `async` on `firebase-auth-compat.js`
Phase 11.6 added `async` to the `firebase-auth-compat.js` script tag. All other Firebase compat scripts (`firebase-app`, `firebase-firestore`, `firebase-database`, etc.) are **synchronous**. The auth SDK being async meant it could arrive **after** `auth-manager.js` `initialize()` ran, causing a race condition. On fast desktop connections this was invisible; on mobile networks it caused `firebase.auth()` to return `undefined` during initialisation.

**Fix:** Removed the `async` attribute from `firebase-auth-compat.js` in `src/index.template.html`.

```html
<!-- WRONG — causes mobile race condition: -->
<script src="https://www.gstatic.com/firebasejs/9.20.0/firebase-auth-compat.js" async></script>

<!-- CORRECT — must remain synchronous like all other compat scripts: -->
<script src="https://www.gstatic.com/firebasejs/9.20.0/firebase-auth-compat.js"></script>
```

**CRITICAL PITFALL:** Never add `async` to `firebase-auth-compat.js`. It is the only compat script that must remain synchronous because `auth-manager.js` accesses `firebase.auth()` immediately after the compat scripts are parsed.

#### Root Cause 2 — CSP Blocking `apis.google.com`
Device logs from the debug app showed Firebase Auth internally queuing a request to `apis.google.com` which was **blocked by the Content Security Policy**. The blocked request jammed the Firebase Auth internal op queue, causing all subsequent auth calls to hang silently.

**Fix:** Added `https://apis.google.com` to the `script-src` directive in the `<meta http-equiv="Content-Security-Policy">` tag in `src/index.template.html`.

#### Secondary CSP Fix — Invalid `connect-src` Wildcard
The debug app also revealed that `https://firebase*.googleapis.com` — used in `connect-src` — is **invalid CSP syntax**. Wildcard expansion in CSP only works for subdomains (`*.example.com`), not mid-string patterns. Chrome silently ignores the invalid entry, meaning Firestore requests were being blocked on mobile despite the apparent rule.

**Fix:** Replaced the invalid wildcard with explicit host entries:

```
# Before (invalid — silently ignored by Chrome):
https://firebase*.googleapis.com

# After (explicit, all valid):
https://firestore.googleapis.com
https://firebase.googleapis.com
https://firebaseinstallations.googleapis.com
https://identitytoolkit.googleapis.com
https://securetoken.googleapis.com
https://*.firebaseio.com
wss://*.firebaseio.com
https://*.firebasedatabase.app
wss://*.firebasedatabase.app
```

#### Additional Hardening (Deployed Alongside the Fix)

**Timeout guard on auth handlers (`auth-manager.js`):**
- `_handleSignInSubmit` and `_handleSignUpSubmit` now have a 15-second `setTimeout` — if auth hasn't resolved by then, the button is re-enabled and an error message is shown. Previously a hung auth call left the button permanently disabled.
- `.then()` handlers now call `clearTimeout()` + `_setButtonLoading(btn, false, text)` before `_closeAllModals()` — the button is restored on success, not just on error.

**Google Sign-In mobile fix (`auth-manager.js`):**
- `signInWithGoogle()` now calls `signInWithPopup` on mobile devices (`_isMobileDevice()` userAgent check) and `signInWithRedirect` on desktop.
- Popup avoids the broken redirect flow in mobile browsers and Android PWA.
- Added `_waitForAuth(3000)` guard before the Google sign-in call to handle the edge case where the auth SDK is not yet ready.

**`_waitForAuthAndInit` polling increased:**
- Polling limit raised from `20×50ms` (1 000ms) to `60×50ms` (3 000ms) as an additional safety net for slow mobile networks.

**Service Worker cache bump:**
- `sw.js` `CACHE_VERSION` bumped `v8.0 → v8.2` (two increments: one for CSP fix 1, one for CSP fix 2) to force cache invalidation on all devices.

#### Deploy Sequence

| Version | Bundle | What it fixed |
|---------|--------|---------------|
| Phase 11.0 | `app.17bd2872.js` | Phase 11 features (original deploy) |
| v11.0.1 | `app.21d5260f.js` | Timeout guard + button restore + `async` removal + CSP fix 1 |
| v11.0.2 | `app.2a61d3d1.js` | Google sign-in popup/redirect + `_waitForAuth` guard + CSP fix 2 |

Final live bundle: **`app.2a61d3d1.js` / `css/app.6134aff4.css`**

---

## Files Changed

### New Files Created
| File | Purpose |
|------|---------|
| `.github/workflows/e2e.yml` | GitHub Actions CI workflow for Playwright E2E tests |
| `docs/development/debug app/` | Native Android debug WebView app (3 build phases) |
| `docs/development/PHASE11_HANDOFF.md` | This handoff document |

### Files Modified
| File | What Changed |
|------|-------------|
| `live-presenter.html` | 11.1: RTDB title read in `setupArchiveButton()`; 11.4: `#ext-share-qr-btn` button + `#ext-share-qr-overlay` HTML + CSS + `setupShareQR()` JS |
| `js/modules/ui-manager.js` | 11.5: search bar HTML in generated output; `data-title`/`data-category` on cards; `_initSearchFilter()` function |
| `css/theme.css` | 11.5: `.quiz-search-bar`, `#quiz-search-clear`, `.quiz-no-results` styles + dark mode |
| `src/index.template.html` | 11.6 + 11.7: `async` added then **removed** from `firebase-auth-compat.js`; `apis.google.com` added to `script-src`; `connect-src` explicit Firebase host entries replacing invalid wildcard |
| `js/modules/auth-manager.js` | 11.6 + 11.7: `_doInitAuth()` extracted; `_waitForAuthAndInit()` polling raised 20→60; 15s timeout guard; `.then()` button restore; `_isMobileDevice()`; `signInWithGoogle()` popup/redirect split; `_waitForAuth(3000)` |
| `sw.js` | 11.7: `CACHE_VERSION` bumped `v8.0` → `v8.2` |
| `CHANGELOG.md` | Phase 11 changelog entry added |

### Files Removed
_(none)_

### Files Renamed
_(none)_

---

## Architecture Changes

### Module Map Updates
No new globals introduced. `_doInitAuth()`, `_waitForAuthAndInit()`, `_isMobileDevice()`, and `_waitForAuth()` are all private functions inside the `QuizProsAuthManager` IIFE.

### New Globals Introduced
_(none)_

### Globals Removed
_(none)_

---

## Breaking Changes / Pitfalls Confirmed

1. **Never add `async` to `firebase-auth-compat.js`** — All Firebase compat scripts must load synchronously. The auth SDK is the only one accessed immediately at initialisation time; making it async breaks mobile auth silently. This is now documented as Pitfall #34 in `CLAUDE.md`.

2. **`https://firebase*.googleapis.com` is invalid CSP syntax** — CSP wildcards only work as subdomain prefixes (`*.domain.com`). Mid-string or suffix wildcards are silently ignored. Always use explicit host entries.

3. **Auth submit handlers must restore the button in `.then()`** — Not just in `.catch()`. On mobile, a missing `.then()` restore leaves the button permanently disabled because `onAuthStateChanged` can take several seconds.

---

## Known Issues / Technical Debt

1. **Stripe end-to-end test pending** — Manual test with card `4242 4242 4242 4242` still not performed. Steps in Phase 11 prompt. Verify: checkout → webhook → `users/{uid}.subscription.tier === 'premium'` → `createPortalSession` works.
2. **Playwright CI first run** — `.github/workflows/e2e.yml` has never triggered in GitHub Actions. Needs a push; E2E specs may need minor selector adjustments for CI environment.
3. **Quiz search hides cards but not section headers** — When no cards in a section match, the section header remains visible. Deferred to Phase 12.
4. **Firebase Storage not initialised** — `storage.rules` (deny-all) exists but Storage not activated. Activate in Firebase Console → Storage → "Get Started", then `firebase deploy --only storage`.
5. **PWA icons are placeholders** — Replace `assets/icons/icon-192.png` / `icon-512.png` with real logo when available.
6. **vendors bundle 584 KB** — Firebase SDK size. Bundle splitting/CDN deferred (Phase 8.3).

---

## Testing Notes

- **Unit tests**: All 66 passing (3 suites: quiz-scoring, analytics, auth-manager).
- **Build**: `npm run build` clean; 2 pre-existing asset size warnings (unchanged).
- **Deployed**: Final bundle `app.2a61d3d1.js` / `css/app.6134aff4.css`, 533 files, `firebase deploy --only hosting` 2026-03-03.
- **Mobile sign-in**: Verified via native Android debug app on physical device — sign-in completes in ~900ms from button click on mobile; Firestore connects without CSP warnings.
- **E2E tests**: Not run in this session. Last known state: 3 specs from Phase 10 (quiz-flow, personality-flow, daily-challenge).

---

## Recommendations for Next Phase

- Phase 12 is Psychiatry & Medical Quiz Expansion — see `PHASE12_PROMPT.md` for full spec.
- The quiz search bar `data-category` attribute can be leveraged to filter Healthcare topics once Phase 12 adds `category: 'healthcare'` to cards — no search code change needed.
- The native Android debug app (`docs/development/debug app/`) remains a valuable regression-testing tool for any future auth or network issues — it captures logs the browser DevTools cannot reproduce on device.
- Consider hiding empty sections (not just cards) in the search filter as a quick quality improvement.

---

## Current Build State

- Bundle: `app.2a61d3d1.js` / `css/app.6134aff4.css`
- 533 dist files
- All 9 Cloud Functions deployed (unchanged from Phase 10)
- 66 unit tests passing
- Live: https://iquizpro.com / https://quizpros.web.app
