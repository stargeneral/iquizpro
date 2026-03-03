# iQuizPros — Phase 9 Prompt

> **Note:** Phase 8 was intentionally stopped at 8.2 (PWA + Security Rules). Phase 8.3 (Performance & Bundle Optimisation) was deferred by user agreement. If continuing development, decide whether to pick up 8.3 first or move on to new work.

---

## Project Context

**iQuizPros** is live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

Codebase: `E:\Programs\iquizpros-live-backup`

---

## ⚠️ Required Reading (Do This First)

Read in order before making any changes:

1. `docs/development/DEVELOPMENT_PLAN.md` — Authoritative roadmap
2. `CLAUDE.md` — Architecture, pitfalls, conventions
3. `docs/development/PHASE8_HANDOFF.md` — What changed in Phase 8 (PWA, security rules)
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns

Also check persistent memory:
`C:\Users\user\.claude\projects\E--Programs-iquizpros-live-backup\memory\MEMORY.md`

---

## Current State After Phase 8

### Bundle
- JS: `app.59cbbb09.js` / CSS: `app.6f4cc9ba.css` — deployed 2026-03-01
- 66 Jest unit tests passing (3 suites)

### What Phase 8 Delivered
- **PWA**: `manifest.json`, `sw.js` (service worker), app icons, install prompt, background sync
- **Security**: Firestore rules hardened (presenter-ID checks, response immutability, local_quizzes ownership); `storage.rules` created (deny-all, awaiting Storage initialisation)

### Outstanding Actions
1. **Firebase Storage** — visit Firebase Console → Storage → "Get Started", then `firebase deploy --only storage`
2. **Stripe end-to-end test** — card `4242 4242 4242 4242` through checkout → webhook → Firestore
3. **Replace placeholder PWA icons** — `assets/icons/icon-192.png` / `icon-512.png` with real iQuizPros logo

---

## Deferred from Phase 8 (Optional Carry-forwards)

### 8.3 — Performance & Bundle Optimisation (deferred)

#### 8.3.1 — Firebase SDK CDN Loading
The `vendors.de788a87b9bb3625350b.js` bundle is 584 KB (pre-existing Firebase SDK). Options:
1. **CDN loading** (preferred) — Remove Firebase from webpack bundle; load via `<script>` tags from the official Firebase CDN in `src/index.template.html`. Add `externals` to `webpack.config.js` to mark `firebase` as external. Firebase v9.20.0 compat CDN URLs are stable.
2. **Accept as-is** — Firebase SDK size is a known constraint with compat mode; gzip compression on the CDN reduces effective size significantly.

#### 8.3.2 — Image Optimisation
Several zodiac JPEGs in `assets/images/zodiac/jpeg assets/` exceed 700 KB each. Options:
- Serve via CDN (Cloudflare free tier) rather than Firebase Hosting
- Compress with a tool like `cwebp` or `squoosh`
- Add a note to `CLAUDE.md` to serve large assets via CDN (note already added)

#### 8.3.3 — Lazy-Load Template JSON
Quiz templates are already loaded on-demand via `fetch()` at quiz start (not preloaded). No change needed — confirm by checking that `initializeQuizTemplates()` in `app.js` uses `fetch` lazily.

---

## Suggested Phase 9 Objectives

If Phase 8.3 is skipped, Phase 9 could focus on:

### Option A — Content Expansion
- **Missing personality quiz images**: Music Taste, Stress Response, Work-Life Balance still fall back to `default-personality.webp`. Check `templates/personality-quizzes/*/` for `imagePath` values and generate matching placeholder images using `scripts/create_placeholder_images.py`.
- **New knowledge quiz topics**: Add 2–3 new topics to `js/modules/question-bank.js` (per DEVELOPMENT_PLAN.md Phase 5.1: Technology, Sports, Music, Food, Movies)
- **New personality quiz types**: Consider adding Color Personality or Daily Horoscope to templates

### Option B — Ubuntu Server Migration (DEVELOPMENT_PLAN.md Phase 8.3)
If moving from Firebase Hosting to Ubuntu server (96.9.215.5):
- Set up Nginx as reverse proxy with SSL (Let's Encrypt)
- Configure CI/CD pipeline (GitHub Actions → SSH deploy)
- Update DNS for iquizpro.com
- Keep Firebase services (Auth, Firestore, RTDB, Functions) — only Hosting moves
- Set up server monitoring (PM2 or systemd)
- Configure Cloudflare CDN (free tier) for static assets

### Option C — E2E Testing & Quality
- Playwright or Cypress E2E tests for critical paths (per DEVELOPMENT_PLAN.md Phase 7.3)
- Visual regression tests for key pages
- Performance budget tests (Lighthouse CI in GitHub Actions)

---

## Quick-Reference: Deployment Commands

```bash
# Build
"/c/Program Files/nodejs/npm.cmd" run build

# Deploy hosting + Firestore rules
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting,firestore:rules

# Deploy Storage rules (once Storage initialised)
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only storage

# Deploy all rules + hosting
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" deploy --only hosting,firestore:rules,database

# Run tests
"/c/Program Files/nodejs/npm.cmd" test

# Firebase login (if auth expired)
"/c/Program Files/nodejs/node.exe" "/c/Users/user/AppData/Roaming/npm/node_modules/firebase-tools/lib/bin/firebase.js" login --reauth
```
