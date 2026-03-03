# Phase 2 Handoff — Build Pipeline & Performance

**Date completed:** 2026-02-25
**Phase:** 2 of 8
**Focus:** webpack build system, SEO meta tags, sitemap/robots.txt

---

## What Was Done

### Task 2.1 — SEO & Meta Tags

#### index.html updates
- Changed `<title>` from `🔥 Quizpros - Multi-Topic Quiz Challenge!` to `iQuizPros - Free Online Quizzes & Personality Tests`
- Added `<meta name="description">` with descriptive copy
- Added `<meta name="robots" content="index, follow">`
- Added full Open Graph tags: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`
- Added Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Added JSON-LD structured data (`WebSite` type with `SearchAction`)

#### New SEO files
- **`sitemap.xml`** — Lists main pages + all quiz topic URLs
- **`robots.txt`** — Allows all bots, points to sitemap

#### CSS url() fix
- `styles.css:1423` — Changed `url('assets/images/zodiac/stars-bg.jpeg')` to `url('/assets/images/zodiac/stars-bg.jpeg')` (absolute path required for webpack CSS bundling — see rationale below)

---

### Task 2.2 — Build System (webpack)

#### New devDependencies (package.json)
```
webpack, webpack-cli, webpack-dev-server
css-loader, mini-css-extract-plugin, css-minimizer-webpack-plugin
terser-webpack-plugin, html-webpack-plugin, copy-webpack-plugin
```

#### npm scripts
```
npm start        → webpack-dev-server on port 5000 (hot file watching)
npm run build    → production bundle in dist/
npm run build:dev → development bundle in dist/ (with source maps)
npm run deploy   → npm run build && firebase deploy --only hosting
npm run serve    → firebase serve (direct, no build — for quick local testing)
```

#### webpack.config.js (new file)
- Single entry point: `src/app-entry.js`
- Output: `dist/js/app.[contenthash:8].js` (prod) or `dist/js/app.js` (dev)
- CSS extraction: `dist/css/app.[contenthash:8].css` via MiniCssExtractPlugin
- HTML generation: `dist/index.html` from `src/index.template.html` via HtmlWebpackPlugin
- Static assets: `assets/`, `templates/`, `fonts/`, `favicon.ico`, other HTML pages, pre-built live bundles — all copied to `dist/` via CopyPlugin
- TerserPlugin + CssMinimizerPlugin for production minification
- Source maps in dev, none in prod
- `css-loader` with `url: false` to avoid processing CSS `url()` refs (CopyPlugin handles asset copying)
- `performance.maxAssetSize: 1MB` (expected since we're bundling 25+ scripts)

#### src/app-entry.js (new file)
Single webpack entry that `import`s all app JS + CSS in the exact same dependency order as the original index.html `<script>` tags:
1. CSS imports (9 files → single bundle)
2. JS imports (25 modules in dependency order)

#### src/index.template.html (new file)
Clean, readable HTML template replacing the minified root `index.html` as the build source:
- All SEO improvements included
- CDN scripts kept (Firebase SDK, confetti, Google Fonts, Font Awesome)
- All inline scripts kept (FA fallback, emergency CSS, footer init, icon fix)
- 25 app `<script>` tags REMOVED (webpack injects `app.[hash].js` before `</body>`)
- 9 app `<link>` CSS tags REMOVED (webpack injects `app.[hash].css` into `<head>`)
- Live presenter/audience deferred scripts kept (in `<head>`, copied to dist/ as-is)
- Stripe script kept at bottom of body

#### firebase.json update
- `"public": "."` → `"public": "dist"` — now serves from the build output
- Added `"rewrites": [{"source": "**", "destination": "/index.html"}]` — SPA routing
- Enhanced cache headers: JS/CSS files get `immutable` cache, images get 30-day cache

---

## Architecture After Phase 2

### Build Flow
```
src/app-entry.js (imports all JS + CSS)
    ↓ webpack
dist/
  js/app.[hash].js      ← 25+ scripts bundled & minified
  css/app.[hash].css    ← 9 CSS files bundled & minified
  index.html            ← generated from src/index.template.html
  assets/               ← copied by CopyPlugin
  templates/            ← copied by CopyPlugin
  fonts/                ← copied by CopyPlugin
  js/live-*.js          ← pre-built bundles copied as-is
  *.html                ← other pages copied as-is
  sitemap.xml, robots.txt
```

### Deployment Flow (Phase 2+)
```
1. npm run build        → generates dist/
2. firebase deploy      → deploys dist/ to Firebase Hosting
   (or: npm run deploy  → runs both)
```

### Fallback: Direct Serve (for emergencies)
```
1. Edit firebase.json: "public": "."
2. firebase serve --only hosting
```
The root source files are still intact, so the old approach still works as a fallback.

---

## Important Notes

### Why `url: false` in css-loader
CSS files reference assets like `url('/assets/images/...')` and `url('../fonts/...')`. Without `url: false`, css-loader would try to resolve these as webpack modules and fail (or inline them). With `url: false`, the paths are left as-is in the output CSS, and CopyPlugin ensures the referenced files exist in `dist/`. The `styles.css` url() was changed to use an absolute path (`/assets/...`) for this to work correctly when CSS is at `dist/css/app.css`.

### IIFE Pattern + webpack
All modules use `window.QuizProsXxx = (function() { ... })()`. webpack wraps each module in a function scope, but the `window.X = ...` assignments still set global variables. Cross-module communication via `window.QuizProsXxx` continues to work. No changes to any module files were needed.

### Live Presenter/Audience Bundles
These are pre-built webpack bundles with content-hash filenames. They're NOT rebundled by this webpack config — they're copied directly to `dist/js/` by CopyPlugin. The filenames are hardcoded in both `webpack.config.js` (CopyPlugin patterns) and `src/index.template.html` (`<script defer>` tags).

### Auth Scripts (Old)
The old auth scripts (`js/auth-button-fix.js`, etc.) are still on disk but not loaded (removed in Phase 1). They are NOT included in the webpack bundle (not imported in `src/app-entry.js`). **Can be safely deleted once Phase 2 build is verified in production.**

---

## Files Changed / Created

| File | Change |
|------|--------|
| `index.html` | Added SEO meta tags, OG tags, JSON-LD, updated title |
| `styles.css` | Fixed `url()` path to use absolute `/assets/...` |
| `package.json` | Added webpack devDeps + build scripts |
| `firebase.json` | Changed public dir to `dist/`, added rewrites, better cache headers |
| `.gitignore` | Already had `dist/` — no change needed |
| **`webpack.config.js`** | NEW — full build configuration |
| **`src/app-entry.js`** | NEW — webpack entry (JS + CSS) |
| **`src/index.template.html`** | NEW — HTML template for webpack |
| **`sitemap.xml`** | NEW — SEO sitemap |
| **`robots.txt`** | NEW — SEO robots file |

---

## What Needs to Happen Before Going Live

1. **Run `npm install`** in project root to install webpack and plugins
2. **Run `npm run build`** to generate `dist/`
3. **Test locally**: `npm run serve` (or temporarily change `public` to `dist` in firebase.json and run firebase serve)
4. **Deploy to preview channel**: `firebase hosting:channel:deploy phase2-test`
5. **Verify at preview URL**:
   - All quiz topics load
   - Auth (sign in / sign up / Google) works
   - Personality quiz results display
   - Knowledge quiz scoring works
   - Social sharing links generate correctly
   - Mobile menu works
   - Live presenter page loads
6. **Confirm old auth scripts are not needed** → delete them (see list below)
7. **Production deploy**: `npm run deploy`

### Old auth scripts to delete after verification
```
js/firebase-auth-fix.js
js/auth-service-fix-v2.js
js/auth-service-fix.js
js/auth-fix.js
js/auth-persistence-fix.js
js/auth-button-fix.js
js/direct-auth-fix.js
js/modules/auth-service.js     (old, superseded by auth-manager.js)
js/modules/auth-ui.js          (old, superseded by auth-manager.js)
js/modules/auth-helper.js      (old, superseded by auth-manager.js)
js/components/auth-header-integration.js  (old, superseded by auth-manager.js)
```

---

## Files That Need Attention in Phase 3+

- `quiz-engine.js` — still ~1,300 lines; `startQuiz` and `selectAnswer` could be decomposed
- `premium.js` — Stripe integration scaffolded but incomplete (Phase 3 goal)
- Image optimization — personality images still `.jpeg`; could be converted to `.webp`
- Lazy loading — quiz templates fetched at startup; could be on-demand
- No automated tests (Phase 7 goal)
