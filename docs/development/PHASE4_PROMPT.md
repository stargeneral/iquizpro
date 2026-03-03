# iQuizPros — Phase 4: Live Presentation System

## Project Context

I am building **iQuizPros**, an interactive quiz platform. The site is
live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase is at:
  E:\Programs\iquizpros-live-backup

**Please add this directory to Desktop Commander's allowed directories.**

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, module system, conventions, pitfalls
2. `docs/development/PHASE3_HANDOFF.md` — What changed in the last phase
3. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap for reference
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, and the handoff/prompt templates required when generating end-of-phase documents

---

## What Changed in Phase 3 (Summary)

### Code Changes
- **11 old auth scripts deleted** — `js/firebase-auth-fix.js` and 10 others permanently removed
- **Firebase Cloud Functions** — `functions/` directory created with 6 callable functions + Stripe webhook; region `europe-west2` (London)
- **AI Quiz Generation** — `generateQuiz`, `getUserUsageStats`, `getGeneratedQuiz`, `listUserQuizzes`, `deleteGeneratedQuiz`, `generateAdaptiveQuestion` — all use Google Gemini 1.5 Flash via Cloud Secret Manager (`defineSecret`)
- **Stripe Payment Links** — `premium.html` completely rewritten as a 3-tier pricing page; `js/modules/premium.js` rewritten with `requiresPremium()`, `checkQuizAccess()`, `showUpgradeModal()`, `redirectToPaymentLink()`
- **Premium gating live** — `career-deep-dive` and `emotional-intelligence` quizzes now gate behind premium in `quiz-engine.js`
- **Quiz history → Firestore** — `user-manager.js` now writes to `users/{uid}/quizHistory/{docId}` on every quiz completion
- **firebase-functions-compat.js** added to `live-presenter.html`

### New Firestore Collections
- `generatedQuizzes/{docId}` — AI-generated quiz documents
- `users/{uid}/usage/{YYYY-MM}` — Monthly generation counters
- `users/{uid}/subscription` — Stripe subscription tier + IDs
- `users/{uid}/quizHistory/{docId}` — Quiz completion history

### New Config Additions
- `js/config.js` → `stripe` block (publishable key + placeholder payment link URLs)
- `js/config.js` → `premium.gatedQuizIds` + 4-tier `premium.tiers` structure (Basic/free, Premium $12.99, Pro $29.99, Enterprise/custom — **v3.2 pricing**)

### v3.2 Pricing Update (applied before Phase 4)
- Free tier: 5 AI gen/month (was 3)
- Premium: $12.99/month, 100 AI gen/month (was $9.99, 200)
- Pro tier: $29.99/month, 500 AI gen/month (replaces "Unlimited" at $19.99)
- Enterprise: Custom pricing (new tier — Contact Us, no Stripe redirect)
- Legacy `unlimited` subscribers: unaffected (`unlimited: null` rate limit retained for backward-compat)
- `stripe.paymentLinks` key changed: `unlimited` → `pro`; new Stripe Payment Links at new prices still need to be created

### Outstanding Work From Phase 3 (Must Do First in Phase 4)
1. **Firebase re-auth + deploy functions** — `firebase login --reauth` then `firebase functions:secrets:set GEMINI_KEY / STRIPE_SECRET / STRIPE_WEBHOOK_SECRET` then `firebase deploy --only functions`
2. **Stripe Payment Links** — Create products + Payment Links in Stripe Dashboard (test mode), paste URLs into `js/config.js` → `stripe.paymentLinks.premium` and `stripe.paymentLinks.unlimited`
3. **Register Stripe webhook** — Add `https://europe-west2-quizpros.cloudfunctions.net/stripeWebhook` in Stripe Dashboard → Developers → Webhooks (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`); paste the resulting webhook signing secret into `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`
4. **Firestore security rules** — Add rules for `generatedQuizzes`, `users/{uid}/quizHistory`, `users/{uid}/subscription`, `users/{uid}/usage` before enabling real payments

---

## Naming & Code Conventions (Mandatory)

- Window globals: `window.QuizPros[ModuleName]` (PascalCase)
- Files: `kebab-case.js`
- CSS classes/IDs: `kebab-case`
- Module pattern: IIFE with `return { publicAPI }` (see CLAUDE.md)
- Cloud Functions: Node.js `exports.functionName = ...` pattern (NOT IIFE) — lives in `functions/index.js`
- No circular dependencies. Modules never depend on components.
- Search entire codebase before renaming or removing anything.
- Build: edit source files in `js/`, `css/`, `src/`; run `npm run build` before deploying hosting. Never edit `dist/` files directly.

---

## Phase 4 Objectives

### Step 0 — Complete Phase 3 Deployment (Prerequisite)

Before starting any new Phase 4 work, complete the outstanding Phase 3 items:

1. In a terminal in the project root, run: `firebase login --reauth`
2. Set the three Cloud Secrets:
   ```bash
   firebase functions:secrets:set GEMINI_KEY
   # value: [REDACTED — retrieve from Google AI Studio]

   firebase functions:secrets:set STRIPE_SECRET
   # value: [REDACTED — retrieve from Stripe Dashboard → Developers → API keys]

   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   # value: get from Stripe Dashboard AFTER registering the webhook endpoint
   ```
3. Deploy functions: `firebase deploy --only functions`
4. In Stripe Dashboard (test mode):
   - Create "iQuizPros Premium" product at **$12.99/month** → create Payment Link → success URL: `https://iquizpro.com/?payment=success`, cancel URL: `https://iquizpro.com/premium.html?payment=cancelled`, metadata: `{ tier: "premium" }`
   - Create "iQuizPros Pro" product at **$29.99/month** → same URL pattern, metadata: `{ tier: "pro" }`
   - Register webhook: `https://europe-west2-quizpros.cloudfunctions.net/stripeWebhook` → listen for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook signing secret → `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`
5. Update `js/config.js` → `stripe.paymentLinks.premium` and `stripe.paymentLinks.pro` with real URLs (also update same constants in `premium.html` → `PAYMENT_LINKS`)
6. Add Firestore security rules (see 4.3 below)
7. `npm run build && firebase deploy --only hosting`

### 4.1 — Firestore Security Rules

**Why now:** Phase 3 wrote to new Firestore collections without security rules. Before real payments go live, rules must be in place.

Add rules in the Firebase Console (or via `firebase.json` → `firestore.rules`) for:

```
// generatedQuizzes — user can only read/write their own
match /generatedQuizzes/{docId} {
  allow read, delete: if request.auth != null && resource.data.uid == request.auth.uid;
  allow create: if request.auth != null;  // Cloud Function writes on behalf of user
}

// users/{uid}/subscription — user reads own; only Cloud Functions write (Admin SDK bypasses rules)
match /users/{uid}/subscription {
  allow read: if request.auth != null && request.auth.uid == uid;
}

// users/{uid}/usage — user reads own; Cloud Functions write
match /users/{uid}/usage/{monthDoc} {
  allow read: if request.auth != null && request.auth.uid == uid;
}

// users/{uid}/quizHistory — user reads/writes own
match /users/{uid}/quizHistory/{docId} {
  allow read, create: if request.auth != null && request.auth.uid == uid;
}
```

Create a `firestore.rules` file in the project root if it doesn't exist, then add it to `firebase.json`.

### 4.2 — Premium Dashboard Page

**Goal:** Build a `/dashboard.html` page (or in-app section) that reads Firestore quiz history and displays it.

**Requirements:**
- Accessible at `https://iquizpro.com/dashboard.html`
- Shows recent quiz history (quiz title, score, date completed) from `users/{uid}/quizHistory`
- Shows current subscription tier and AI generation usage (calls `getUserUsageStats` Cloud Function)
- Shows AI-generated quiz library (calls `listUserQuizzes` Cloud Function) with ability to retake or delete each quiz
- Auth-gated: if not signed in, redirect to home with sign-in prompt
- Mobile-responsive, matches existing app visual style

**Technical approach:**
- Standalone HTML page (same approach as `premium.html`) — inline Firebase init, no webpack bundle
- Reads Firestore via firebase-firestore-compat.js CDN
- Calls Cloud Functions via firebase-functions-compat.js CDN
- Score trend visualization: CSS bar chart (no Chart.js dependency needed) for last 5–10 quiz scores
- Add `dashboard.html` to `firebase.json` CopyPlugin in `webpack.config.js` so it gets copied to `dist/`

### 4.3 — Live Presentation System: Question Type Expansion

**Goal:** Add at least 3 new question types to the live presenter beyond the existing multiple-choice.

**Existing system:** `live-presenter.html` + webpack bundle (`src/live-presenter/`). The audience joins via `live-audience.html`. Responses are stored in Firebase Realtime Database under `sessions/{sessionCode}/responses`.

**New question types to implement:**

#### Word Cloud
- Presenter shows an open-ended prompt ("Describe your morning in one word")
- Audience types a word (max 20 chars)
- Results show as an animated word cloud (font-size proportional to frequency)
- Use a lightweight word cloud library or CSS-only implementation

#### Rating Scale
- Presenter sets a 1–5 or 1–10 scale question
- Audience slides/taps their rating
- Results show as a bar chart + average score prominently displayed

#### True/False Quick Poll
- Simplified binary choice (True / False or Yes / No)
- Large buttons for fast mobile response
- Results show split percentage with animated fill bars

**Implementation notes:**
- New question types must be selectable when the presenter is creating/editing a slide
- Realtime Database structure should add a `type` field to each question: `"multiple-choice"`, `"word-cloud"`, `"rating"`, `"true-false"`
- Audience view adapts based on question `type` received
- Presenter results panel adapts visualization per type
- Backward-compatible — existing sessions with no `type` field default to `"multiple-choice"`

### 4.4 — Live Presentation: Leaderboard & Timer Per Question

**Goal:** Make competitive live sessions more engaging.

#### Timer per question
- Presenter can set a time limit (15s, 30s, 60s, none) per question
- Countdown displayed to both presenter and audience
- Auto-advances when timer expires (responses locked)
- Timer synced via Realtime Database (server timestamp to avoid local clock drift)

#### Leaderboard
- For timed multiple-choice questions, scores are computed by: correct × (time remaining / total time) × 100
- Leaderboard shown after each question (top 5 participants by cumulative score)
- Final leaderboard shown at session end
- Participants can set a nickname when joining (stored in session)

**Realtime Database additions:**
- `sessions/{code}/participants/{uid}/nickname` — display name
- `sessions/{code}/participants/{uid}/score` — cumulative score
- `sessions/{code}/questions/{qIndex}/timer` — seconds per question
- `sessions/{code}/questions/{qIndex}/closedAt` — server timestamp when question locked

### 4.5 — Subscription Management (Cancel / Manage)

**Why this matters:** Users currently have NO in-app way to cancel or manage their subscription. They would have to contact you directly or go to Stripe manually. This must be fixed before going live with real payments.

**Background — Orphan us-central1 functions:**
Firebase currently shows `cancelSubscription`, `createCheckoutSession`, `createPortalSession`, and `getCheckoutSession` deployed in `us-central1` from a pre-Phase-3 deployment. These are NOT in the current `functions/index.js`, use the wrong region, and are likely using deprecated `functions.config()` for secrets. **Do not call them from the frontend.** Clean them up from the Firebase Console → Functions after the new implementations are live.

**Goal:** Implement subscription self-service using the Stripe Customer Portal.

#### Step 1 — Add `createPortalSession` to `functions/index.js`

```javascript
// Creates a Stripe Customer Portal session so the user can manage their subscription
// (cancel, change plan, update payment method) — all handled by Stripe's hosted UI
exports.createPortalSession = functions.region(REGION)
  .runWith({ secrets: [STRIPE_SECRET] })
  .https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
    const uid = context.auth.uid;
    const db = admin.firestore();
    const subDoc = await db.collection('users').doc(uid).collection('subscription').doc('status').get();
    const customerId = subDoc.exists ? subDoc.data()?.stripeCustomerId : null;
    if (!customerId) throw new functions.https.HttpsError('not-found', 'No subscription found');
    const stripe = require('stripe')(STRIPE_SECRET.value());
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: data.returnUrl || 'https://iquizpro.com/dashboard.html',
    });
    return { url: session.url };
  });
```

#### Step 2 — Wire up "Manage Subscription" button

In `dashboard.html` (and optionally in the profile modal in `auth-manager.js`):
- Show a **"Manage Subscription"** button for users with `tier !== 'free'`
- On click: call `createPortalSession` via Firebase Functions SDK → redirect to `session.url`
- Stripe's Customer Portal handles cancel, upgrade, downgrade, update card, view invoices

#### Step 3 — Clean up orphan us-central1 functions

After `createPortalSession` is deployed and tested in `europe-west2`, delete the four orphan functions from the Firebase Console:
1. Firebase Console → Functions → find each `us-central1` orphan → Delete
   - `cancelSubscription (us-central1)`
   - `createCheckoutSession (us-central1)`
   - `createPortalSession (us-central1)`
   - `getCheckoutSession (us-central1)`

**Note:** Do NOT add `cancelSubscription` as a separate function — the Stripe Customer Portal handles cancellation natively. One `createPortalSession` function covers all subscription management.

---

### 4.6 — Session Infrastructure Improvements

**Goal:** Make live sessions more reliable for 50+ participants.

- **Session cleanup** — Cloud Function `cleanupExpiredSessions` triggered daily via Firebase Scheduler: delete sessions older than 24 hours from Realtime Database
- **Connection monitoring** — Show "X participants connected" using Realtime Database `.info/connected`; handle reconnects gracefully (re-subscribe to current question on reconnect)
- **Rate limiting** — Prevent audience spamming: max 1 response per participant per question (enforced by Realtime Database rules + frontend check)
- **Realtime Database security rules** — Add rules to `database.rules.json`:
  - Session creator can write all session data
  - Participants can only write to their own response slot
  - Everyone can read current session/question data

---

## Files Likely to Be Touched

| File | Why |
|------|-----|
| `firestore.rules` | ✅ Already deployed — `subscription` subcollection rule added in Phase 3.1 |
| `database.rules.json` | NEW — Realtime Database rules for live sessions |
| `dashboard.html` | NEW — Premium dashboard page |
| `firebase.json` | Add database.rules reference; add dashboard.html to CopyPlugin |
| `js/config.js` | ✅ Stripe paymentLinks already have real test URLs |
| `functions/index.js` | Add `createPortalSession`; add `cleanupExpiredSessions` scheduled function |
| `src/live-presenter/` | New question types, timer, leaderboard logic |
| `src/live-audience/` | Adapt UI per question type, timer display, nickname entry |
| `webpack.config.js` | Add dashboard.html to CopyPlugin |

---

## Known Issues & Constraints Carried Forward

1. **Functions not yet deployed** — ✅ RESOLVED: All 7 functions deployed to `europe-west2`, Node.js 20
2. **Stripe Payment Links** — ⚠️ PARTIALLY RESOLVED: Test URLs present but at old prices ($9.99/$19.99). **Must create new Payment Links** at $12.99/month (Premium) and $29.99/month (Pro) in Stripe Dashboard before going live; update `stripe.paymentLinks.premium` and `stripe.paymentLinks.pro` in both `js/config.js` and `premium.html` → `PAYMENT_LINKS`
3. **Firestore security rules** — ✅ RESOLVED: `firestore.rules` deployed covering all Phase 3 collections including `subscription`
4. **End-to-end Stripe test still pending** — Test card `4242 4242 4242 4242` to verify checkout → webhook → Firestore subscription tier update. Do this before building the portal/dashboard.
5. **Orphan us-central1 Cloud Functions** — `cancelSubscription`, `createCheckoutSession`, `createPortalSession`, `getCheckoutSession` exist in `us-central1` from a pre-Phase-3 deployment. NOT in current `functions/index.js`. Do not call from frontend. Clean up via Firebase Console after new `createPortalSession` is live.
6. **premium.html uses direct Firebase init** — intentional (standalone page), but must stay in sync with `js/config.js` firebase config manually if credentials change
7. **quiz-engine.js still ~1,310 lines** — not split; acceptable for this phase
8. **Live presenter source location** — the webpack bundles in `dist/js/live-presenter.*.js` come from pre-built source (not rebuilt by webpack). Do not attempt to modify live presenter by editing `src/` — the bundles are fixed. New question types would require rebuilding the live presenter bundle from its original source project.

---

## How to Work

1. Read the required files first (especially `CLAUDE.md` and `PHASE3_HANDOFF.md`)
2. Complete Step 0 (Phase 3 deployment) before any new Phase 4 features
3. Use Desktop Commander to read/edit files on the machine
4. Make targeted, incremental changes
5. Edit source files (`js/`, `css/`, `src/`) and run `npm run build` to regenerate `dist/`. Never edit `dist/` directly.
6. For Cloud Functions changes: edit `functions/index.js` then `firebase deploy --only functions`
7. For hosting changes: `npm run build && firebase deploy --only hosting`
8. Search codebase before renaming/removing anything

---

## Success Criteria

- [x] ~~Cloud Functions deployed~~ ✅ Done in Phase 3 (7 functions, europe-west2, Node.js 20)
- [x] ~~Stripe Payment Link URLs populated~~ ✅ Done in Phase 3
- [x] ~~Firestore security rules deployed~~ ✅ Done in Phase 3.1
- [ ] End-to-end Stripe payment test passes (test card `4242 4242 4242 4242` → webhook → Firestore tier update)
- [ ] `createPortalSession` Cloud Function deployed to `europe-west2`
- [ ] "Manage Subscription" button in dashboard/profile opens Stripe Customer Portal
- [ ] Orphan `us-central1` functions deleted from Firebase Console
- [ ] `/dashboard.html` loads for authenticated users and shows quiz history from Firestore
- [ ] `/dashboard.html` shows subscription tier and AI generation usage stats (calls `getUserUsageStats`)
- [ ] At least 2 new question types functional in live presenter (e.g., word cloud + rating scale)
- [ ] Countdown timer works and syncs between presenter and audience views
- [ ] Leaderboard displays correctly after each timed question
- [ ] Session cleanup runs (or is schedulable) — expired sessions removed from Realtime DB
- [ ] No new console errors introduced
- [ ] All existing quiz topics still function correctly
- [ ] `npm run build` succeeds without warnings
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md updated if architecture changed

---

## End-of-Phase Checklist

When all objectives are complete, before ending this session:

- [ ] Run final verification of all changes
- [ ] Update CHANGELOG.md with all Phase 4 changes (version 4.0.0)
- [ ] Update CLAUDE.md if module map, conventions, or architecture changed
- [ ] Create `docs/development/PHASE4_HANDOFF.md` — **using the Handoff Document Template in `docs/development/PROMPT_FRAMEWORK.md`**
- [ ] Create `docs/development/PHASE5_PROMPT.md` — **using the Phase Prompt Template in `docs/development/PROMPT_FRAMEWORK.md`**, incorporating all learnings from the handoff
