# 🔥 iQuizPros — Interactive Quiz Platform

A feature-rich interactive quiz platform combining personality/knowledge quizzes with a live Mentimeter-style presentation system. Built with vanilla JavaScript, Firebase backend services, and Stripe payment integration.

**Live Site:** [https://iquizpro.com](https://iquizpro.com)
**Firebase URL:** [https://quizpros.web.app](https://quizpros.web.app)
**Version:** 13.0.0

---

## ✨ Features

### Quiz System
- **Knowledge Quizzes** — General Knowledge, Science, History, Geography, Uganda, Entertainment (25 questions per topic)
- **Personality Quizzes** — Spirit Animal, Zodiac Sign, Leadership Style, Career Path, Love Language, Travel Style, and more (14+ quizzes)
- **Healthcare Quizzes** — 250 psychiatry questions across 10 topics (5 Medical, 5 Nursing); DSM-5 & NCLEX aligned; 2 free, 8 premium-gated
- **MedEd Hub** — Diagnostic funnel at `/meded`; two free 8-question diagnostic quizzes reveal study blind spots and route learners to targeted practice quizzes
- **Image-Based Quizzes** — Visual personality tests with zodiac and spirit animal imagery
- **Premium Quizzes** — Career Deep Dive, Emotional Intelligence, and 8 healthcare topics (subscription required)
- **AI-Generated Quizzes** — Create custom quizzes with Google Gemini AI (free tier: 5/month; AI presets for psychiatry topics); stored in Firestore and retakeable from dashboard
- **Per-Question Explanations** — Every knowledge and healthcare question shows a clinically/factually accurate explanation after answering
- **Psych Score Profiles** — Specialist result labels for psychiatry topics (Brilliant Diagnostician, Sharp Clinician, etc.)
- **Diagnostic Results** — `psych-mistakes-*` quizzes show personalised mistake analysis + recommended next quizzes on the results screen
- **Difficulty Levels** — Easy / Medium / Hard filter picker before every knowledge quiz; preference saved to localStorage
- **Daily Challenge** — Deterministic daily quiz with streak tracking, completion badge, and a global leaderboard showing today's top scorers
- **Quiz Categories** — Self-Discovery, Professional, Relationships, Learning, Lifestyle, Visual Tests, Healthcare
- **Quiz Search & Filter** — Live search bar filters all topic cards by name across categories
- **Quiz Embed** — Any quiz embeddable via `?embed=1&quizId=<id>`; chrome hidden; results show a "Play more" CTA

### Live Presentation (Mentimeter-style)
- **Presenter View** — Host live quiz sessions with real-time control at `/live-presenter.html`
- **Audience View** — Participants join via session code at `/live-audience.html`
- **Real-time Sync** — Firebase Realtime Database powers instant updates
- **Question Types** — Multiple choice (pre-built), Word Cloud, Rating Scale (1–5 or 1–10), True/False, Open-Ended, Q&A, Ranking
- **Countdown Timer** — Server-timestamp-synced timer with lock-on-zero; configurable per slide
- **Audience Scoring** — Time-based score: `floor(remaining / total × 100)` points per correct timed question; cumulative leaderboard
- **Live Leaderboard** — Presenter floating 🏆 button shows real-time top-10 overlay; audience sees top-5 between questions (3-second auto-dismiss)
- **Q&A Mode** — Audience submits questions; presenter sees live list; audience can upvote with per-user dedup; votes sort Q&A list in real time
- **Emoji Reactions** — Presenter emoji bar (👍 🎉 😂 😮 ❤️); floating emoji animation on audience screen
- **CSV Export** — Download session results (Nickname, Total Score, per-slide scores) as a CSV file
- **Session Archive** — Archived sessions stored in Firestore; viewable in the premium dashboard
- **Share Session QR** — 📲 button on presenter generates a fullscreen QR code overlay for the audience join URL
- **Nickname Prompt** — Audience enters a nickname (1–20 chars) on first join; stored in RTDB participants node
- **Auth Modal** — Sign-in prompt for presenters; upgrade modal for premium gating
- **RTDB Session Cleanup** — Daily Cloud Function removes sessions older than 24 hours

### Authentication & Premium
- **Firebase Authentication** — Email/password and Google sign-in (popup on mobile, redirect on desktop)
- **Progressive Access** — Guest → Authenticated → Premium tiers (Basic/Free · Premium $12.99/mo · Pro $29.99/mo · Enterprise custom)
- **Mobile Sign-In Hardening** — 15-second timeout guard, button restored on success, CSP fixes for `apis.google.com` and Firestore endpoints
- **Stripe Payment Links** — Zero-backend checkout; webhook syncs subscription to Firestore
- **Stripe Customer Portal** — "Manage Subscription" in dashboard opens Stripe self-service portal via `createPortalSession` Cloud Function
- **Premium Gating** — Career Deep Dive, Emotional Intelligence, and 8 healthcare topics require paid tier
- **Admin Bypass** — Admin UID gets Enterprise-tier access and unlimited AI generation
- **View Profile** — In-app modal showing display name, email, tier, and quiz count
- **Quiz History** — In-app modal listing last 20 completed quizzes; also shown in dashboard
- **Dashboard** — Auth-gated page at `/dashboard.html` with subscription panel, AI usage stats, score trend chart, quiz history, AI quiz library, past live sessions, and quiz embed modal

### User Experience
- **Mobile-First Design** — Responsive across all devices; 44px min touch targets (WCAG 2.5.5)
- **Dark Mode** — System preference auto-detect (`prefers-color-scheme`) + manual toggle; full CSS override coverage
- **PWA / Installable** — Service worker with shell cache, stale-while-revalidate templates, offline fallback; Web App Manifest; install prompt after first quiz
- **Offline Support** — Offline banner when network lost; pending quiz history flushed on reconnect via background sync
- **Skeleton Loaders** — Shimmer placeholder cards while topic grid loads
- **Hero Section** — Gradient hero banner with "Start a Quiz" and "Go Premium" CTAs on home screen
- **Resume Card** — "Continue Where You Left Off" section for in-progress knowledge quizzes
- **Bottom Navigation** — Fixed mobile-only nav bar (Home / Quizzes / Dashboard / Premium) with safe-area inset
- **Quiz Animations** — Fade-in on question render, correct-answer pulse, wrong-answer shake, score count-up, personality result pop
- **Haptic Feedback** — `navigator.vibrate()` patterns: correct (double-tap), wrong (long buzz), personality tap (short)
- **Keyboard Navigation** — Arrow keys navigate between answer options; focus managed to first option on render
- **ARIA Accessibility** — `role="list/listitem"` on topic grids, `role="radiogroup/radio"` on options, `aria-checked` live update, `aria-live="polite"` on question text, progress bar `role="progressbar"` with `aria-valuenow`; skip-nav link
- **Reduced-Motion Support** — `@media (prefers-reduced-motion: reduce)` disables all animations globally
- **Shareable Result Card** — Canvas-generated 600×315 result image shared via Web Share API or downloaded as PNG
- **PDF Export** — One-click PDF of results screen (lazy-loads html2canvas + jsPDF from CDN)
- **How Others Answered** — Per-question answer distribution % bars from Firestore aggregation
- **Audio Feedback** — Sound effects for correct/wrong answers
- **Confetti Celebrations** — Canvas-confetti for high scores
- **Social Sharing** — WhatsApp, Facebook, Twitter result sharing with quiz-specific share text
- **Swipe Gesture** — Swipe left advances a locked question
- **Pull-to-Refresh** — Pull down on topic grid to refresh
- **Popular Quizzes** — Horizontal carousel of top-5 quizzes by play count (Firestore `quizStats`)
- **Cookie Consent** — GDPR-compliant cookie management
- **404 Page** — Branded 404 with gradient hero and "Take a Quiz" CTA
- **Admin Dashboard** — `/admin.html` — site analytics for admin UID: total plays, quiz play counts, daily leaderboard, recent live sessions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3, IIFE modules |
| Backend | Firebase (Auth, Firestore, Realtime Database, Cloud Functions) |
| AI | Google Gemini 1.5 Flash (via Cloud Functions) |
| Payments | Stripe Payment Links + Stripe Webhooks + Customer Portal |
| Build | Webpack 5 (bundles all JS/CSS; CopyPlugin for static assets) |
| Hosting | Firebase Hosting + Custom Domain (iquizpro.com) |
| Analytics | Google Analytics 4 (G-0QZSJ62FJV) |
| Functions | Node.js 20, region: europe-west2 (London) |
| Secrets | Google Cloud Secret Manager (GEMINI_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET) |
| Testing | Jest (unit, 66 tests), Playwright (E2E, 3 specs) |
| PWA | Service Worker + Web App Manifest |

---

## 📁 Project Structure

```
iquizpros-live-backup/
├── landing.html                  # Landing page → dist/index.html (served at /)
├── meded.html                    # MedEd Hub marketing page → dist/meded.html (served at /meded)
├── app.js                        # Core application logic (quiz flow, retake/embed/daily handlers)
├── styles.css                    # Main stylesheet
├── premium.html                  # Standalone 4-tier pricing page (Stripe Payment Links)
├── live-presenter.html           # Live presenter (pre-built webpack bundles + extension layer)
├── live-audience.html            # Live audience join page (+ extension layer)
├── dashboard.html                # Premium dashboard (auth-gated, inline Firebase init)
├── admin.html                    # Admin analytics dashboard (ADMIN_UID gated)
├── 404.html                      # Branded 404 page
├── sw.js                         # Service worker (PWA, Phase 8)
├── manifest.json                 # Web App Manifest (PWA, Phase 8)
├── firestore.rules               # Firestore security rules
├── database.rules.json           # Realtime Database security rules
├── firebase.json                 # Hosting + Functions + Firestore + RTDB config
├── .firebaserc                   # Firebase project binding (quizpros)
├── webpack.config.js             # Webpack 5 build config
├── package.json                  # npm scripts, dev dependencies, Jest config
├── playwright.config.js          # Playwright E2E test config
│
├── src/
│   ├── app-entry.js              # Webpack entry point (imports all JS/CSS modules)
│   └── index.template.html       # HTML template → dist/app.html (quiz SPA)
│
├── dist/                         # Generated by webpack (deploy this to Firebase)
│   ├── index.html                # = landing.html (served at /)
│   ├── app.html                  # Quiz SPA (served at /app)
│   ├── meded.html                # MedEd Hub (served at /meded)
│   ├── js/app.[hash].js          # Main app bundle (current: app.03ede69d.js)
│   ├── css/app.[hash].css        # Bundled styles (current: app.6134aff4.css)
│   └── js/[live-presenter bundles + chunks]
│
├── js/
│   ├── config.js                 # All configuration (Firebase, Stripe, feature flags)
│   │
│   ├── modules/                  # Core business logic (IIFE pattern)
│   │   ├── auth-manager.js       # Unified auth — email, Google, UI, header state
│   │   ├── quiz-engine.js        # Quiz state machine, scoring, progression (~1,310 lines)
│   │   ├── topics.js             # Thin facade — delegates to question-bank.js
│   │   ├── question-bank.js      # All static question data and personality types
│   │   ├── quiz-renderer.js      # Pure HTML generation for questions and results
│   │   ├── quiz-scoring.js       # Pure scoring utils (getDominantType, getScoreMessage)
│   │   ├── quiz-timer.js         # Loading-fallback timer utility
│   │   ├── premium.js            # Stripe Payment Links, tier gating, upgrade modal
│   │   ├── user-manager.js       # User profile, quiz history → Firestore
│   │   ├── ui-manager.js         # UI state management, screen transitions, daily challenge
│   │   └── analytics.js          # GA4 event tracking (7 event types)
│   │
│   ├── components/               # UI components (IIFE pattern)
│   │   ├── header.js             # Navigation, auth state, theme, bottom nav
│   │   ├── footer.js             # Site footer
│   │   └── mobile-menu.js        # Hamburger menu toggle
│   │
│   ├── utils/                    # Shared utilities
│   │   ├── utils.js              # General helpers & logger
│   │   ├── storage.js            # LocalStorage wrapper
│   │   ├── api.js                # HTTP client (exponential backoff retry)
│   │   ├── audio.js              # Sound effect management
│   │   ├── feature-flags.js      # Feature flag system
│   │   └── error-reporter.js     # Global error capture → GA4 (Phase 7)
│   │
│   └── [pre-built live presenter bundles — do not edit]
│       ├── runtime.*.js
│       ├── vendors.*.js
│       ├── vendor.*.js
│       ├── live-presenter.*.js
│       ├── live-audience.*.js
│       ├── 915.*.js              # AuthModal chunk (lazy)
│       ├── 889.*.js              # PremiumModal chunk (lazy)
│       └── 763.*.js              # PaymentService chunk (lazy)
│
├── functions/                    # Firebase Cloud Functions (Node.js 20, europe-west2)
│   ├── index.js                  # All function exports (~480 lines)
│   └── package.json
│
├── css/
│   ├── base.css                  # CSS reset & base styles (hardcoded hex values)
│   ├── theme.css                 # Colors, gradients, dark mode, animations, PWA UI
│   ├── layout.css                # Grid, flexbox, responsive, personality results
│   ├── components.css            # Component-specific styles
│   ├── components/               # CSS component library (Phase 7)
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── modals.css
│   │   └── inputs.css
│   ├── header.css                # Header styles
│   ├── auth-styles.css           # Authentication modal styles
│   └── main.css                  # Additional overrides
│
├── assets/
│   ├── fonts/                    # Roboto font family (woff/woff2)
│   ├── icons/                    # PWA icons (icon-192.png, icon-512.png)
│   ├── images/                   # WebP images — max 800×800px, quality 85
│   │   ├── psychiatry/           # 10 psychiatry topic placeholder images
│   │   └── spirit-animals/       # 20 spirit animal images
│   └── sounds/                   # Audio feedback (wav/mp3)
│
├── templates/                    # Quiz data (JSON, fetched at runtime)
│   ├── personality-quizzes/      # 14 personality quiz templates
│   └── premium-quizzes/          # 2 premium quiz templates
│
├── tests/
│   ├── unit/                     # Jest unit tests (66 tests, 3 suites)
│   │   ├── quiz-scoring.test.js
│   │   ├── analytics.test.js
│   │   └── auth-manager.test.js
│   └── e2e/                      # Playwright E2E tests (3 specs)
│       ├── quiz-flow.spec.js
│       ├── personality-flow.spec.js
│       └── daily-challenge.spec.js
│
└── docs/development/             # Development documentation
    ├── DEVELOPMENT_PLAN.md       # Full phase roadmap
    ├── PROMPT_FRAMEWORK.md       # Phase prompt/handoff templates
    ├── TESTING.md                # Test strategy and manual checklist
    ├── PHASE[N]_PROMPT.md        # Session start prompts
    ├── PHASE[N]_HANDOFF.md       # Phase completion summaries
    └── debug app/                # Native Android WebView debug app (Phase 11)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI: `npm install -g firebase-tools`
- Access to Firebase project `quizpros`

### Local Development

```bash
# Install dependencies
npm install

# Build the webpack bundle
npm run build

# Serve locally (Firebase)
npm run serve

# Or serve directly from dist/
npx serve dist
```

### Available npm Scripts

| Command | Action |
|---------|--------|
| `npm run build` | Production webpack build → `dist/` |
| `npm run build:dev` | Development build (source maps, unminified) |
| `npm start` | webpack-dev-server with hot reload |
| `npm run deploy` | Build + `firebase deploy --only hosting` |
| `npm run serve` | `firebase serve --only hosting` |
| `npm test` | Jest unit tests (66 tests, 3 suites) |
| `npm run test:e2e` | Playwright E2E tests (requires running dev server) |

---

## 🔥 Deployment

### Deploy Hosting Only
```bash
npm run build
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Cloud Functions
```bash
firebase login --reauth   # if CLI auth has expired
firebase deploy --only functions
```

### Deploy Everything
```bash
npm run build
firebase deploy --only hosting,firestore:rules,database,functions
```

> **Note:** Node.js is not on PATH in MSYS bash — use full path:
> - Node: `/c/Program Files/nodejs/node.exe`
> - npm: `/c/Program Files/nodejs/npm.cmd`
> - firebase: `/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js`

---

## ☁️ Cloud Functions

All functions deployed to `europe-west2` (London), Node.js 20 runtime.

| Function | Type | Description |
|----------|------|-------------|
| `generateQuiz` | Callable | AI quiz generation via Gemini 1.5 Flash; supports `promptPrefix` (300-char cap) |
| `getUserUsageStats` | Callable | Monthly AI usage + tier limits |
| `getGeneratedQuiz` | Callable | Fetch a generated quiz by Firestore ID |
| `listUserQuizzes` | Callable | List all AI-generated quizzes for user |
| `deleteGeneratedQuiz` | Callable | Delete a generated quiz document |
| `generateAdaptiveQuestion` | Callable | Single follow-up question for live sessions |
| `createPortalSession` | Callable | Creates Stripe Customer Portal session; returns redirect URL |
| `stripeWebhook` | HTTP | Stripe subscription lifecycle; writes to `users/{uid}.subscription` map field |
| `cleanupExpiredSessions` | Scheduled | Daily — deletes RTDB sessions with `createdAt` older than 24 hours |

**Rate limits:** Basic/Free = 5/month · Premium = 100/month · Pro = 500/month · Enterprise = unlimited

**Admin bypass:** Admin UID gets Enterprise tier + unlimited AI generation (no rate limit).

**Stripe webhook URL:**
```
https://europe-west2-quizpros.cloudfunctions.net/stripeWebhook
```
Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 🔒 Firestore Security Rules

Rules live in `firestore.rules` and are deployed via `firebase.json`.

| Collection | Access |
|-----------|--------|
| `_health/{docId}` | Read: authenticated only (live presenter heartbeat) |
| `live_sessions` | Read: public · Create: authenticated · Update/delete: session owner |
| `live_sessions/.../slides` | Write: presenter-ID match only |
| `live_sessions/.../responses` | Create: anyone · Update: immutable after submission |
| `live_sessions/.../aggregations` | Write: presenter-ID match only |
| `users/{uid}` | Read/write: owner only |
| `users/{uid}/usage` | Read: owner · Write: Cloud Functions only |
| `users/{uid}/quizHistory` | Read/write: owner |
| `users/{uid}/subscription` | Read: owner · Write: Cloud Functions only |
| `generatedQuizzes` | Read: owner · Write: Cloud Functions only |
| `quizStats/{topicId}` | Read: public · Write: numeric fields only (playCount, answer distribution) |
| `dailyLeaderboard/{date}/scores/{uid}` | Read: public · Write: owner only |
| `sessionArchive/{code}` | Read: authenticated · Create/update/delete: presenter (owner) only |

---

## ⚙️ Configuration

All configuration lives in `js/config.js` (`window.QuizProsConfig`):

- `app` — Name, version, base URL
- `firebase` — Firebase project credentials
- `features` — Feature flags (darkMode, premium, debug, etc.)
- `analytics` — GA4 tracking ID
- `premium` — Tier definitions, pricing, gated quiz IDs
- `stripe` — Publishable key, Payment Link URLs
- `quiz` — Default question count, timing
- `paths` — Default image and template paths
- `admin` — Admin UID for bypass and admin dashboard access

> `premium.html` has its own inline Firebase init and `PAYMENT_LINKS` constant — it does **not** read from `config.js`. Keep them in sync if credentials change.
> `dashboard.html` also has its own inline Firebase init using the same pattern.

---

## 🗺️ Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Auth consolidation, code organization, bug fixes |
| Phase 2 | ✅ Complete | Webpack build pipeline, SEO, image optimization |
| Phase 2B | ✅ Complete | 48 WebP personality images, live presenter recovery |
| Phase 3 | ✅ Complete | Cloud Functions, Stripe Payment Links, premium gating, Firestore rules |
| Phase 3.1 | ✅ Complete | UI fixes: dark mode, footer, nav, profile/history modals |
| Phase 3.2 | ✅ Complete | Pricing restructure (4 tiers), firebase-functions v5 upgrade, Stripe links updated |
| Phase 4 | ✅ Complete | Premium dashboard, Stripe Customer Portal, RTDB security rules, brand colour audit |
| Phase 5 | ✅ Complete | Live presenter extension layer: word cloud, rating, true/false, timer; retake flow; dashboard nav |
| Phase 5B | ✅ Complete | Per-question explanations, progress saving, streaks, timed mode, QR join, 2 knowledge topics, 3 personality quizzes |
| Phase 5C | ✅ Complete | Lock/show-hide results, open-ended questions, waiting screen, score trends, SEO/sitemap |
| Phase 6 | ✅ Complete | Leaderboard (presenter + audience), server timestamp sync, retake UX modal, ARIA accessibility |
| Phase 6.1 | ✅ Complete | UI/UX modernization: hero, skeleton loaders, dark-mode auto, animations, bottom nav, keyboard nav, haptic |
| Phase 7 | ✅ Complete | GA4 analytics (7 events), error reporter, API retry, nickname overlay, audience leaderboard, shareable result card, "how others answered", pull-to-refresh, 11 personality images, Jest unit tests |
| Phase 8 | ✅ Complete | PWA (manifest, service worker, install prompt, offline support), Firestore/Storage rules hardening |
| Phase 9 | ✅ Complete | 25 questions/topic + difficulty levels, Q&A mode, ranking, emoji reactions, CSV export, daily challenge |
| Phase 10 | ✅ Complete | Q&A upvoting, daily leaderboard, session archive, PDF export, admin dashboard, quiz embed iframe, Playwright E2E tests |
| Phase 11 | ✅ Complete | Session archive title, Playwright CI, QR share overlay, quiz search/filter, mobile sign-in hardening (CSP + auth fixes) |
| Phase 12 | ✅ Complete | Healthcare category: 250 psychiatry questions (10 topics), psych score profiles, placeholder images, AI generation presets |
| Phase 13 | ✅ Complete | Landing page at `/`, MedEd Hub at `/meded`, 2 free diagnostic quizzes, diagnostic results routing |
| Phase 14 | 🔜 Next | Study mode, emergency medicine category, MedEd conversion tracking, dynamic page titles |

See `docs/development/DEVELOPMENT_PLAN.md` for the full roadmap.

---

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm test
```
66 tests across 3 suites:
- `tests/unit/quiz-scoring.test.js` — getDominantType, getScoreMessage (all 5 brackets, psych profiles)
- `tests/unit/analytics.test.js` — 7 GA4 event methods, offline queue fallback
- `tests/unit/auth-manager.test.js` — public API shape, auth state changes, display name, sign-in cycles

### E2E Tests (Playwright)
```bash
# First time only
npx playwright install chromium

# Start dev server in one terminal
npm start

# Run E2E tests
npm run test:e2e
```
3 specs: `quiz-flow`, `personality-flow`, `daily-challenge` (includes embed mode).

---

## 📄 License

© 2026 iQuizPros. All Rights Reserved.
