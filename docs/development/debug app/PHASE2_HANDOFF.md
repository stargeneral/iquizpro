# Phase 2 Handoff — Network Interception + Bug Resolution

## Status: Complete ✅

Phase 2 is complete. The debug app successfully intercepted all Firebase network traffic, which
led directly to diagnosing and fixing the mobile sign-in hang that was the original motivation
for building this tool.

---

## What Phase 2 Built

### `NetworkInterceptor.kt` (new file)

Singleton object called from `WebViewClient.shouldInterceptRequest`. Watches a fixed list of
hostnames and logs every matching request to `DebugLog` with `LogLevel.AUTH` (green) or
`LogLevel.NETWORK` (blue). Always returns `null` — WebView handles requests normally.

**AUTH hosts** (green): `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`
**NETWORK hosts** (blue): `firestore.googleapis.com`, `firebase.googleapis.com`,
`iquizpro.com`, `quizpros.web.app`, `quizpros.firebaseapp.com`

URLs are truncated to 140 chars for readability.

### `MainActivity.kt` change

Added `shouldInterceptRequest` override to the existing `WebViewClient`, delegating to
`NetworkInterceptor.intercept(request)`. Runs on a background thread; `DebugLog.add` is
already `@Synchronized` so no extra locking needed.

---

## What the Debug App Diagnosed

### Log evidence — the original hang

Every log before the fix showed this pattern:

```
[21:XX:XX.XXX] [JS] auth/internal-error   ← at startup (~50ms after init)
[21:XX:XX.XXX] [Auth] POST identitytoolkit.googleapis.com/v1/accounts:signInWithPassword
[21:XX:XX.XXX] [Auth] POST securetoken.googleapis.com/v1/token
...nothing more
```

Both auth network calls returned HTTP 200, but `[AUTH] Signed in` never appeared. The sign-in
promise never resolved. The button stayed on "Signing in…" forever.

### Root cause — CSP blocking `apis.google.com`

The Content Security Policy in `src/index.template.html` had this `script-src` directive:

```
https://www.gstatic.com https://*.googleapis.com ...
```

`*.googleapis.com` covers `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, etc.,
but **NOT** `apis.google.com` — that is the `google.com` domain, not `googleapis.com`.

Firebase Auth compat SDK (v9.20.0) calls `getRedirectResult()` during initialisation. That
function requires `apis.google.com/js/api.js` (gapi.js). When the browser blocked that load
via CSP, the call entered Firebase Auth's internal operation queue and **never resolved**.
Every subsequent auth operation — including `signInWithEmailAndPassword` and
`onAuthStateChanged` — queued behind it and stalled indefinitely, even though the
identitytoolkit.googleapis.com network calls themselves returned 200 OK.

The `auth/internal-error` at startup was the surface symptom of gapi.js being blocked, not
a problem with the user's credentials or the auth request itself.

### Secondary CSP bug — invalid `connect-src` wildcard

The `connect-src` directive contained `https://firebase*.googleapis.com`. This is **not valid
CSP syntax** — Chrome ignores prefix wildcards in host expressions and reports the warning:

```
The source list for the Content Security Policy directive 'connect-src' contains an invalid
source: 'https://firebase*.googleapis.com'. It will be ignored.
```

Because that entry was silently ignored, `firestore.googleapis.com` had no coverage and
Firestore was completely blocked on mobile, causing the dashboard and quiz-stats writes to
fail.

---

## Fixes Applied to the Main App

### 1. `src/index.template.html` — CSP changes (2026-03-04)

**`script-src`**: Added `https://apis.google.com`
**`frame-src`**: Added `https://apis.google.com` and `https://js.stripe.com`
**`connect-src`**: Replaced invalid `https://firebase*.googleapis.com` with:
- `https://firestore.googleapis.com`
- `https://firebase.googleapis.com`
- `https://firebaseinstallations.googleapis.com`
- `https://*.firebaseio.com` and `wss://*.firebaseio.com`
- `https://*.firebasedatabase.app` and `wss://*.firebasedatabase.app`

### 2. `sw.js` — cache version bump

`CACHE_VERSION` bumped from `v8.0` → `v8.1` (apis.google.com fix), then `v8.1` → `v8.2`
(connect-src fix), so the new `index.html` reaches devices whose service worker cached the
old one.

---

## Final Log Evidence — Bug Resolved

After deploying and clearing device cache, the 21:31 log confirmed:

- ✅ No `auth/internal-error` — gapi.js loading successfully
- ✅ No `firebase*.googleapis.com` invalid source warnings — gone completely
- ✅ Firestore connects: `POST firestore.googleapis.com/...` appears at 21:31:44
- ✅ Sign-in completes: button click → `[AUTH] Signed in` in **900ms**
- ✅ Modal closes immediately on success
- ✅ Session persists across page navigations (home → dashboard → home restores session)
- ✅ Dashboard page loads; Premium page loads

---

## Outstanding Issues (Pre-existing, Separate from Mobile Sign-in)

### 1. Missing Firestore composite index — `sessionArchive`

```
FirebaseError: [code=failed-precondition]: The query requires an index.
```

Query: `sessionArchive` collection, `presenterId ASC` + `completedAt DESC`.
**Fix**: Click the Firebase Console link included in the error message to auto-create the index.

### 2. AI quiz library — `FirebaseError: INTERNAL`

```
Could not load AI quiz library FirebaseError: INTERNAL
```

The `listUserQuizzes` callable function is throwing an unhandled server-side error on the
dashboard. The admin UID (`93fNHZN5u7YLk5ITbPTHfsFYTI13`) should have full access, so this
is likely a Cloud Function runtime issue. Investigate Cloud Function logs in Firebase Console.

---

## Acceptance Criteria — All Met

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Project builds with `./gradlew assembleDebug` — zero errors | ✅ |
| 2 | At least one `[Network]` entry for site assets on load | ✅ Multiple |
| 3 | At least one `[Auth]` entry for `identitytoolkit.googleapis.com` on sign-in | ✅ |
| 4 | Auth entries appear and sign-in completes successfully | ✅ 900ms |
| 5 | No crash or ANR with 100+ log entries | ✅ |

---

## Files Changed This Phase

| File | Change |
|------|--------|
| `debug-app/.../NetworkInterceptor.kt` | New file — network interception logic |
| `debug-app/.../MainActivity.kt` | Added `shouldInterceptRequest` to WebViewClient |
| `src/index.template.html` | CSP: added `apis.google.com` to script-src/frame-src; fixed connect-src |
| `sw.js` | CACHE_VERSION bumped to `v8.2` |
