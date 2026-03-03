# Prompt & Handoff Framework for iQuizPros Development

## Overview

Each development phase follows a strict cycle to ensure continuity, prevent breaking changes, and maintain consistent code quality across sessions.

```
┌─────────────────────────────────────────────────┐
│                                                   │
│   Phase N Prompt  ──►  Development Work           │
│        │                      │                   │
│        │                      ▼                   │
│        │              Testing & Verification      │
│        │                      │                   │
│        │                      ▼                   │
│        │              Update CHANGELOG.md         │
│        │                      │                   │
│        │                      ▼                   │
│        │          Create Handoff Document          │
│        │            (PHASE_N_HANDOFF.md)           │
│        │                      │                   │
│        │                      ▼                   │
│        │          Generate Phase N+1 Prompt        │
│        │            (PHASE_N+1_PROMPT.md)          │
│        │                      │                   │
│        └──────────────────────┘                   │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Rules for All Phases

### 1. Naming Conventions (Enforced Across All Phases)

**Module naming:**
- Window globals: `window.QuizPros[ModuleName]` (PascalCase)
- File names: `kebab-case.js` (e.g., `auth-manager.js`, `quiz-state.js`)
- CSS classes: `kebab-case` (e.g., `.quiz-card`, `.auth-modal`)
- IDs: `kebab-case` (e.g., `#topic-selection-screen`, `#main-quiz-container`)
- Constants: `UPPER_SNAKE_CASE`
- Functions/variables: `camelCase`
- JSON template files: `kebab-case.json`

**File locations:**
- Modules (business logic): `js/modules/`
- UI Components: `js/components/`
- Utilities: `js/utils/`
- Stylesheets: `css/`
- Quiz data: `templates/`
- Dev docs: `docs/development/`
- Images/fonts/sounds: `assets/`
- **Cloud Functions** (Phase 3+): `functions/` — server-side Node.js only; does NOT use the IIFE pattern

**Module pattern (mandatory):**
```javascript
window.QuizPros[Name] = (function() {
  // Private state
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;

  // Private functions
  function privateHelper() { ... }

  // Public API
  return {
    initialize: initialize,
    publicMethod: publicMethod
  };
})();
```

### 2. Dependency Rules
- Never create circular dependencies between modules
- All modules may depend on: `QuizProsConfig`, `QuizProsUtils`, `QuizProsStorage`
- Components may depend on modules, but modules must NEVER depend on components
- New modules must be added to `index.html` in the correct position in the loading chain
- Document any new dependency in CLAUDE.md's dependency graph

### 3. Change Safety Rules
- Never rename an existing public API method without updating ALL callers
- Never remove a `window.QuizPros*` global without verifying zero references
- Always search the entire codebase before renaming or removing anything
- When splitting a file, the original global name must still work (use a facade/re-export)
- Test all quiz topics after any structural change, not just the one you're working on

### 4. Documentation Rules
- Update `CLAUDE.md` if architecture, module map, or conventions change
- Update `CHANGELOG.md` for every deployable change
- Every new file must have a JSDoc header comment explaining its purpose
- Every phase ends with a handoff document and next-phase prompt

---

## Phase Prompt Template

Every phase prompt follows this exact structure. The sections marked [GENERATED] are filled in by the handoff process from the previous phase.

```markdown
# iQuizPros — Phase [N]: [Phase Title]

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
2. `docs/development/PHASE_[N-1]_HANDOFF.md` — What changed in the last phase
3. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap for reference
4. `docs/development/PROMPT_FRAMEWORK.md` — Naming rules, module patterns, and the handoff/prompt templates required when generating end-of-phase documents

---

## What Changed in Phase [N-1] (Summary)

[GENERATED from handoff document — key structural changes, new files,
removed files, renamed modules, updated dependencies, known issues]

---

## Naming & Code Conventions (Mandatory)

- Window globals: `window.QuizPros[ModuleName]` (PascalCase)
- Files: `kebab-case.js`
- CSS classes/IDs: `kebab-case`
- Module pattern: IIFE with `return { publicAPI }` (see CLAUDE.md)
- No circular dependencies. Modules never depend on components.
- Search entire codebase before renaming or removing anything.

---

## Phase [N] Objectives

### [N].1 [First Task Title]
[Detailed description with acceptance criteria]

### [N].2 [Second Task Title]
[Detailed description with acceptance criteria]

### [N].3 [Third Task Title]
[Detailed description with acceptance criteria]

---

## Files Likely to Be Touched

[List of specific files this phase will modify, create, or delete —
helps Claude load the right context immediately]

---

## Known Issues & Constraints

[GENERATED — Any bugs, tech debt, or limitations carried forward
from previous phases that this phase must work around]

---

## How to Work

1. Read the required files first
2. Use Desktop Commander to read/edit files on my machine
3. Make targeted, incremental changes
4. After each sub-task, I will test in browser
5. **Phase 1**: Preserve module loading order in `index.html` directly.
   **Phase 2+**: Edit source files (`js/`, `css/`, `src/`) and run `npm run build` to regenerate `dist/`. Module loading order is defined in `src/app-entry.js`. Never edit `dist/` files directly — they are overwritten on every build.
6. Search codebase before renaming/removing anything

---

## Success Criteria

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]
- [ ] No new console errors introduced
- [ ] All existing quiz topics still function correctly
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md updated if architecture changed

---

## End-of-Phase Checklist

When all objectives are complete, before ending this session:

- [ ] Run final verification of all changes
- [ ] Update CHANGELOG.md with all Phase [N] changes
- [ ] Update CLAUDE.md if module map, conventions, or architecture changed
- [ ] Create `docs/development/PHASE_[N]_HANDOFF.md` — **using the Handoff Document Template in this file**
- [ ] Create `docs/development/PHASE_[N+1]_PROMPT.md` — **using the Phase Prompt Template in this file**, incorporating all learnings from the handoff
```

---

## Handoff Document Template

Created at the END of each phase. This is the bridge that ensures
the next session has full context.

```markdown
# Phase [N] Handoff — [Phase Title]

**Completed:** [Date]
**Phase Status:** Complete / Partial (describe what's left)

---

## What Was Done

### [N].1 [Task Title]
- [Concise description of what was implemented]
- [Key decisions made and why]

### [N].2 [Task Title]
- [Concise description of what was implemented]
- [Key decisions made and why]

---

## Files Changed

### New Files Created
| File | Purpose |
|------|---------|
| `js/modules/auth-manager.js` | Unified auth module replacing 6+ scripts |
| ... | ... |

### Files Modified
| File | What Changed |
|------|-------------|
| `index.html` | Removed 8 auth script tags, added auth-manager.js |
| ... | ... |

### Files Removed
| File | Reason |
|------|--------|
| `js/auth-fix.js` | Consolidated into auth-manager.js |
| ... | ... |

### Files Renamed
| Old Name | New Name | Reason |
|----------|----------|--------|
| ... | ... | ... |

---

## Architecture Changes

### Module Map Updates
[Any changes to the dependency graph in CLAUDE.md]

### New Globals Introduced
| Global | File | Purpose |
|--------|------|---------|
| `window.QuizProsAuthManager` | `js/modules/auth-manager.js` | Unified auth |

### Globals Removed
| Global | Replaced By |
|--------|------------|
| (none removed without facade) | ... |

### Script Loading Order Changes
[Updated order in index.html, if changed]

---

## Breaking Changes

[List anything that could affect other modules or future phases]
- Example: "QuizProsAuthService global still exists as a facade
  but delegates to QuizProsAuthManager internally"
- Example: "quiz-engine.js was split — old global now re-exports
  from quiz-state.js"

---

## Known Issues & Technical Debt

[Anything discovered but not fixed in this phase]
- Example: "topics.js has 3 duplicate quiz definitions that should
  be cleaned up"
- Example: "Google sign-in popup blocked on some mobile browsers"

---

## Testing Notes

[What was tested and how, plus anything that needs extra attention]
- Tested: signup, login, logout, Google sign-in, session persistence
- Not tested: Premium gating flow (Stripe not configured locally)
- Needs attention: Mobile footer overlap on iPhone SE viewport

---

## Recommendations for Next Phase

[Specific advice for Phase N+1 based on what was learned]
- "The quiz-engine split created clean interfaces — the same
  pattern should work for topics.js"
- "Consider adding error boundaries before splitting more modules"

---

## Current File Tree (Key Files Only)

[Updated tree showing new structure after this phase's changes]
```

---

## Phase Completion Checklist

At the end of EVERY phase, the last items of work must be:

1. ✅ All phase objectives verified working
2. ✅ `CHANGELOG.md` updated with version bump and all changes
3. ✅ `CLAUDE.md` updated if architecture/conventions/modules changed
4. ✅ `docs/development/PHASE_[N]_HANDOFF.md` created — **using the Handoff Document Template in this file (`PROMPT_FRAMEWORK.md`)**
5. ✅ `docs/development/PHASE_[N+1]_PROMPT.md` created — **using the Phase Prompt Template in this file (`PROMPT_FRAMEWORK.md`)**, incorporating all learnings from the handoff
6. ✅ Handoff document reviewed with the user before session ends
```

