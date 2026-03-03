# Phase 3 Handoff — Premium, Payments & AI Cloud Functions

**Completed:** 2026-02-26
**Phase Status:** Complete (functions need deployment after `firebase login --reauth`)

---

## What Was Done

### Step 0 — Housekeeping: Old Auth Scripts Deleted

11 files that existed on disk but were not loaded (removed from index.html in Phase 1) have been permanently deleted:
`js/firebase-auth-fix.js`, `js/auth-service-fix-v2.js`, `js/auth-service-fix.js`,
`js/auth-fix.js`, `js/auth-persistence-fix.js`, `js/auth-button-fix.js`,
`js/direct-auth-fix.js`, `js/modules/auth-service.js`, `js/modules/auth-ui.js`,
`js/modules/auth-helper.js`, `js/components/auth-header-integration.js`

---

### 3.1 — Cloud Functions Infrastructure

- Created `functions/` directory with `package.json` (firebase-admin 11.8, firebase-functions 4.9, @google/generative-ai 0.19, stripe 14), `.gitignore`, and `functions/index.js`
- Updated `firebase.json` to add `"functions": { "source": "functions", "runtime": "nodejs18" }`
- Region: **`europe-west2`** (London) — closest to UK-based users
- All secrets use **`defineSecret`** from `firebase-functions/params` (modern Cloud Secret Manager approach, not the deprecated `functions.config()` which is being removed March 2026)
- npm dependencies installed (`292 packages`)

**Secrets to set before deploying** (run these after `firebase login --reauth`):
```bash
firebase functions:secrets:set GEMINI_KEY
# value: [REDACTED — retrieve from Google AI Studio]

firebase functions:secrets:set STRIPE_SECRET
# value: [REDACTED — retrieve from Stripe Dashboard → Developers → API keys]

firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# value: get from Stripe Dashboard → Developers → Webhooks after adding the endpoint
```

---

### 3.2 — AI Quiz Generation

**Frontend fix:**
- Added `<script src="https://www.gstatic.com/firebasejs/9.20.0/firebase-functions-compat.js"></script>` to `live-presenter.html` between `firebase-storage-compat.js` and the deferred bundles. This fixes the `"Firebase Functions service is required"` error that prevented the AI quiz modal from opening.

**Backend (functions/index.js):**
Six callable Cloud Functions implemented:

| Function | Auth required | Secrets |
|---|---|---|
| `generateQuiz` | Yes | GEMINI_KEY |
| `getUserUsageStats` | Yes | — |
| `getGeneratedQuiz` | Yes | — |
| `listUserQuizzes` | Yes | — |
| `deleteGeneratedQuiz` | Yes | — |
| `generateAdaptiveQuestion` | Yes | GEMINI_KEY |

Plus `stripeWebhook` (HTTP function, not callable) using STRIPE_SECRET + STRIPE_WEBHOOK_SECRET.

**Rate limits (hardcoded in RATE_LIMITS constant):**
- `free`: 3 generations/month
- `premium`: 200 generations/month
- `unlimited`: null (no limit)

**AI model:** `gemini-1.5-flash` (Gemini free tier)

**Firestore paths written:**
- `generatedQuizzes/{docId}` — generated quiz documents
- `users/{uid}/usage/{YYYY-MM}` — monthly generation counter

---

### 3.3 — Stripe Payment Links

**Approach chosen:** Stripe Payment Links (zero-backend checkout)

**How the flow works:**
1. User clicks "Get Premium" on `premium.html`
2. JavaScript checks Firebase Auth — if not signed in, shows "Sign in first" notice
3. If signed in, constructs Payment Link URL with `?client_reference_id={firebase_uid}&prefilled_email={email}`
4. User completes payment on Stripe-hosted page
5. Stripe webhook fires → `stripeWebhook` Cloud Function reads `session.client_reference_id` to identify the user → writes to `users/{uid}/subscription` in Firestore

**Stripe webhook URL** (register in Stripe Dashboard → Developers → Webhooks):
```
https://europe-west2-quizpros.cloudfunctions.net/stripeWebhook
```
Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

**Payment Link setup required** (Stripe Dashboard → Products → Payment Links):
1. Create a product "iQuizPros Premium" at $9.99/month
2. Create a Payment Link → set success URL: `https://iquizpro.com/?payment=success`, cancel URL: `https://iquizpro.com/premium.html?payment=cancelled`
3. Copy the Payment Link URL and paste it into `js/config.js` → `stripe.paymentLinks.premium`
4. Repeat for "iQuizPros Unlimited" at $19.99/month → `stripe.paymentLinks.unlimited`

**Firestore schema written by webhook:**
```
users/{uid}/subscription: {
  tier: "premium" | "unlimited" | "free",
  stripeCustomerId: "cus_...",
  subscriptionId: "sub_...",
  updatedAt: Timestamp
}
```

---

### 3.4 — Premium Feature Gating

- `js/modules/premium.js` completely rewritten:
  - `requiresPremium(quizId)` — checks against `config.premium.gatedQuizIds`
  - `checkQuizAccess(quizId)` — calls `requiresPremium()` + `hasTierAccess()`, shows upgrade modal if blocked
  - `showUpgradeModal(quizId)` — polished full-screen overlay with "View Premium Plans" CTA and "Maybe later" dismiss
  - `redirectToPaymentLink(tier)` — attaches Firebase UID to Stripe Payment Link URL
  - All old backward-compat aliases preserved (`showSignupModal`, `isPremiumEnabled`)
- `js/modules/quiz-engine.js` — premium gate check added at top of `startQuiz()`:
  ```javascript
  if (QuizProsPremium.requiresPremium(topicId)) {
    if (!QuizProsPremium.checkQuizAccess(topicId)) return;
  }
  ```
- **Gated quiz IDs** (configured in `config.js`): `career-deep-dive`, `emotional-intelligence`

---

### 3.5 — Quiz History → Firestore

- `js/modules/user-manager.js` — `saveQuizResult()` now calls `_writeQuizHistoryToFirestore()` after saving to localStorage
- Firestore write: `users/{uid}/quizHistory/{docId}` with fields `quizId`, `quizTitle`, `score`, `total`, `personalityType`, `completedAt`
- `js/modules/quiz-engine.js` — `showResults()` now calls `saveQuizResult()` at completion for both personality and regular quizzes, capturing `personalityType` title for personality quizzes

---

## Files Changed

### New Files Created
| File | Purpose |
|------|---------|
| `functions/index.js` | All 6 Cloud Functions + Stripe webhook (330 lines) |
| `functions/package.json` | Node 18 server-side dependencies |
| `functions/.gitignore` | Excludes node_modules from git |
| `docs/development/PHASE3_HANDOFF.md` | This file |
| `docs/development/PHASE4_PROMPT.md` | Next phase start prompt |

### Files Modified
| File | What Changed |
|------|-------------|
| `firebase.json` | Added `"functions"` block |
| `live-presenter.html` | Added `firebase-functions-compat.js` script tag |
| `js/config.js` | Added `stripe` config block; updated `premium.tiers` to 3 tiers; added `premium.gatedQuizIds` |
| `js/modules/premium.js` | Complete rewrite — real Payment Links, `requiresPremium()`, `checkQuizAccess()`, `showUpgradeModal()` |
| `js/modules/quiz-engine.js` | Premium gate in `startQuiz()`; quiz history save in `showResults()` |
| `js/modules/user-manager.js` | `_writeQuizHistoryToFirestore()` added; called from `saveQuizResult()` |
| `premium.html` | Complete rewrite — 3 tiers, real Stripe Payment Link buttons, payment result handling |
| `CHANGELOG.md` | Version 3.0.0 entry added |
| `CLAUDE.md` | Updated with functions/ architecture, module map |

### Files Removed
| File | Reason |
|------|--------|
| `js/firebase-auth-fix.js` | Dead code — not loaded since Phase 1 |
| `js/auth-service-fix-v2.js` | Dead code |
| `js/auth-service-fix.js` | Dead code |
| `js/auth-fix.js` | Dead code |
| `js/auth-persistence-fix.js` | Dead code |
| `js/auth-button-fix.js` | Dead code |
| `js/direct-auth-fix.js` | Dead code |
| `js/modules/auth-service.js` | Dead code |
| `js/modules/auth-ui.js` | Dead code |
| `js/modules/auth-helper.js` | Dead code |
| `js/components/auth-header-integration.js` | Dead code |

---

## Architecture Changes

### New Globals Introduced
| Global | File | Purpose |
|--------|------|---------|
| (none new) | — | `QuizProsPremium` already existed; rewritten in place |

### New Firestore Collections
| Collection | Written by | Purpose |
|---|---|---|
| `generatedQuizzes/{docId}` | `generateQuiz` Cloud Function | AI-generated quiz storage |
| `users/{uid}/usage/{YYYY-MM}` | `generateQuiz` Cloud Function | Monthly generation counter |
| `users/{uid}/subscription` | `stripeWebhook` Cloud Function | Subscription tier + Stripe IDs |
| `users/{uid}/quizHistory/{docId}` | `user-manager.js` frontend | Quiz completion history |

### Cloud Functions Architecture
```
functions/
  index.js          ← All exports (Node.js server-side, NOT IIFE pattern)
  package.json      ← firebase-admin, firebase-functions, @google/generative-ai, stripe
  .gitignore
  node_modules/     ← 292 packages (not committed)
```

---

## Known Issues & Technical Debt

1. **Firebase login expired** — `firebase login --reauth` required before deploying functions. The CLI session expired during this session.

2. **Stripe Payment Links not yet created** — The Payment Link URLs in `js/config.js` are placeholders (`REPLACE_WITH_...`). The user must:
   - Create products and Payment Links in Stripe Dashboard (test mode)
   - Update `config.js` → `stripe.paymentLinks.premium` and `stripe.paymentLinks.unlimited`

3. **Stripe webhook secret not yet set** — `STRIPE_WEBHOOK_SECRET` is set to a placeholder. The real value comes from Stripe Dashboard → Developers → Webhooks after registering the endpoint URL.

4. **No premium dashboard UI** — Quiz history is now written to Firestore but there's no dedicated premium dashboard page that reads and displays it. Phase 4 or 5 work.

5. **`premium.html` uses direct Firebase init** — It initialises Firebase inline (same config as main app) since it's a standalone page outside the webpack bundle. This is intentional but means config changes must be kept in sync manually.

6. **Firestore security rules** — The new collections (`generatedQuizzes`, `users/{uid}/quizHistory`, `users/{uid}/subscription`, `users/{uid}/usage`) should have Firestore security rules added. Currently relying on Firebase default rules. Add rules in Phase 4.

7. **`functions.config()` fully deprecated** — Already migrated to `defineSecret`. No action needed but worth noting for any future reading of old guides.

8. **`quiz-engine.js` still ~1,310 lines** — Not split this phase. Acceptable for Phase 4.

---

## Testing Notes

- **Functions not yet deployed** — Firebase auth needs refreshing before `firebase deploy --only functions` can run
- **Payment flow not yet testable end-to-end** — Requires Stripe Payment Links to be created and webhook endpoint registered
- **Premium gating is live in code** — Will gate `career-deep-dive` and `emotional-intelligence` quizzes immediately after build
- **Quiz history Firestore write** — Will work for any authenticated user completing a quiz after hosting deploy

---

## Recommendations for Phase 4

1. **Complete Stripe setup** — Create Payment Links in Stripe test dashboard; register webhook; update `config.js`. Test the full checkout → webhook → Firestore flow.
2. **Firestore security rules** — Add rules for all new collections before going to production with real payments.
3. **Premium dashboard page** — Build a `/dashboard.html` or in-app section that reads `users/{uid}/quizHistory` and displays score trends (Chart.js or CSS bars).
4. **Live presentation system improvements** — Phase 4 is the Live Presentation System phase per the development plan.
5. **Deploy functions** after re-auth: `firebase login --reauth` → set secrets → `firebase deploy --only functions` → `npm run deploy`

---

## Current File Tree (Key Files)

```
E:\Programs\iquizpros-live-backup\
├── firebase.json              ← hosting + functions config
├── premium.html               ← complete 3-tier pricing page with Stripe Payment Links
├── live-presenter.html        ← + firebase-functions-compat.js added
├── CHANGELOG.md               ← v3.0.0 entry added
├── functions/                 ← NEW — Cloud Functions
│   ├── index.js               ← 6 callable functions + stripeWebhook
│   ├── package.json
│   ├── .gitignore
│   └── node_modules/          ← 292 packages
├── js/
│   ├── config.js              ← + stripe block, 3 tiers, gatedQuizIds
│   └── modules/
│       ├── auth-manager.js    ← unchanged (Phase 1)
│       ├── premium.js         ← REWRITTEN — real Payment Links, gating, upgrade modal
│       ├── quiz-engine.js     ← + premium gate in startQuiz(), history save in showResults()
│       └── user-manager.js    ← + _writeQuizHistoryToFirestore()
├── docs/development/
│   ├── PHASE3_HANDOFF.md      ← this file
│   └── PHASE4_PROMPT.md       ← next session start prompt
└── src/
    └── app-entry.js           ← unchanged (premium.js already imported)
```
