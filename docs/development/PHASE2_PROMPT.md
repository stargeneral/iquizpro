# Phase 2 Session Prompt — Build Pipeline & Performance

**Use this prompt to start the Phase 2 session.**

---

## Context

You are continuing development on iQuizPros, a static frontend quiz platform hosted on Firebase Hosting. Phase 1 is complete. Read `docs/development/PHASE1_HANDOFF.md` for the full summary of what changed.

**Quick recap of Phase 1 changes:**
- 10 auth scripts → 1 unified `js/modules/auth-manager.js`
- `topics.js` (1,069 lines) → thin facade + `question-bank.js` for static data
- `quiz-engine.js` → delegates HTML generation to `quiz-renderer.js`, scoring to `quiz-scoring.js`, timer to `quiz-timer.js`
- `header.js` → mobile menu extracted to `mobile-menu.js`
- Bug fixed: `zodiac-banner.jpg` → `zodiac-banner.webp`

---

## Phase 2 Goals

From `docs/development/DEVELOPMENT_PLAN.md` Phase 2 (Weeks 3–4):

### 2.1 Build System
- Configure webpack to bundle ALL main app modules (currently 30+ `<script>` tags)
- Set up `npm start` (dev server with hot reload) and `npm run build` (production bundle)
- CSS bundling and minification
- Source maps for development debugging
- Build script that copies static assets (images, sounds, templates) to dist/

### 2.2 Performance Optimization
- **Bundle reduction:** 30+ script tags → 2–3 bundled files
- **Lazy loading:** Load quiz templates on-demand (they're currently fetched at startup via app.js `loadPersonalityTemplates()`)
- **Image optimization:** Convert remaining JPEGs to WebP where not already done; add responsive `srcset`
- **Code splitting:** Separate bundles for core app, auth, premium, live presenter, live audience
- **Caching strategy:** Content-hash filenames for all bundles
- Target: Lighthouse Performance score > 90

### 2.3 SEO & Meta Tags
- Unique `<title>` and `<meta description>` per quiz
- Open Graph tags for rich social sharing previews
- Structured data (JSON-LD) for quiz content
- `sitemap.xml`, `robots.txt`
- Dynamic page titles based on active quiz

---

## Important Constraints

1. **The site MUST remain functional throughout** — no breaking changes to the live site. Deploy to a preview channel first; promote to live only after verification.
2. **Keep IIFE/global pattern working** — webpack needs to expose `window.QuizProsXxx` globals for inline `onclick` attributes in quiz-renderer.js (`QuizProsEngine.selectAnswer(...)`) and any other inline event handlers.
3. **Firebase Hosting** — deploy with `firebase deploy --only hosting`. No server-side rendering.
4. **Auth module** — The old auth scripts (`firebase-auth-fix.js`, etc.) are still on disk but NOT loaded. Confirm in Phase 2 that auth-manager.js is working in production before deleting them.
5. **Script order in index.html** — See PHASE1_HANDOFF.md for the current correct order. When moving to webpack, ensure the same dependency resolution.

---

## Files to Read First

Before writing any code, read:
1. `CLAUDE.md` — architecture, module map, conventions
2. `docs/development/PHASE1_HANDOFF.md` — what changed in Phase 1
3. `package.json` — current dependencies and scripts
4. `index.html` — current 30+ `<script>` tags to understand bundling scope
5. `js/config.js` — Firebase config and feature flags

---

## Suggested First Steps

1. Audit current Lighthouse score (baseline measurement)
2. Plan webpack entry points: which modules go in which bundle
3. Decide whether to migrate from IIFE pattern to ES modules, or keep IIFEs but bundle them with webpack (easier, less risky)
4. Set up webpack dev config first, verify site works through webpack before touching production
5. Create Firebase preview channel for testing: `firebase hosting:channel:deploy phase2-test`

---

## Open Questions for Phase 2

- **IIFE vs ES modules:** Migrating to `import`/`export` would be cleaner but requires touching every file. Keeping IIFEs and just bundling them through webpack is lower risk. Which approach?
- **Template lazy loading:** Quiz templates (JSON files) are currently all fetched at startup. Should they be fetched on-demand when a user selects that quiz?
- **Image optimization:** Many zodiac images are already `.webp`. Remaining `.jpeg` files (personality images) could be converted. Worth automating?
