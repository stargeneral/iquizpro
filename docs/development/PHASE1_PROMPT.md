# Phase 1 Session Prompt — iQuizPros Foundation & Cleanup

Use this prompt to start a new Claude session for Phase 1 development work.
Copy everything below the line into a new Claude chat.

---
## COPY FROM HERE ↓
---

# iQuizPros — Phase 1: Foundation & Cleanup

## Project Context

I am building **iQuizPros**, an interactive quiz platform with live Mentimeter-style presentation features. The site is live at **https://iquizpro.com** (Firebase Hosting, project ID: `quizpros`).

The codebase lives on my local Windows machine at:
```
E:\Programs\iquizpros-live-backup
```

This directory was freshly downloaded from the live site on Feb 25, 2026 and is the **source of truth** — it matches what's currently deployed. The old directory `E:\Programs\iquizpros-styled-final` is OUTDATED and should NOT be used.

**Please add `E:\Programs\iquizpros-live-backup` to Desktop Commander's allowed directories before doing any work.**

---

## Important Files — Read These First

Before making any changes, please read these files in order to understand the full project:

1. **`CLAUDE.md`** (root) — Critical AI context: architecture, module system, dependencies, pitfalls
2. **`README.md`** (root) — Project overview, tech stack, structure, deployment
3. **`CHANGELOG.md`** (root) — Version history and what changed between releases
4. **`docs/development/DEVELOPMENT_PLAN.md`** — Full 8-phase roadmap with all tasks
5. **`js/config.js`** — Central configuration (Firebase creds, feature flags, premium tiers)
6. **`index.html`** — Main entry point with all script loading order (THIS ORDER IS CRITICAL)

---

## Tech Stack Summary

- **Frontend:** Vanilla JavaScript (ES6+) using IIFE module pattern (`window.QuizProsXxx`)
- **Backend:** Firebase v9.6.0 compat mode (Auth, Firestore, Realtime Database)
- **Payments:** Stripe.js v3 (partially implemented)
- **Build:** No build step for main app; webpack only for live-presenter/audience bundles
- **Hosting:** Firebase Hosting → quizpros.web.app + iquizpro.com
- **30+ individual `<script>` tags** in index.html — loading order is a dependency chain

---

## Phase 1 Objectives

### 1.1 Development Environment Setup
- Initialize Firebase CLI in project directory (`firebase init hosting`)
- Create `firebase.json` and `.firebaserc`
- Test local serving with `firebase serve`
- Create `.gitignore` for node_modules, .firebase, etc.
- Initialize Git repository
- Create a basic `package.json` for dev tooling

### 1.2 Authentication Consolidation (HIGH PRIORITY)
The current auth system has **6+ overlapping fix scripts** layered on top of each other over time. They need to be consolidated into a single robust module.

**Current auth files (10 files!):**
```
js/firebase-auth-fix.js          → Firebase init guard
js/auth-service-fix-v2.js        → GoogleAuthProvider fix
js/auth-service-fix.js           → Earlier version of above
js/auth-fix.js                   → Auth state listener fixes
js/auth-persistence-fix.js       → Session persistence across reloads
js/auth-button-fix.js            → Login/signup button event binding
js/direct-auth-fix.js            → Fallback modal creation
js/modules/auth-service.js       → Core auth service (QuizProsAuthService)
js/modules/auth-ui.js            → Auth modal UI rendering
js/modules/auth-helper.js        → Auth utility functions
js/components/auth-header-integration.js → Auth state in header
```

**Goal:** Create a single unified `js/modules/auth-manager.js` that handles:
- Firebase initialization guard (ensure Firebase is ready before auth calls)
- Email/password sign-in and sign-up
- Google sign-in (GoogleAuthProvider)
- Auth state persistence across page reloads
- Auth state change listeners
- Auth modal UI (login/signup forms with proper event binding)
- Auth state reflection in header (logged in/out UI)
- Error handling with user-friendly toast notifications
- Premium status checking integration

**Critical requirements:**
- Must work with Firebase v9.6.0 COMPAT mode (`firebase.auth()`, not modular `getAuth()`)
- Must handle the case where Firebase SDK hasn't loaded yet (race condition)
- Must update header UI when auth state changes
- Must support both email/password AND Google sign-in
- Must persist auth state across page refreshes
- Modal must work on mobile (no footer overlap issues)

After creating the unified module, update `index.html` to remove all legacy auth scripts and load only the new one.

### 1.3 Code Organization
Split oversized files into focused modules:

**quiz-engine.js (55KB, 1492 lines) → split into:**
- `quiz-state.js` — State machine and progression logic
- `quiz-scoring.js` — Score calculation and result determination
- `quiz-timer.js` — Question timing (if applicable)
- `quiz-renderer.js` — DOM rendering for questions and options

**topics.js (37KB, 1069 lines) → split into:**
- `topic-registry.js` — Topic/category definitions
- `topic-loader.js` — JSON template fetching and parsing
- `question-bank.js` — Inline knowledge quiz question data

**header.js (644 lines) → split into:**
- `header.js` — Core header structure and navigation
- `mobile-menu.js` — Hamburger menu logic
- `header-auth.js` — Auth state display (merged with auth-header-integration.js)

**Important:** All split modules must still use the `window.QuizProsXxx` IIFE pattern and maintain backward compatibility with other modules that reference them.

### 1.4 Bug Fixes & Quick Wins
- Audit browser console for errors across all quiz topics
- Fix any topics loading incorrect questions
- Verify all social sharing links work correctly
- Check for broken image paths in zodiac and spirit animal quizzes
- Ensure footer doesn't block quiz buttons on mobile

---

## How to Work

1. **Read the context files first** (CLAUDE.md, README.md, config.js, index.html)
2. **Use Desktop Commander** to read and edit files directly on my machine
3. **Make targeted changes** — don't rewrite files unnecessarily
4. **Test incrementally** — after each major change, I'll test in browser
5. **Update CHANGELOG.md** after completing each sub-task
6. **Preserve the module loading order** in index.html unless intentionally restructuring

---

## Success Criteria for Phase 1

- [ ] `firebase serve` works locally and serves the site correctly
- [ ] Git initialized with proper `.gitignore`
- [ ] Auth system consolidated: 10 files → 1-2 files
- [ ] All auth flows work: signup, login, logout, Google sign-in, session persistence
- [ ] quiz-engine.js split into 3-4 focused modules
- [ ] topics.js split into 2-3 focused modules
- [ ] header.js split into 2-3 focused modules
- [ ] No new console errors introduced
- [ ] All existing quiz topics still load and function correctly
- [ ] CHANGELOG.md updated with all Phase 1 changes

---

## Naming & Code Conventions (Mandatory for ALL changes)

- Window globals: `window.QuizPros[ModuleName]` (PascalCase)
- File names: `kebab-case.js`
- CSS classes/IDs: `kebab-case`
- Module pattern: IIFE returning public API (see CLAUDE.md)
- No circular dependencies. Modules never depend on components.
- When splitting a file, keep the original global name as a facade so nothing breaks.
- Search the entire codebase before renaming or removing anything.

---

## End-of-Phase Checklist (MANDATORY before ending session)

When all Phase 1 tasks are complete, the LAST things to do are:

1. [ ] Update `CHANGELOG.md` with all Phase 1 changes
2. [ ] Update `CLAUDE.md` if the module map, dependency graph, or conventions changed
3. [ ] Create `docs/development/PHASE1_HANDOFF.md` using the template in `docs/development/PROMPT_FRAMEWORK.md` — this documents:
   - Every file created, modified, removed, or renamed
   - All new or removed `window.QuizPros*` globals
   - Any breaking changes or facades added for backward compatibility
   - Known issues and tech debt discovered
   - Recommendations for Phase 2
4. [ ] Create `docs/development/PHASE2_PROMPT.md` using the prompt template in `docs/development/PROMPT_FRAMEWORK.md` — this must include:
   - A summary of what Phase 1 changed (from handoff)
   - Phase 2 objectives from DEVELOPMENT_PLAN.md (Build Pipeline & Performance)
   - List of files likely to be touched
   - Any known issues carried forward
5. [ ] Review the handoff document with me before ending the session

This handoff process ensures the next session has full context and prevents breaking changes, naming inconsistencies, or duplication across phases.

---

Let's start by reading CLAUDE.md and README.md, then tackle the tasks in order. Begin with 1.1 (environment setup) since it's quickest, then move to 1.2 (auth consolidation) as the biggest win.
