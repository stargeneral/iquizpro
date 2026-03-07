# 🗺️ iQuizPros Development Plan

**Version:** 5.0 Roadmap
**Start Date:** February 2026 | **Updated:** March 2026
**Goal:** Make iQuizPros the best interactive quiz platform in its class — better than Kahoot, Mentimeter, BuzzFeed Quizzes, Sporcle, and Quizgecko combined.

---

## 📊 Current State Assessment

### What's Working Well
- ✅ Live site at iquizpro.com serving users
- ✅ 14+ personality quizzes across 6 categories
- ✅ Knowledge quizzes for multiple topics
- ✅ Firebase Auth with email and Google sign-in
- ✅ Live presentation system (presenter + audience)
- ✅ Stripe payment integration scaffolded
- ✅ Social sharing (WhatsApp, Facebook, Twitter)
- ✅ Mobile-responsive design
- ✅ Audio feedback and confetti celebrations

### What Needs Work
- ⚠️ 6+ auth fix scripts layered on top of each other
- ⚠️ No build/minification pipeline for main app (30+ script tags)
- ⚠️ quiz-engine.js (55KB) and topics.js (37KB) are monolithic
- ⚠️ No automated testing
- ⚠️ Live presenter features at ~58% feature parity with Mentimeter
- ⚠️ Premium payment flow incomplete
- ⚠️ No accessibility (ARIA, keyboard nav, screen readers)
- ⚠️ No PWA/offline support despite config flag
- ⚠️ Limited SEO (single-page app, no meta tags per quiz)

---

## 🎯 Development Phases

### Phase 1: Foundation & Cleanup (Weeks 1-2)
> **Goal:** Stabilize codebase, set up proper development workflow, eliminate technical debt.

#### 1.1 Development Environment Setup
- [ ] Initialize Firebase CLI in project directory (`firebase init`)
- [ ] Create `firebase.json` and `.firebaserc` configuration
- [ ] Set up `firebase serve` for local development
- [ ] Create a staging/preview channel: `firebase hosting:channel:deploy staging`
- [ ] Add `.gitignore` and initialize Git repository
- [ ] Create `package.json` for development tooling

#### 1.2 Authentication Consolidation
**Priority: HIGH** — Current auth system has 6+ overlapping fix scripts.

- [ ] Audit all auth-related files and map their responsibilities:
  - `firebase-auth-fix.js` → Firebase init guard
  - `auth-service-fix-v2.js` → GoogleAuthProvider fix
  - `auth-fix.js` → State listener
  - `auth-persistence-fix.js` → Session handling
  - `auth-button-fix.js` → UI binding
  - `direct-auth-fix.js` → Modal fallback
  - `modules/auth-service.js` → Core service
  - `modules/auth-ui.js` → UI components
  - `modules/auth-helper.js` → Utilities
  - `components/auth-header-integration.js` → Header state
- [ ] Create unified `modules/auth-manager.js` that combines all functionality:
  - Firebase initialization guard
  - Email/password and Google sign-in
  - Auth state persistence and listeners
  - Modal UI rendering and event binding
  - Header integration
  - Error handling with user-friendly messages
- [ ] Remove all legacy auth fix scripts from index.html
- [ ] Test all auth flows: signup, login, logout, Google sign-in, session persistence, premium gating

#### 1.3 Code Organization
- [ ] Split `quiz-engine.js` (55KB) into focused modules:
  - `quiz-state.js` — Quiz state machine and progression
  - `quiz-scoring.js` — Score calculation and results
  - `quiz-timer.js` — Question timing logic
  - `quiz-renderer.js` — Question/option DOM rendering
- [ ] Split `topics.js` (37KB) into:
  - `topic-registry.js` — Topic definitions and categories
  - `topic-loader.js` — JSON template fetching
  - `question-bank.js` — Knowledge quiz question data
- [ ] Split `header.js` (644 lines) into:
  - `header.js` — Core header structure
  - `mobile-menu.js` — Mobile hamburger menu logic
  - `header-auth.js` — Auth state display in header

#### 1.4 Bug Fixes & Quick Wins
- [ ] Audit browser console for errors on all quiz topics
- [ ] Fix any quiz topics loading incorrect questions
- [ ] Ensure footer doesn't overlap interactive elements on mobile
- [ ] Verify all social sharing links generate correctly
- [ ] Fix any broken image paths in zodiac/spirit animal quizzes

---

### Phase 2: Build Pipeline & Performance (Weeks 3-4)
> **Goal:** Implement proper build tooling for minification, bundling, and optimized delivery.

#### 2.1 Build System
- [ ] Configure webpack to bundle ALL modules (not just live features)
- [ ] Set up development and production configurations:
  ```
  npm start     → webpack-dev-server with hot reload
  npm run build → minified production bundle
  npm run deploy → build + firebase deploy
  ```
- [ ] Implement CSS bundling and minification
- [ ] Add source maps for development debugging
- [ ] Create build script that copies static assets (images, fonts, sounds, templates)

#### 2.2 Performance Optimization
- [ ] **Bundle reduction:** 30+ script tags → 2-3 bundled files
- [ ] **Lazy loading:** Load quiz templates on-demand, not at startup
- [ ] **Image optimization:** Convert remaining JPEGs to WebP, add responsive `srcset`
- [ ] **Code splitting:** Separate bundles for:
  - Core app (quiz selection, engine)
  - Auth module (loaded when needed)
  - Premium module (loaded for premium users)
  - Live presenter (loaded for presenters only)
  - Live audience (loaded for audience only)
- [ ] **Caching strategy:** Add cache-busting hashes to all bundles
- [ ] **Critical CSS:** Inline above-the-fold CSS
- [ ] Target: Lighthouse Performance score > 90

#### 2.3 SEO & Meta Tags
- [ ] Add unique `<title>` and `<meta description>` per quiz type
- [ ] Implement Open Graph tags for rich social sharing previews
- [ ] Add structured data (JSON-LD) for quiz content
- [ ] Create `sitemap.xml` for search engine discovery
- [ ] Add `robots.txt`
- [ ] Implement dynamic page titles based on active quiz

---

### Phase 3: Premium & Payment System (Weeks 5-6)
> **Goal:** Complete the Stripe integration and create a seamless premium experience.

#### 3.1 Stripe Payment Flow
- [ ] Implement complete Stripe Checkout flow:
  - Pricing page with tier comparison
  - Checkout session creation (requires backend Cloud Function)
  - Payment success/failure handling
  - Subscription status sync with Firebase
- [ ] Create Firebase Cloud Function for Stripe webhook handling
- [ ] Implement subscription management (upgrade, downgrade, cancel)
- [ ] Add receipt/invoice email integration
- [ ] Handle edge cases: failed payments, expired cards, grace periods

#### 3.2 Premium Feature Gating
- [ ] Implement `PremiumGuard` — checks subscription status before access
- [ ] Gate premium quizzes (Career Deep Dive, Emotional Intelligence)
- [ ] Gate premium features:
  - Detailed personality analysis reports
  - Comparative results against other users
  - Downloadable PDF quiz reports
  - Ad-free experience
  - Quiz history and retake tracking
- [ ] Create upgrade prompts that appear when free users hit premium content
- [ ] Implement free trial period (7-day trial option)

#### 3.3 Premium Dashboard Enhancement
- [ ] Quiz history with date, score, and topic tracking
- [ ] Score trends over time (chart visualization)
- [ ] Personality profile aggregation across quizzes
- [ ] Comparative stats (how you compare to average)
- [ ] Downloadable PDF reports of quiz results

---

### Phase 4: Live Presentation System (Weeks 7-9)
> **Goal:** Achieve full Mentimeter feature parity for the live presentation system.

#### 4.1 Presenter Features
- [ ] **Session Management:**
  - Create session with unique join code
  - QR code generation for easy audience joining
  - Session timer and auto-close
  - Session history and replay
- [ ] **Question Types:**
  - Multiple choice (existing)
  - Word cloud responses
  - Open-ended text responses
  - Rating scale (1-5, 1-10)
  - Ranking/ordering questions
  - True/False quick polls
- [ ] **Presentation Controls:**
  - Advance/go back between questions
  - Lock/unlock responses
  - Show/hide results to audience
  - Timer per question with auto-advance
  - Pause/resume session
- [ ] **Real-time Visualizations:**
  - Live bar charts for multiple choice
  - Animated word clouds
  - Response count ticker
  - Leaderboard for competitive sessions

#### 4.2 Audience Features
- [ ] **Simplified join flow:** Enter code → see question → respond
- [ ] **Mobile-optimized interface** — Large touch-friendly buttons
- [ ] **Waiting screen** between questions with engagement animations
- [ ] **Personal score tracker** during competitive sessions
- [ ] **Reaction system** — Emoji reactions to questions
- [ ] **Accessibility** — Screen reader support for audience view

#### 4.3 Session Infrastructure
- [ ] Optimize Firebase Realtime Database rules for live sessions
- [ ] Implement session cleanup (auto-delete after 24 hours)
- [ ] Add connection monitoring (handle disconnects gracefully)
- [ ] Scale testing — verify performance with 50+ simultaneous participants
- [ ] Add rate limiting to prevent spam responses

---

### Phase 5: New Quiz Content & Features (Weeks 10-12)
> **Goal:** Expand quiz library and add engaging new quiz types.

#### 5.1 New Knowledge Quiz Topics
- [ ] **Technology & Computing** — Programming, AI, internet history
- [ ] **Sports** — Football, basketball, Olympics, cricket
- [ ] **Music** — Artists, genres, song identification
- [ ] **Food & Cooking** — Cuisines, ingredients, cooking techniques
- [ ] **Movies & TV** — Plot questions, actor trivia, show identification
- [ ] **Current Events** — Weekly updated news quizzes
- [ ] **Uganda Enhanced** — Expanded Uganda quiz with culture, landmarks, history

#### 5.2 New Personality Quiz Types
- [ ] **Color Personality** — What color matches your personality
- [ ] **Travel Destination** — Where should you travel next
- [ ] **Music Taste Profile** — What genre defines you
- [ ] **Stress Response Style** — How do you handle pressure
- [ ] **Love Language** — Expanded from communication quiz
- [ ] **Work-Life Balance** — Assessment with actionable insights

#### 5.3 Quiz System Enhancements
- [ ] **Difficulty Levels** — Easy, Medium, Hard per topic
- [ ] **Timed Mode** — Optional countdown timer per question
- [ ] **Streak System** — Track consecutive correct answers
- [ ] **Daily Challenge** — New quiz every day with leaderboard
- [ ] **Quiz Builder** — Let users create and share their own quizzes
- [ ] **Question Pool Randomization** — Different questions each attempt
- [ ] **Explanation Mode** — Show why each answer is correct after answering
- [ ] **Progress Saving** — Resume quizzes across sessions

---

### Phase 6: UI/UX Modernization (Weeks 13-15)
> **Goal:** Create a polished, professional user interface that stands out.

#### 6.1 Design System
- [ ] Create consistent design tokens (colors, spacing, typography, shadows)
- [ ] Build reusable component library (buttons, cards, modals, inputs)
- [ ] Implement proper dark mode with system preference detection
- [ ] Add smooth page transitions and micro-animations
- [ ] Create loading skeletons instead of spinner

#### 6.2 Homepage Redesign
- [ ] Hero section with featured/trending quizzes
- [ ] Category browsing with visual cards
- [ ] "Continue where you left off" section for returning users
- [ ] Popular quizzes section with play counts
- [ ] Testimonials or user stats section
- [ ] Clear CTA for premium subscription

#### 6.3 Quiz Experience
- [ ] Animated question transitions (slide/fade)
- [ ] Progress indicator with question numbers
- [ ] Visual feedback on answer selection (not just color change)
- [ ] Results page with animated score reveal
- [ ] Shareable result cards (generated images for social media)
- [ ] "How others answered" comparison after each question

#### 6.4 Mobile Optimization
- [ ] Bottom navigation bar for mobile
- [ ] Swipe gestures for navigation
- [ ] Touch-optimized option buttons (larger hit targets)
- [ ] Pull-to-refresh on quiz listings
- [ ] Haptic feedback on answer selection (where supported)

#### 6.5 Accessibility (WCAG 2.1 AA)
- [ ] Semantic HTML throughout (`<main>`, `<nav>`, `<section>`, `<article>`)
- [ ] ARIA labels on all interactive elements
- [ ] Full keyboard navigation support
- [ ] Focus management in modals and quizzes
- [ ] Color contrast compliance (4.5:1 minimum)
- [ ] Screen reader announcements for quiz progression
- [ ] Reduced motion option for animations
- [ ] Skip navigation links

---

### Phase 7: Analytics, Testing & Quality (Weeks 16-17)
> **Goal:** Ensure reliability, measure engagement, and maintain quality.

#### 7.1 Analytics Enhancement
- [ ] Enhanced event tracking for quiz engagement:
  - Quiz start, completion, abandonment rates
  - Time spent per question
  - Most/least popular quiz topics
  - Conversion funnel: visitor → quiz taker → authenticated → premium
- [ ] Dashboard for quiz analytics (admin-only)
- [ ] A/B testing framework for UI experiments
- [ ] User behavior heatmaps (Hotjar or similar)

#### 7.2 Error Monitoring
- [ ] Centralized error handler with reporting
- [ ] Integration with error tracking service (Sentry or Firebase Crashlytics)
- [ ] User-friendly error pages (404, offline, server error)
- [ ] Automatic retry for failed API/Firebase calls
- [ ] Health check endpoint

#### 7.3 Testing
- [ ] Unit tests for quiz-engine scoring logic
- [ ] Unit tests for auth state management
- [ ] Integration tests for quiz flow (start → answer → results)
- [ ] E2E tests for critical paths (Playwright or Cypress):
  - Homepage → Select topic → Complete quiz → See results
  - Signup → Login → Access premium
  - Create live session → Join → Participate
- [ ] Visual regression tests for key pages
- [ ] Performance budget tests (bundle size, load time)

---

### Phase 8: Infrastructure & Scaling (Weeks 18-20)
> **Goal:** Prepare for growth with proper infrastructure.

#### 8.1 Backend (Firebase Cloud Functions)
- [ ] Create Cloud Functions for:
  - Stripe webhook handling
  - User registration triggers (welcome email)
  - Premium subscription management
  - Live session management (create, validate, cleanup)
  - Quiz analytics aggregation
- [ ] Implement Firebase Security Rules:
  - Firestore: User data read/write rules
  - Realtime Database: Session access rules
  - Storage: File upload restrictions

#### 8.2 PWA (Progressive Web App)
- [ ] Service worker for offline quiz caching
- [ ] Web app manifest (`manifest.json`)
- [ ] Install prompt for mobile users
- [ ] Offline quiz mode (cached quiz data)
- [ ] Background sync for quiz results when back online
- [ ] Push notifications for daily challenges

#### 8.3 Migration Option: Ubuntu Server
When ready to move from Firebase Hosting to the Ubuntu server (96.9.215.5):
- [ ] Set up Nginx as reverse proxy
- [ ] Configure SSL via Let's Encrypt
- [ ] Set up CI/CD pipeline (GitHub Actions → SSH deploy)
- [ ] Configure Apache/Nginx for SPA routing (like .htaccess)
- [ ] Update DNS for iquizpro.com to point to server IP
- [ ] Keep Firebase services (Auth, Firestore, Realtime DB) — only hosting moves
- [ ] Set up server monitoring and auto-restart (PM2 or systemd)
- [ ] Configure CDN (Cloudflare free tier) for static assets

---

### Phase 9: Quality, Content & Competitive Parity (Phase 9 — March 2026+)
> **Goal:** Close all remaining gaps vs Mentimeter / Kahoot / Sporcle, ship missing features from earlier phases, and make iQuizPros the undisputed best quiz platform.

#### 9.1 Quiz Content & Answer Quality
- [x] **Answer explanation mode** — show why each answer is correct after selection (`explanation` field on every question, already rendered by quiz-engine.js)
- [x] **Difficulty levels** — Easy / Medium / Hard filter per knowledge quiz topic; stored in `localStorage('iqp_difficulty')`; questions tagged with `difficulty` field in question-bank.js
- [x] **Question pool randomization** — each topic expanded to 30+ questions; `getRandomQuestions(topicId, count, difficulty)` in question-bank.js draws a random subset each attempt for replayability
- [x] **Missing personality quiz images** — Music Taste (rocker, soulful, explorer, popstar), Stress Response (fighter, planner, connector, withdrawer), Work-Life Balance (achiever, integrator, separator, recharger) — 12 new WebP images
- [ ] **Current Events topic** — Weekly-updated news quiz (requires editorial workflow)
- [ ] **Uganda enhanced** — Expand to 40 questions covering culture, landmarks, history, language

#### 9.2 Live Presentation — Closing Mentimeter Gap
- [x] **Ranking / ordering question type** — Presenter sets ordered items; audience taps to rank them; aggregate ranking shown in results panel
- [x] **Q&A mode** — Audience submits open questions; presenter can highlight and dismiss; question queue shown in results panel
- [x] **Emoji reaction system** — Floating emoji overlay on audience; reactions stored in RTDB `sessions/{code}/reactions`; presenter sees live reaction feed
- [x] **Session CSV export** — Download all responses for a session as a CSV file (name, slide, response, timestamp)
- [ ] **Session history & replay** — Store completed sessions in Firestore; presenter can replay or share session results link
- [ ] **Slide deck integration** — Import slides from Google Slides / PowerPoint for hybrid presentation+poll sessions
- [ ] **Audience Q&A upvoting** — Audience can upvote submitted Q&A questions to surface the best ones

#### 9.3 Daily Challenge System
- [x] **Daily challenge** — Deterministic date-seeded question selection (10 questions from the full pool); one challenge per day, same for all users; completion tracked in localStorage + optional Firestore leaderboard
- [x] **Daily challenge UI** — "Daily Challenge" banner on homepage with countdown timer to next challenge + today's topic
- [ ] **Global daily leaderboard** — Firestore-backed leaderboard showing top scores for each day's challenge

#### 9.4 Quality & Testing (Deferred from Phase 7)
- [ ] **E2E tests (Playwright)** — Critical paths: homepage→quiz→results, signup→login, live presenter create→audience join
- [ ] **Visual regression tests** — Key page screenshots compared on each build
- [ ] **Performance budget CI** — Lighthouse CI in GitHub Actions; fail build if score drops below 85
- [ ] **Admin analytics dashboard** — Internal page showing quiz play counts, completion rates, conversion funnel, top topics; Firebase data; auth-gated to admin UID
- [ ] **A/B testing framework** — Simple client-side flag + Firestore experiment tracking
- [ ] **Sentry / Firebase Crashlytics** — Stack traces for production JS errors (currently only GA4 events)

#### 9.5 Premium & Monetisation (Deferred from Phase 3)
- [ ] **PDF result export** — Download a formatted PDF of quiz results / personality analysis
- [ ] **Free trial period** — 7-day trial of Premium tier for new signups
- [ ] **Receipt / invoice email** — Triggered by `stripeWebhook` via SendGrid or Firebase Email Extension
- [ ] **Comparative stats** — "How you compare to all users" chart on results and dashboard
- [ ] **Quiz embed** — Shareable `<iframe>` embed code for AI-generated quizzes to post on other sites

#### 9.6 AI Quiz Generation — Expansion (Competitive Differentiator)
- [ ] **Document-to-quiz** — Upload a PDF / paste text; Gemini extracts topic and generates quiz
- [ ] **URL-to-quiz** — Paste a Wikipedia URL or article link; auto-generate quiz from content
- [ ] **Subject area presets** — One-click "GCSE Maths", "A-Level History", "AWS Certification" quiz generation
- [ ] **Adaptive difficulty** — Generate follow-up questions based on correct/incorrect answers in AI quiz

#### 9.7 Accessibility Full Audit (Deferred from Phase 6)
- [ ] Full WCAG 2.1 AA audit across all pages using axe-core or Lighthouse accessibility
- [ ] Fix all remaining contrast, focus, ARIA issues identified in audit
- [ ] Screen reader testing with NVDA / VoiceOver

#### 9.8 Infrastructure Carry-forwards
- [ ] **Firebase Storage activation** — Visit Firebase Console → Storage → "Get Started" then `firebase deploy --only storage`
- [ ] **Push notifications** — Daily challenge reminder via Web Push API (requires VAPID key setup)
- [ ] **Performance (Phase 8.3)** — Firebase SDK CDN loading; zodiac JPEG compression
- [ ] **Ubuntu server migration (optional)** — Nginx + Let's Encrypt + GitHub Actions CI/CD (see Phase 8.3 in original plan)

---

### Phase 10: Retention, Parity & Reporting (Phase 10 — March 2026+)
> **Goal:** Close the final P2 competitive gaps vs Mentimeter and Sporcle, add premium reporting features, improve operational visibility, and establish E2E test coverage. Post-Phase-9 audit showed average parity at ~77%; Phase 10 targets ~85%+.

#### 10.1 Q&A Upvoting (Live Presenter / Audience)
> *Closes Mentimeter Q&A upvoting gap. Extends the Phase 9 Q&A system — no new infrastructure needed.*

- **Audience side (`live-audience.html`):** Each Q&A entry shows a 👍 count + upvote button; one upvote per user per question
  - Anonymous vote key: `localStorage('iqp_anon_id')` UUID if unauthenticated; Firebase `auth.uid` if authenticated
  - Vote written to RTDB `sessions/{code}/qa/{key}/votes/{voterId}` = `true` (no-retract, `!data.exists()` rule)
- **Presenter side (`live-presenter.html`):** `renderQAList()` reads vote counts, re-sorts list by votes descending, shows vote badge
- **RTDB rules (`database.rules.json`):** Add `votes/$voterId` under `qa/$qaKey`: `.write: "!data.exists()"`, `.validate: "newData.val() === true"`
- **Acceptance criteria:** Audience taps 👍 → count increments live on presenter overlay; cannot upvote same question twice; sorted by popularity

#### 10.2 Global Daily Leaderboard
> *Closes Sporcle daily leaderboard gap. High retention impact — gives users a reason to return daily.*

- **Firestore collection:** `dailyLeaderboard/{YYYY-MM-DD}/scores/{uid}` — `{ nickname, score, topicId, completedAt }`
  - `score` = correct answer count (0–10); stored as integer for simple sorting
  - Only authenticated users written; anonymous users see leaderboard read-only
- **`js/modules/ui-manager.js`:**
  - `_loadDailyLeaderboard()` — reads top 10 by `score` desc from today's Firestore subcollection; renders `#daily-leaderboard-section` below the daily challenge card
  - `completeDailyChallenge(quizId, correctCount)` — updated signature; writes to Firestore if authenticated
- **`js/modules/quiz-engine.js`:** Pass `correctCount` in `quizpros:quiz:completed` CustomEvent detail
- **`app.js`:** Forward `correctCount` from the event to `completeDailyChallenge()`
- **Firestore rules:** `dailyLeaderboard/{date}/scores/{uid}` — create/update by owner; read by anyone
- **Acceptance criteria:** Top 10 shown below daily card; user's own row highlighted; refreshes after quiz completion

#### 10.3 Session History & Archive
> *Closes Mentimeter "session replay" gap. Lets presenters review past sessions without keeping RTDB data alive.*

- **On "End Session"** in `live-presenter.html`: write archive document to Firestore `sessionArchive/{code}`:
  - `{ presenterId, date, title, participantCount, slides: [{type, text, options, responseSummary}], topScores: [{nickname, score}], endedAt }`
  - `responseSummary` is an aggregate count object `{ 'A': 12, 'B': 5, ... }` derived from reading RTDB `responses` before close
- **`dashboard.html`:** New "Past Sessions" tab/section
  - Lists archived sessions (title, date, participant count)
  - Clicking a session shows read-only replay: each slide's question + bar chart of response distribution
  - Bar chart rendered with inline SVG or `<progress>` bars — no charting library needed
- **Firestore rules:** `sessionArchive/{code}` — write/read by authenticated presenter (`presenterId === auth.uid`) only
- **Acceptance criteria:** Session shows in dashboard after presenter ends it; slide-by-slide view works; no RTDB data needed after archive

#### 10.4 PDF Result Export (Premium Feature)
> *Closes Mentimeter + Quizgecko PDF export gap. Drives premium conversion.*

- **Lazy-load** `html2canvas` + `jsPDF` from CDN only when user requests export (no bundle size impact)
- **`js/modules/quiz-engine.js`:** New `_exportResultsPDF()` function
  - Captures the `#results-container` element via `html2canvas`
  - Adds header (iQuizPros logo text, quiz title, date) and footer (iquizpro.com) via jsPDF
  - For knowledge quizzes: includes all questions, user's answer, correct answer, explanation
  - For personality quizzes: includes result type, description, and trait breakdown
- **Premium gate:** Check `QuizProsPremium.getUserTier()` → if free tier, show upgrade modal instead
- **UI:** "📄 Download PDF" button added to results page alongside existing share buttons; only visible if premium or for AI-generated quizzes (additional hook)
- **Acceptance criteria:** PDF downloads with correct content; non-premium users see upgrade prompt; file named `iquizpros_{topic}_{date}.pdf`

#### 10.5 Admin Analytics Dashboard
> *Internal operational visibility. Auth-gated to admin UID defined in config.*

- **New `admin.html`** (standalone page, same pattern as `dashboard.html`)
  - Inline Firebase init, auth check on load: if `currentUser.uid !== QuizProsConfig.adminUid` → redirect to `/`
  - `config.js`: new field `adminUid: ''` (set to real admin UID before deploy)
- **Sections:**
  - **Top Quizzes by Play Count** — reads `quizStats/{topicId}.playCount` for all topics; renders sorted table
  - **Daily Challenge Completions** — reads today's `dailyLeaderboard/{date}/scores` count
  - **Registered Users** — reads `users` collection count (approximate via `getCountFromServer()`)
  - **Live Sessions Today** — reads RTDB `sessions` node, counts sessions with `createdAt` in last 24h
  - **AI Quiz Generations** — reads `users/{uid}/usage/{YYYY-MM}` docs; sums `generateCount`
- **CopyPlugin:** Add `admin.html` to webpack `CopyPlugin` patterns so it copies to `dist/`
- **Acceptance criteria:** Page loads for admin UID; redirects for all other users; all sections render data from Firestore/RTDB

#### 10.6 Quiz Embed (iframe Support)
> *Closes Quizgecko embed gap. Allows AI-generated quizzes to be embedded on external sites.*

- **Embed mode detection:** `app.js` init reads `new URLSearchParams(location.search).get('embed')`; if `'1'`, sets `window._iqpEmbedMode = true`
- **Embed mode behaviour:**
  - Hide header, footer, bottom nav, install prompt, daily challenge section
  - No auth prompts; no premium gates (embed is always free-play)
  - Results page shows score + "Play more on iQuizPros ↗" CTA (link opens in parent window)
  - Compact CSS: reduce padding, hide non-essential UI elements
- **`js/modules/ui-manager.js`:** Check `window._iqpEmbedMode` in `initTopicSelectionUI()` — show only the specified quiz if `?quizId=` param present
- **`dashboard.html`:** AI quiz library section gets "Get Embed Code" button per quiz — copies iframe snippet to clipboard
- **Embed URL format:** `https://iquizpro.com?embed=1&quizId={generatedQuizId}`
- **Acceptance criteria:** Embed URL shows just the quiz; no header/footer; "Play more" CTA present; dashboard generates correct embed snippet

#### 10.7 E2E Tests (Playwright)
> *Deferred from Phase 7. Gives confidence that critical paths work after each deploy.*

- **Install:** `npm install --save-dev @playwright/test` + `npx playwright install chromium`
- **`tests/e2e/` directory** — new top-level test folder
- **Test files:**
  - `quiz-flow.spec.js` — homepage → select Science topic → answer 5 questions → see results page
  - `personality-flow.spec.js` — select Love Language quiz → answer all questions → see personality type result
  - `daily-challenge.spec.js` — daily challenge card visible on homepage; clicking it starts quiz
- **`package.json`:** Add `"test:e2e": "playwright test tests/e2e/"` script
- **Note:** Tests run against `http://localhost:5000` via `firebase serve`; CI integration deferred (Phase 11)
- **Acceptance criteria:** All 3 E2E test suites pass against local `firebase serve` instance; `npm run test:e2e` command works

#### 10.8 Quick Wins & Carry-Forwards (Low Effort, High Polish)
> *Items surfaced in Phase 9 known issues + competitive re-audit. Each is < 1 hour of work. Slip to Phase 11 if Phase 10 scope is too large.*

**10.8a — Q&A Moderation (Presenter Delete)**
- Presenter Q&A overlay in `live-presenter.html`: add 🗑️ delete button on each question row
- `renderQAList()`: inject `<button class="ext-qa-delete-btn">🗑️</button>` per row
- On click: `db.ref('sessions/' + code + '/qa/' + key).remove()`
- RTDB rule already permits presenter delete (`data.parent().parent().child('presenterId').val() === auth.uid`) — no rule change needed
- Acceptance: Presenter can delete any audience question from the overlay in real time

**10.8b — Per-Topic Difficulty Preference**
- Currently `localStorage('iqp_difficulty')` is one global setting shared across all topics
- Change key to `localStorage('iqp_difficulty_' + topicId)` in `quiz-engine.js`
- Difficulty picker modal reads and writes per-topic key; fallback to `'all'` if key absent
- **Migration note:** Old global key `iqp_difficulty` can coexist; new key takes precedence
- Acceptance: Choosing "Hard" for Science doesn't change difficulty on Geography

**10.8c — Daily Challenge Thumbnail Image**
- Daily challenge card in `ui-manager.js` `_buildDailyChallengeHTML()` currently shows Font Awesome icon only
- Use the topic's `image` field (same WebP path used on quiz cards) as a `<img>` thumbnail inside the card
- `QuizProsTopics.getAllTopics()` already provides `{ id, title, image, ... }` — use `image` field
- CSS: `.daily-challenge-thumb` — 48×48px, `border-radius: 8px`, `object-fit: cover`, placed left of topic name
- Acceptance: Card shows topic image (or `assets/images/default-personality.webp` as fallback)

**10.8d — Stripe End-to-End Verification**
- Manual test (no code change): Use Stripe test card `4242 4242 4242 4242`, expiry `12/34`, CVC `123`
- Verify: Stripe Checkout → `stripeWebhook` Cloud Function fires → `users/{uid}.subscription` written to Firestore → `getUserTier()` returns `'premium'` → Premium features unlocked
- Also verify: `createPortalSession` opens Stripe Customer Portal correctly
- Document result in this file; if webhook fails, fix `functions/index.js` `stripeWebhook` handler
- Acceptance: Full payment → webhook → Firestore → portal flow confirmed working

---

---

### Phase 12: Psychiatry & Medical Quiz Expansion (Phase 12 — 2026+)
> **Goal:** Add a professional-grade Medical & Nursing Psychiatry quiz category — DSM-5 aligned for doctors, NCLEX-style for nurses — with 250+ questions, "Psych Profile" score results, AI generation presets, and iQuizPros-style fun share prompts. This makes iQuizPros uniquely valuable to healthcare professionals and students.

#### 12.1 — Medical Psychiatry Question Bank (Doctor-Focused, DSM-5 Aligned)
Add 25 questions per sub-category to `js/modules/question-bank.js` under a new `medicalPsychiatry` key.

**Sub-categories (5 × 25 = 125 questions):**
- `psych-schizophrenia` — Psychotic disorders: delusions, hallucinations, first-rank symptoms, antipsychotics, negative symptoms
- `psych-mood` — Depressive & Bipolar: DSM-5 criteria, differential diagnosis, mood stabilisers, ECT, suicide risk assessment
- `psych-anxiety` — Anxiety/OCD/Trauma: GAD, PTSD, exposure therapy, SSRIs, medical differentials
- `psych-neurocognitive` — Neurocognitive & Substance: dementia subtypes, addiction, withdrawal syndromes, detox pharmacology
- `psych-personality` — Personality & Neurodevelopmental: BPD, NPD, ADHD/autism, DBT/CBT indications

**iQuizPros question format** (note: `answer` is a 0-based integer index, NOT a letter):
```javascript
{
  question: 'A 28-year-old male hears voices commanding self-harm. What is the best initial treatment?',
  options: ['Lithium', 'Haloperidol', 'Fluoxetine', 'Lorazepam'],
  answer: 1,                    // index of correct option (0-based)
  difficulty: 'medium',         // 'easy' | 'medium' | 'hard'
  explanation: 'Command hallucinations indicate acute psychosis. Haloperidol, a high-potency typical antipsychotic, provides rapid control of psychotic symptoms.',
  tags: ['psychosis', 'schizophrenia', 'antipsychotics'],
  category: 'medical-psychiatry'
}
```

#### 12.2 — Nursing Psychiatry Question Bank (NCLEX-Style, Care-Focused)
Add 25 questions per sub-category to `question-bank.js` under `nursingPsychiatry`.

**Sub-categories (5 × 25 = 125 questions):**
- `psych-nursing-communication` — Therapeutic communication, de-escalation, suicide assessment, Milieu therapy, least-restrictive environment
- `psych-nursing-mood` — Mania nursing interventions, panic attack management, lithium monitoring (levels, toxicity signs)
- `psych-nursing-psychosis` — Antipsychotic side effects (EPS, tardive dyskinesia), clozapine monitoring (WBC), ECT nursing care
- `psych-nursing-personality` — Boundary-setting with PD patients, detox protocols, motivational interviewing
- `psych-nursing-special` — Eating disorders, child/adolescent psych, legal/ethical issues (restraint, confidentiality, involuntary admission)

**Sample nursing question:**
```javascript
{
  question: 'A patient on haloperidol develops sudden neck rigidity and torticollis. What is the priority nursing action?',
  options: ['Increase the haloperidol dose', 'Administer benztropine IM', 'Switch to an SSRI', 'Reassure the patient this is normal'],
  answer: 1,
  difficulty: 'hard',
  explanation: 'Acute dystonia (an extrapyramidal side effect) from antipsychotics is reversed rapidly with an anticholinergic such as benztropine (Cogentin) given IM.',
  tags: ['EPS', 'antipsychotics', 'nursing', 'NCLEX'],
  category: 'nursing-psychiatry'
}
```

#### 12.3 — Topic Registration & Category Tab
- Register all 10 sub-categories in `js/modules/topics.js` with `id`, `name`, `category: 'healthcare'`, `image`, `questionCount`
- Add a **"🏥 Healthcare"** category tab to the topic grid (alongside Science, History, etc.)
- Create placeholder WebP images (800×800px) for each sub-category in `assets/images/psychiatry/`; fallback to `default-personality.webp`
- Category tab filter already works via `data-category` attributes — no engine changes needed

#### 12.4 — "Psych Score Profile" Result Messages
Add psychiatry-aware score messages to `js/modules/quiz-scoring.js` `getScoreMessage()`:
- 90–100%: "🧠 Brilliant Diagnostician — You think like a seasoned psychiatrist!"
- 70–89%: "💡 Sharp Clinician — Strong foundations, keep building your expertise!"
- 50–69%: "📚 Developing Practitioner — You're on the right path!"
- 30–49%: "🌱 Keen Learner — Great start for a challenging field!"
- 0–29%: "🎓 Beginning the Journey — Psychiatry is complex — keep studying!"

Add **fun share prompts** appended to the WhatsApp share text for psychiatry topics:
- "I scored {score}% on the Psychiatry quiz! 🧠 Think you can beat me? Try at iquizpro.com"

#### 12.5 — AI Generation Presets for Psychiatry
Extend the AI quiz generation UI (on `index.html` home page) with a **"Subject Presets"** dropdown:
- "🧠 Medical Psychiatry — DSM-5 MCQs"
- "💊 Nursing Psychiatry — NCLEX Style"
- "🦠 General Medicine"
- "📖 Anatomy & Physiology"

When selected, pre-fills the topic input and injects a specialized system prompt prefix into `generateQuiz` call via a `promptPrefix` data field handled in `functions/index.js`. The prefix instructs Gemini to produce DSM-5-aligned or NCLEX-style questions with rationales.

#### 12.6 — Premium Gating Strategy
- **Free tier:** `psych-schizophrenia` and `psych-nursing-communication` (2 taster topics)
- **Premium tier:** All remaining 8 psychiatry sub-categories gated via `config.premium.gatedQuizIds`
- Shows upgrade modal with copy: "Unlock 8 specialist psychiatry categories — ideal for NCLEX prep and ABPN board revision"

#### 12.7 — Quality & Accuracy Standards
- All questions cross-referenced against DSM-5 (medical) and NCLEX-PN/RN blueprints (nursing)
- No made-up drug doses or diagnostic criteria — every explanation cites the standard
- Difficulty distribution target: 40% easy / 40% medium / 20% hard per sub-category
- Questions reviewed in batches of 20; flagged for cultural sensitivity
- `tags` array on every question enables future tag-based filtering UI

---

Phase 13 is being developed now please understand the handoff document of phase 12 and the prompt for phase 13 provided.

## 📋 Priority Matrix (v5.0)

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Auth consolidation | High | Medium | ✅ Done |
| Firebase CLI setup | High | Low | ✅ Done |
| Build pipeline | High | Medium | ✅ Done |
| Premium payment flow | High | High | ✅ Done |
| New quiz content | High | Medium | ✅ Done |
| Live presenter enhancements | Medium | High | ✅ Done (Phases 4–6) |
| UI/UX modernization | Medium | High | ✅ Done (Phase 6) |
| Accessibility (partial) | Medium | Medium | ✅ Done (Phase 6) |
| Testing (unit) | Medium | Medium | ✅ Done (Phase 7) |
| PWA/offline support | Low | High | ✅ Done (Phase 8) |
| Answer explanation mode | High | Low | ✅ Done (Phase 9.1) |
| Difficulty levels | High | Medium | ✅ Done (Phase 9.1) |
| Question randomization | High | Low | ✅ Done (Phase 9.1) |
| Missing quiz images | Medium | Low | ✅ Done (Phase 9.1) |
| Ranking question type | High | Medium | ✅ Done (Phase 9.2) |
| Q&A mode (live) | High | Medium | ✅ Done (Phase 9.2) |
| Emoji reactions (live) | Medium | Low | ✅ Done (Phase 9.2) |
| CSV export (live) | Medium | Low | ✅ Done (Phase 9.2) |
| Daily challenge | High | Medium | ✅ Done (Phase 9.3) |
| Q&A upvoting (live) | High | Low | 🟠 P2 — Phase 10.1 |
| Global daily leaderboard | High | Medium | 🟠 P2 — Phase 10.2 |
| Session history/archive | Medium | Medium | 🟠 P2 — Phase 10.3 |
| PDF result export | Medium | Medium | 🟠 P2 — Phase 10.4 |
| Admin analytics dashboard | Medium | High | 🟠 P2 — Phase 10.5 |
| Quiz embed (iframe) | Medium | Medium | 🟠 P2 — Phase 10.6 |
| E2E tests (Playwright) | Medium | Medium | 🟠 P2 — Phase 10.7 |
| Q&A moderation (delete) | Medium | Low | 🟠 P2 — Phase 10.8a |
| Per-topic difficulty pref | Medium | Low | 🟠 P2 — Phase 10.8b |
| Daily challenge thumbnail | Low | Low | 🟠 P2 — Phase 10.8c |
| Stripe E2E verification | High | Low | 🟠 P2 — Phase 10.8d |
| Document-to-quiz AI | High | High | 🟡 P3 — Phase 11 |
| Comparative stats | Medium | Medium | 🟡 P3 — Phase 11 |
| Full WCAG AA audit | Medium | Medium | 🟡 P3 — Phase 11 |
| Slide deck import | Low | High | 🟡 P3 — Phase 11 |
| Receipt/invoice email | Medium | Medium | 🟡 P3 — Phase 11 |
| Free trial period | Medium | Medium | 🟡 P3 — Phase 11 |
| A/B testing framework | Low | Medium | 🟢 P4 |
| Sentry integration | Low | Low | 🟢 P4 |
| Ubuntu migration | Low | Medium | 🟢 P4 |
| Push notifications | Low | Medium | 🟢 P4 |
| Medical psychiatry question bank (125 Qs) | High | Medium | 🔵 P2 — Phase 12.1 |
| Nursing psychiatry question bank (125 Qs) | High | Medium | 🔵 P2 — Phase 12.2 |
| Healthcare category tab + topic registration | Medium | Low | 🔵 P2 — Phase 12.3 |
| Psych score profile result messages | Medium | Low | 🔵 P2 — Phase 12.4 |
| AI generation presets (DSM-5 / NCLEX) | High | Medium | 🔵 P2 — Phase 12.5 |
| Psychiatry premium gating | Medium | Low | 🔵 P2 — Phase 12.6 |

---

## 🏁 Success Metrics (v5.0)

| Metric | Baseline (v1) | Phase 9 | Target (v5.0) |
|--------|---------------|---------|---------------|
| Lighthouse Performance | ~60 | ~75 | > 90 |
| Page Load Time | ~4s | ~2.5s | < 2s |
| Script Tags | 30+ | 3 bundled ✅ | 3 bundled ✅ |
| Auth Fix Scripts | 6+ | 1 unified ✅ | 1 unified ✅ |
| Knowledge Quiz Topics | ~8 | 12 | 20+ |
| Personality Quizzes | 14 | 16 | 25+ |
| Live Question Types | 1 (MC) | 7 (MC, WC, OE, Rating, T/F, Ranking, Q&A) ✅ | 7 ✅ |
| Automated Tests | 0 | 66 unit | 66+ unit + E2E |
| WCAG Compliance | None | Partial | AA |
| Premium Conversion | N/A | ~1% | > 2% |
| Questions per Topic | ~10–15 | 25 (randomised) ✅ | 25 ✅ |
| Daily Active Features | — | Daily Challenge ✅ | Daily Challenge + Leaderboard |
| Explanation Coverage | 0% | 100% knowledge Qs ✅ | 100% ✅ |
| Competitive Parity (avg) | ~40% | ~77% | ~85%+ |
| Global Leaderboard | No | No | Yes (Phase 10) |
| Session Archive | No | No | Yes (Phase 10) |
| PDF Export | No | No | Yes (Phase 10) |

---

## 🔄 Development Workflow

```
1. Make changes locally
2. Test with: firebase serve --only hosting
3. Preview deploy: firebase hosting:channel:deploy preview
4. Verify at preview URL
5. Production deploy: firebase deploy --only hosting
6. Verify at iquizpro.com
7. Update CHANGELOG.md
```

---

## 📝 Notes

- Always work from `E:\Programs\iquizpros-live-backup` — this is the live source of truth
- The old `iquizpros-styled-final` directory is outdated — do NOT deploy from it
- Firebase project ID is `quizpros` (not `iquizpros`)
- The live site was last deployed Oct 26, 2025 — any changes since then are local only
- Webpack bundles (live-presenter, live-audience) are minified — source for these is in the old project's `src/` directory
