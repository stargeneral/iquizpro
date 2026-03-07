# Landing Page Design Brief — iQuizPros

## The Problem

Currently, visiting `iquizpro.com` drops users straight into the quiz topic grid with no
introduction, context, or conversion hook. There is no way for a first-time visitor to
understand what iQuizPros is, why they should stay, or what makes it worth signing up for.
A well-designed landing page is typically the single highest-ROI page on any consumer app.

---

## Recommended Architecture

### Option A — Separate `landing.html` (RECOMMENDED)
Create a standalone `landing.html` marketing page. This becomes the home page at `/`.
The quiz SPA moves to `/app`. Firebase rewrites handle routing transparently.

**Pros:** Clean separation, easy A/B testing, landing page can evolve independently,
real marketing page with no JS framework overhead, fast load.

**Cons:** Internal links (header, footer, premium.html) need updating from `/` → `/app`.
Deeplinks like `/?quiz=personality` must change to `/app?quiz=personality`.

### Option B — Hero section inside the existing SPA
Inject a full-screen landing/hero section at the top of the existing `index.html`,
shown only to first-time visitors (no localStorage token), above the quiz grid.

**Pros:** Zero URL changes, zero deeplink changes, no routing changes.
**Cons:** Slower (full app JS still loads before hero shows), can't easily A/B test,
quiz app weight bloats the "landing page" experience.

### Decision
**Option A is recommended.** The landing page should be fast, image-rich and conversion-
focused — loading the full Firebase SDK and quiz engine to show a hero section is wasteful.
A standalone HTML file with inline CSS and minimal JS loads in <1s.

---

## Page URL Structure (after landing page is added)

| URL | Serves | Notes |
|-----|--------|-------|
| `iquizpro.com/` | `dist/landing.html` | New marketing home |
| `iquizpro.com/app` | `dist/index.html` | Quiz SPA (existing) |
| `iquizpro.com/app?quiz=xxx` | `dist/index.html` | Deeplinks (existing, path updated) |
| `iquizpro.com/premium.html` | `dist/premium.html` | Pricing (unchanged) |
| `iquizpro.com/dashboard.html` | `dist/dashboard.html` | Dashboard (unchanged) |

`firebase.json` rewrite changes needed (add before the existing `**` catch-all):
```json
{ "source": "/app/**", "destination": "/index.html" },
{ "source": "/app",    "destination": "/index.html" }
```
And change the root catch-all from `"destination": "/index.html"` to `"/landing.html"`.

---

## Landing Page Sections & Image Map

### 1. HERO — Full-width, above the fold
**Goal:** Immediate emotional hook. Visitor knows what the site is within 3 seconds.

| Element | Content |
|---------|---------|
| Background | Full-bleed image: `assets/images/quizpros personality image.webp` (800×800, tiled or positioned right half, gradient overlay left) |
| Headline | **"Discover Who You Really Are"** |
| Subheadline | Free personality quizzes, knowledge challenges & healthcare tests. Results that actually make you think. |
| Primary CTA | `[Take a Free Quiz →]` → `/app` |
| Secondary CTA | `[See Quiz Categories ↓]` → scrolls to categories section |
| Trust line | "Trusted by thousands of curious minds" |

### 2. SOCIAL PROOF STRIP — Slim bar below hero
**Goal:** Instant credibility. No images needed — text/numbers only.

| Element | Content |
|---------|---------|
| Stats | 🧠 50+ Quizzes   |   📊 250+ Healthcare Questions   |   ❤️ Free to Play |
| Style | Brand-green background, white text, 3-column strip |

### 3. CATEGORY PREVIEW CARDS — Main content section
**Goal:** Show the 3 main quiz categories with visual teasers.

| Card | Image | Headline | CTA |
|------|-------|----------|-----|
| Personality Quizzes | `assets/images/quizpros personality image.webp` | Find your personality type | `Explore →` |
| Knowledge & Trivia | `assets/images/analytical-strategist.webp` | Test what you know | `Explore →` |
| Healthcare / Clinical | `assets/images/psychiatry/psych-mood.webp` | Medical & nursing quizzes | `Explore →` |

Each card links to `/app` (or `/app#personality-section`, `/app#knowledge-section`, `/app#healthcare-section` using the anchor IDs already in the app).

### 4. FEATURED QUIZ SPOTLIGHTS — 3–4 specific quiz tiles
**Goal:** Pull visitors towards specific quizzes. These are your highest-engagement topics.

| Quiz | Image | Teaser |
|------|-------|--------|
| Love Language | `assets/images/love-language.webp` | Which of the 5 love languages is yours? |
| Travel Personality | `assets/images/travel-personality.webp` | Are you an Adventurer or a Culture Seeker? |
| Music Taste | `assets/images/rocker-personality.webp` | Does your music taste define you? |
| Stress Response | `assets/images/fighter-stress.webp` | Fighter, Planner, or Withdrawer? |

### 5. HOW IT WORKS — 3-step visual strip
**Goal:** Remove friction. First-time visitors worry "this will be complicated."

| Step | Icon | Text |
|------|------|------|
| 1 | 🎯 | **Pick a quiz** — 50+ to choose from |
| 2 | 🧠 | **Answer honestly** — No wrong answers, just insights |
| 3 | 📊 | **Get your result** — Personalised, shareable, free |

No images needed — icon + text layout.

### 6. PERSONALITY RESULT MOSAIC — Visual grid (optional but powerful)
**Goal:** Show the variety of results, make the app look rich and polished.

A 6-tile grid of personality result images that rotates or fades:
- `adventurer-personality.webp`
- `thinker-personality.webp`
- `rocker-personality.webp`
- `culturalist-personality.webp`
- `leader-personality.webp`
- `soulful-personality.webp`

Caption: *"Over 40 unique personality profiles — which one are you?"*

### 7. PREMIUM UPSELL STRIP
**Goal:** Monetisation entry point. Soft sell for visitors who are engaged.

| Element | Content |
|---------|---------|
| Background | Green gradient (`#25d366 → #128c7e`) |
| Headline | **Unlock the Full Experience** |
| Body | Access healthcare quizzes, AI-generated tests, detailed score reports and more. |
| CTA | `[See Premium Plans →]` → `/premium.html` |

### 8. FOOTER NAV
Standard footer (same as the rest of the site, or simplified version).
Links: Home · Quizzes · Premium · Dashboard · Contact · Privacy · Terms

---

## Images NOT yet in the library that would strengthen the landing page

| Section | Suggested image to commission | Prompt hint |
|---------|-------------------------------|-------------|
| Hero background | A wide (16:9 or 1200×630) hero banner — group of diverse cheerful people each holding a personality result card | "Diverse group of happy young adults each holding colourful personality quiz result cards, bright warm light, modern lifestyle photography style, brand-green accents, no text, 16:9" |
| OG / social share | 1200×630 banner for Facebook/WhatsApp/Twitter previews | "iQuizPros brand banner — bold green gradient background, centred quiz-brain icon, tagline space, clean modern design, 16:9" |
| How-it-works illustration | 3-panel horizontal strip (pick / answer / result) | Can use Font Awesome icons instead |

---

## Implementation Plan (for Claude to execute)

### Files to create/modify

| File | Action |
|------|--------|
| `landing.html` | Create new standalone marketing page |
| `firebase.json` | Add `/app` rewrite, change root catch-all to `landing.html` |
| `js/components/header.js` | Add `/app` as href for "Start Quiz" / logo home links |
| `js/components/footer.js` | Update Home link to `/` (landing) vs quiz links to `/app` |
| `src/index.template.html` | Canonical URL stays `/`, no changes needed |

### landing.html technical requirements
- **Standalone** — no webpack, no IIFE modules, inline `<style>` block only
- **Firebase init NOT needed** — no auth, no quiz logic on this page
- **Fast** — only Font Awesome CDN external resource (fonts are inlined or CDN)
- **Brand green** — all colours strictly `#25d366 / #128c7e / #3ed664`
- **Responsive** — mobile-first, single breakpoint at 768px
- **CopyPlugin** — add `landing.html` to CopyPlugin patterns in `webpack.config.js`
  (same as `premium.html`, `dashboard.html` etc.)
- **SEO** — full OG meta tags, canonical `https://iquizpro.com/`

### Key CTA link pattern
All "Take a Quiz" / "Explore" links go to `/app` (not `/`).
The `/app` URL serves `dist/index.html` via Firebase rewrite — same behaviour as today.

---

## Priority Order for Build

1. Create `landing.html` (hero + social proof + 3 category cards + how it works + premium strip + footer)
2. Add CopyPlugin entry for `landing.html`
3. Update `firebase.json` routing
4. Update header.js logo/home link to respect current page (landing vs app)
5. Build + test locally
6. Deploy hosting only (`npm run build && firebase deploy --only hosting`)
