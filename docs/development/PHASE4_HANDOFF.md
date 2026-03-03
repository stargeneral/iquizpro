# Phase 4 Handoff — Dashboard, Subscription Management & Infrastructure

**Completed:** 2026-02-28
**Phase Status:** Partial — 4.2 (dashboard), 4.5 (portal), 4.6 (database rules + cleanup) complete. 4.3/4.4 (live presenter new question types, timer, leaderboard) deferred to Phase 5 due to pre-built bundle constraint.

**Post-Phase Addition:** Full brand colour audit completed in same session — all purple removed codebase-wide. See section below.

---

## What Was Done

### 4.1 — Firestore Security Rules
**Status: ✅ Already deployed in Phase 3.1** — No changes needed. `firestore.rules` covers all required collections: `_health`, `live_sessions`, `generatedQuizzes`, `users/{uid}/usage`, `users/{uid}/quizHistory`, `users/{uid}/subscription`.

### 4.2 — Premium Dashboard Page
- Built `dashboard.html` — standalone HTML page (inline Firebase init + CDN SDKs, matching `premium.html` pattern)
- Auth-gated: shows spinner while Firebase auth resolves; shows sign-in prompt if unauthenticated; loads full dashboard for signed-in users
- **Subscription panel**: tier badge, "Manage Subscription" button (paid users → calls `createPortalSession`) or "Upgrade Plan" link (free users → `/premium.html`)
- **AI usage stats**: calls `getUserUsageStats` Cloud Function to show used/limit/remaining stat tiles + animated usage bar (amber/red at 80%+, green for unlimited)
- **Score trend**: CSS bar chart (no library dependency) for last 10 scored quiz results
- **Quiz history**: last 20 from `users/{uid}/quizHistory` Firestore, colour-coded score badges (green ≥80%, amber ≥50%, red <50%, blue for personality)
- **AI quiz library**: grid cards via `listUserQuizzes` Cloud Function; each card has Retake (→ `/?retake={id}`) and Delete (→ `deleteGeneratedQuiz` Cloud Function) buttons
- Matches `premium.html` visual style (gradient header, card layout, brand colours)
- Added to `webpack.config.js` CopyPlugin so it is copied to `dist/` on every build

### 4.5 — Subscription Management (Stripe Customer Portal)
- Added `createPortalSession` callable Cloud Function to `functions/index.js`:
  - Reads `stripeCustomerId` from `users/{uid}.subscription.stripeCustomerId` (map field, consistent with how `stripeWebhook` writes it)
  - Creates a Stripe Customer Portal session via `stripe.billingPortal.sessions.create()`
  - Returns `{ url }` for client-side redirect; `returnUrl` defaults to `https://iquizpro.com/dashboard.html`
  - Throws `not-found` if no `stripeCustomerId` on record
- Wired up "Manage Subscription" button in `dashboard.html` that calls `createPortalSession` and redirects

### 4.6 — Session Infrastructure
- **`database.rules.json`** created — Realtime Database security rules for live presenter sessions:
  - `sessions/{code}`: public read (audience joins without auth); authenticated write; only presenter (matched by `presenterId` field) can update/delete the session root
  - `questions/{idx}`: read by all, write by presenter only
  - `participants/{uid}`: write by anyone (audience may not have Firebase auth); presenter reads all; participant reads own
  - `responses/{key}`: no-overwrite enforcement (can't resubmit); validates `slideIndex`, `value`, `submittedAt` fields; presenter can override
- **`firebase.json`** updated with `"database": { "rules": "database.rules.json" }` block
- **`cleanupExpiredSessions`** scheduled Cloud Function added to `functions/index.js`:
  - Runs daily via `functions.pubsub.schedule('every 24 hours').timeZone('Europe/London')`
  - Deletes RTDB sessions at `sessions/{code}` with `createdAt` (unix ms) older than 24 hours
  - **Requires** session documents to have a `createdAt` field set on creation by the live presenter

### 4.3 & 4.4 — Live Presenter New Question Types / Timer / Leaderboard
**Status: DEFERRED to Phase 5.** The `live-presenter` webpack bundles are pre-built and their source is unavailable in this repository. Changes cannot be made without the original source project. This is a hard constraint documented in CLAUDE.md.

---

## Post-Phase Colour Audit (v4.2.0)

Completed in the same session, after all Phase 4 deployments were live. This establishes a definitive brand colour standard.

**Brand green: `#25d366` / dark green: `#128c7e`** — these must be used everywhere. Never reintroduce purple.

### Files changed in colour audit

| File | What changed |
|------|-------------|
| `premium.html` | All `#667eea`/`#764ba2` (purple) → `#25d366`/`#128c7e` (brand green) |
| `dashboard.html` | All `#667eea`/`#764ba2` → `#25d366`/`#128c7e` |
| `css/theme.css` | `--primary-color` aligned to `#25d366`; `--secondary-color` family changed from purple to green |
| `css/quiz-detail.css` | Header gradient, info icons, "Start Live" button: `#667eea`/`#764ba2` → brand green |
| `css/layout.css` | All personality quiz purple (`#7d5ba6`) and purple tints (`#f0e8ff`, `#e6dbff`, `#f9f5ff`, `#f8f5ff`) → green equivalents |
| `styles.css` | All personality quiz purple and tints → green; "Try Another Quiz" button hover `#6a4a91` → `#128c7e` |
| `js/components/header.js` | "Upgrade to Premium" dropdown button gradient: purple → brand green |
| `js/modules/ui-manager.js` | "Self-Discovery & Identity" category icon `#9b59b6` → `#25d366` |

### Colour mapping reference

| Old (removed) | New (brand) | Usage |
|--------------|-------------|-------|
| `#667eea` | `#25d366` | Primary accent |
| `#764ba2` | `#128c7e` | Dark/gradient end |
| `#7d5ba6` | `#25d366` | Personality quiz accents |
| `#5d4580` | `#128c7e` | Personality dark |
| `#9b59b6` | `#25d366` | Category icon colour |
| `#f0e8ff` | `#e8faf0` | Option hover background |
| `#e6dbff` | `#d4f5e9` | Card hover background |
| `#f9f5ff`, `#f8f5ff` | `#f0faf5` | Section background tints |
| `#6a4a91` | `#128c7e` | Button hover (dark) |

---

## Files Changed

### New Files Created
| File | Purpose |
|------|---------|
| `dashboard.html` | Auth-gated premium dashboard — quiz history, AI library, subscription management |
| `database.rules.json` | Realtime Database security rules for live presenter sessions |
| `docs/development/PHASE4_HANDOFF.md` | This file |
| `docs/development/PHASE5_PROMPT.md` | Next session start prompt |

### Files Modified
| File | What Changed |
|------|-------------|
| `functions/index.js` | Added `createPortalSession` callable; added `cleanupExpiredSessions` scheduled function |
| `firebase.json` | Added `"database": { "rules": "database.rules.json" }` block |
| `webpack.config.js` | Added `dashboard.html` to CopyPlugin patterns |
| `CHANGELOG.md` | Added v4.0.0 entry |
| `CLAUDE.md` | Updated Cloud Functions table (2 new functions); added `dashboard.html` and `database.rules.json` to Key Files; added pitfalls 16–18; updated What Needs Improvement |

---

## Architecture Changes

### New Cloud Functions
| Function | Type | Secrets | Purpose |
|----------|------|---------|---------|
| `createPortalSession` | callable | STRIPE_SECRET | Creates Stripe Customer Portal session for subscription self-service |
| `cleanupExpiredSessions` | scheduled (daily) | — | Removes RTDB sessions older than 24 hours |

### New Globals Introduced
None — `dashboard.html` is a standalone page with no IIFE modules.

### New Firebase Resources
- **Realtime Database rules**: `database.rules.json` — previously the RTDB had no security rules deployed via Firebase CLI

---

## Breaking Changes

None. All existing Cloud Functions, Firestore data, and frontend modules are unchanged.

---

## Known Issues & Technical Debt

1. **`createPortalSession` not yet deployed** — Functions have been updated in `functions/index.js` but `firebase deploy --only functions` has not been run. Must be done before the "Manage Subscription" button is usable.

2. **`cleanupExpiredSessions` requires `createdAt` on sessions** — The existing pre-built live presenter bundle may not set a `createdAt` field when creating sessions. Sessions without this field will not be cleaned up. Phase 5 should ensure the live presenter sets `createdAt: Date.now()` on session creation.

3. **End-to-end Stripe test still pending** — Test card `4242 4242 4242 4242` → Stripe Payment Link → webhook → Firestore tier update → `createPortalSession` → Stripe Customer Portal. This full flow has not been tested.

4. **Realtime Database rules not yet deployed** — `database.rules.json` created but `firebase deploy --only database` has not been run.

5. **Live presenter new question types deferred** — Word cloud, rating scale, true/false (4.3), countdown timer, and leaderboard (4.4) require rebuilding the pre-built live-presenter bundle. Original source is not in this repository.

6. **`dashboard.html` "Retake" link** — The retake URL `/?retake={quizId}` is prepared but the main app (`quiz-engine.js` / `ui-manager.js`) does not yet handle the `retake` URL parameter. This is a Phase 5 enhancement.

7. **RTDB `database.rules.json` comments** — JSON does not support comments; the `// comment` lines in `database.rules.json` use the Firebase RTDB rules comment syntax which is actually supported by the Firebase RTDB rules engine (not standard JSON). Verify they deploy correctly, or remove if they cause issues.

---

## Testing Notes

- `dashboard.html` can be tested locally after `npm run build` via `firebase serve`
- Auth-gate tested at design level — requires unauthenticated Firebase session to verify redirect
- `createPortalSession` requires a valid `stripeCustomerId` in Firestore — only testable after end-to-end Stripe checkout flow
- `cleanupExpiredSessions` can be triggered manually via Firebase Console → Functions → scheduleCleanupExpiredSessions → Run now
- RTDB rules can be tested via Firebase Console → Realtime Database → Rules → Simulator

---

## Recommendations for Phase 5

1. **Deploy Phase 4 work first** — Run `firebase deploy --only functions,database` before starting Phase 5 to put `createPortalSession`, `cleanupExpiredSessions`, and RTDB rules live
2. **End-to-end Stripe test** — Use test card `4242 4242 4242 4242` to complete the full payment flow before building on top of subscription data
3. **Live presenter source** — Phase 5 should either obtain/restore the original live-presenter source project (to rebuild bundles with new question types) or implement the question types as a separate lightweight HTML overlay served alongside the pre-built bundle
4. **`retake` URL parameter** — Add handling in `ui-manager.js` / `quiz-engine.js` for `?retake={quizId}` to load and start an AI-generated quiz directly from the dashboard
5. **Dashboard link in nav** — Add `/dashboard.html` to the main app's header navigation (in `header.js`) for signed-in users

---

## Current File Tree (Key Files)

```
E:\Programs\iquizpros-live-backup\
├── firebase.json              ← + database rules block
├── firestore.rules            ← deployed (Phase 3.1, unchanged)
├── database.rules.json        ← NEW — RTDB security rules for live sessions
├── dashboard.html             ← NEW — premium dashboard page
├── premium.html               ← 4-tier pricing page (unchanged)
├── live-presenter.html        ← pre-built bundle (unchanged)
├── CHANGELOG.md               ← v4.0.0 entry added
├── functions/
│   └── index.js              ← + createPortalSession + cleanupExpiredSessions (~480 lines)
├── js/
│   └── config.js              ← unchanged
└── webpack.config.js          ← + dashboard.html to CopyPlugin
```
