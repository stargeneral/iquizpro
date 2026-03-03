# iQuizPros — Phase 8 Handoff

**Phase:** 8 — PWA & Security Rules Hardening (8.1 + 8.2 only; 8.3 deferred)
**Completed:** 2026-03-01
**Bundle:** `app.59cbbb09.js` / `app.6f4cc9ba.css` (built + deployed 2026-03-01)

---

## What Changed

### 8.1 — Progressive Web App

#### 8.1.1 — Web App Manifest (`manifest.json`)
- Created `manifest.json` at project root (copied to `dist/` by CopyPlugin).
- Theme colour `#25d366` (brand green), standalone display, portrait-primary orientation.
- App shortcut: "Take a Quiz → `/#quizzes`".
- Screenshot metadata pointing to `/assets/images/personality-banner.webp`.

#### 8.1.2 — App Icons (`assets/icons/`)
- `icon-192.png` and `icon-512.png` — brand-coloured placeholder icons.
- Green-to-teal gradient background (`#25d366` → `#128c7e`), rounded corners, white "Q" quiz symbol.
- Generated via Pillow (Python) using `scripts/create_placeholder_images.py` pattern.

#### 8.1.3 — Service Worker (`sw.js`)
Created `sw.js` at project root, copied to `dist/` by CopyPlugin. Strategy:

| Request type | Strategy |
|---|---|
| App shell (install) | Pre-cached on install: `/`, manifest, icons, `default-personality.webp` |
| `/templates/**` (quiz JSON) | Stale-while-revalidate |
| Navigation requests | Network-first; offline → cached `index.html` |
| Static assets (JS/CSS/images/fonts/sounds) | Cache-first; image miss → `default-personality.webp` fallback |
| Cross-origin (Firebase SDK, Google APIs) | Not intercepted |
| `sw.js` itself | Not intercepted |

**Background sync:** On `sync-quiz-history` tag, posts `{ type: 'SYNC_QUIZ_HISTORY' }` to all window clients, which triggers `_flushPendingQuizHistory()` in `app.js`.

Cache names: `iqp-shell-v8.0`, `iqp-runtime-v8.0`, `iqp-templates-v8.0`. Old cache names are cleaned on activate.

#### 8.1.4 — Service Worker Registration (`app.js`)
New function `_initServiceWorker()` called from end of `initApp()`:
- Registers `/sw.js`.
- Listens for SW `message` events → calls `_flushPendingQuizHistory()`.
- Listens for `controllerchange` → updates offline banner text to "offline (cached)".

#### 8.1.5 — Install Prompt (`app.js`)
- Captures `beforeinstallprompt` at window level (fires before DOMContentLoaded).
- Tracks `appinstalled` event via `QuizProsAnalytics.trackEvent('PWA', 'installed', ...)`.
- After first quiz completion (`quizpros:quiz:completed` event, 2 s delay), shows `#pwa-install-sheet` — a small, dismissible bottom sheet with brand styling and "Install" / × buttons.
- Dismissal stored in `localStorage('iqp_install_dismissed')` — sheet shown only once.
- Auto-dismisses after 12 seconds.

#### 8.1.6 — Background Sync Queue (`app.js`)
`_flushPendingQuizHistory()` reads `iqp_pending_history` (JSON array in localStorage), calls `QuizProsUserManager.saveQuizResult` for each entry, then clears the queue. Called on SW sync message and on app startup when online.

#### 8.1.7 — `quizpros:quiz:completed` Event (`quiz-engine.js`)
Added `document.dispatchEvent(new CustomEvent('quizpros:quiz:completed', { detail: { quizId, isPersonality } }))` just before `utils.performance.endMeasure('showResults')` in `showResults()`. Non-fatal; wrapped in try/catch.

#### 8.1.8 — HTML meta tags (`src/index.template.html`)
Added immediately after charset/viewport:
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#25d366">`
- `<meta name="mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- `<meta name="apple-mobile-web-app-title" content="iQuizPros">`
- `<link rel="apple-touch-icon" href="/assets/icons/icon-192.png">`

#### 8.1.9 — Firebase Hosting headers (`firebase.json`)
Added `sw.js` header rule (before the `**/*.@(js|css)` catch-all):
```json
{
  "source": "sw.js",
  "headers": [
    { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
    { "key": "Service-Worker-Allowed", "value": "/" }
  ]
}
```

---

### 8.2 — Firebase Security Rules Hardening

#### 8.2.1 — Firestore Rules (`firestore.rules`)

| Collection | Change |
|---|---|
| `live_sessions/.../slides` write | Now requires presenter-ID match (was any `auth != null`) |
| `live_sessions/.../responses` update | `if false` — immutable after submission |
| `live_sessions/.../aggregations` write | Now requires presenter-ID match |
| `/responses/{docId}` (top-level) update | `if false` — immutable (prevents post-submission answer manipulation) |
| `/local_quizzes` | `create` enforces `uid == auth.uid`; `read/update` require ownership |
| All public-write collections | Rate-limiting advisory comments added |

#### 8.2.2 — Storage Rules (`storage.rules`) — New File
Explicit deny-all rules. Firebase Storage is not yet used in the app; this prevents any unintended access if Storage is enabled in the Firebase Console.

**Note:** Storage rules could not be deployed because Firebase Storage has not been initialised on the `quizpros` project. To deploy once Storage is enabled:
```bash
firebase deploy --only storage
```

#### 8.2.3 — Realtime Database Rules (`database.rules.json`)
No logic changes — rules were already correct. Updated comments to document:
- Admin SDK bypass for `cleanupExpiredSessions` Cloud Function
- Phase 5C/6 fields: `resultsVisible`, `locked`, `timerStartedAt`

---

## Files Changed

| File | Change |
|---|---|
| `manifest.json` | **New** — Web App Manifest |
| `sw.js` | **New** — Service Worker |
| `storage.rules` | **New** — Explicit deny-all Storage rules |
| `assets/icons/icon-192.png` | **New** — 192×192 app icon |
| `assets/icons/icon-512.png` | **New** — 512×512 app icon |
| `app.js` | SW registration, install prompt, `_flushPendingQuizHistory`, `_showInstallPromptSheet`, `_initServiceWorker` |
| `js/modules/quiz-engine.js` | `quizpros:quiz:completed` event dispatch in `showResults()` |
| `src/index.template.html` | PWA meta tags + manifest link |
| `webpack.config.js` | CopyPlugin: `manifest.json`, `sw.js` |
| `firebase.json` | `sw.js` no-cache header; `storage.rules` config; `Service-Worker-Allowed` header |
| `firestore.rules` | Presenter-ID checks on slides/aggregations write; response immutability; local_quizzes ownership; rate-limit comments |
| `database.rules.json` | Comments updated (Admin SDK bypass, Phase 5C/6 fields) |
| `CHANGELOG.md` | v8.0.0 entry |
| `CLAUDE.md` | Bundle hash, pitfalls, status updates |

---

## Known Issues / Carry-forwards

- **Firebase Storage not initialised** — `storage.rules` file exists and is ready, but cannot be deployed until the user visits Firebase Console → Storage → "Get Started". Then run `firebase deploy --only storage`.
- **Phase 8.3 (Performance & Bundle) deferred** — The `vendors.*.js` bundle is still 584 KB (pre-existing Firebase SDK size). Deferred by user agreement.
- **Stripe end-to-end test** — Still pending. Card `4242 4242 4242 4242`.
- **Music Taste / Stress Response / Work-Life Balance images** — Still missing placeholder images for these 3 personality quiz types.
- **Zodiac images** — Several JPEGs in `assets/images/zodiac/jpeg assets/` exceed 700 KB. Noted as pre-existing; no immediate fix planned.
- **Real app icons** — The 192/512 icons are branded placeholders. Proper icons with the iQuizPros logo should replace them when available.

---

## Test Status

- **66 Jest unit tests** — 3 suites, all passing post-implementation.
- Build: `webpack 5 compiled with 2 warnings` (pre-existing size warnings, no errors).
- Deploy: 520 files, 6 new uploads. Hosting, Firestore rules, and RTDB rules deployed.

---

## Next: Phase 9 (if applicable)

See `docs/development/PHASE9_PROMPT.md`.
