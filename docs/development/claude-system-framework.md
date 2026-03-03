# Claude System Framework — Universal Project Development Guide

## How to Use This File

This is a reusable development framework for any software project. When starting
a new project with Claude:

1. Copy this file into your project root
2. Fill in the `[PLACEHOLDERS]` in Section 1 with your project details
3. Follow the setup steps in Section 2 to create your project documentation
4. Use Section 3 templates to run structured development phases

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1: PROJECT INITIALIZATION PROMPT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this prompt in your FIRST Claude session with a new project.
Fill in the placeholders, then paste the entire block into Claude.

```
# New Project Setup — [PROJECT_NAME]

## What I Need
I'm starting development on [PROJECT_NAME] and I want to establish a
structured, phase-based development workflow. Please help me set up
the project documentation and development framework.

## Project Details

- **Project name:** [PROJECT_NAME]
- **Description:** [One paragraph describing what the project does]
- **Live URL:** [URL or "not yet deployed"]
- **Local path:** [e.g., E:\Programs\my-project]
- **Tech stack:** [e.g., React + Node.js + PostgreSQL / Django + HTMX / etc.]
- **Hosting:** [e.g., Firebase / AWS / Ubuntu VPS / Vercel / cPanel]
- **Current state:** [New project / Existing codebase / Partial build]

## What I Want You To Do

1. **Add my project directory to Desktop Commander's allowed directories**
2. **Explore the codebase** (if existing) and understand the structure
3. **Create these documentation files:**

   a) `README.md` — Project overview, tech stack, structure, setup, deployment
   b) `CHANGELOG.md` — Version history (start at current state)
   c) `CLAUDE.md` — AI assistant context file containing:
      - Architecture overview and module/component map
      - Dependency graph
      - Naming conventions used in the project
      - Common pitfalls and things to watch out for
      - File locations and what lives where
      - How to test and deploy
   d) `docs/development/DEVELOPMENT_PLAN.md` — Phased roadmap with tasks
   e) `docs/development/PROMPT_FRAMEWORK.md` — Copy the framework below

4. **Create a Phase 1 prompt** at `docs/development/PHASE1_PROMPT.md`

## Naming Conventions To Follow

[Choose one set and delete the others, or define your own]

**Option A — Vanilla JS / jQuery:**
- Window globals: `window.[ProjectPrefix][ModuleName]` (PascalCase)
- Files: `kebab-case.js`
- CSS: `kebab-case` classes and IDs
- Module pattern: IIFE with public API return

**Option B — React / Vue / Svelte:**
- Components: `PascalCase.jsx` / `.vue` / `.svelte`
- Hooks/composables: `camelCase.js`
- Utilities: `kebab-case.js`
- CSS modules: `ComponentName.module.css`
- Constants: `UPPER_SNAKE_CASE`

**Option C — Python / Django / Flask:**
- Modules: `snake_case.py`
- Classes: `PascalCase`
- Functions/variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Templates: `snake_case.html`

**Option D — Custom:**
[Define your own conventions here]
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 2: DOCUMENTATION TEMPLATES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2A. CLAUDE.md Template

```markdown
# CLAUDE.md — AI Assistant Context for [PROJECT_NAME]

This file provides context for Claude when working on this codebase.

---

## Project Overview

[2-3 sentences: what the project does, who it's for, what makes it unique]

## Critical Context

[Things Claude MUST know to avoid breaking the project. Examples:]
- "This is a static site — there is no build step"
- "All state management goes through Redux — never use local component state for shared data"
- "The API uses JWT auth — tokens refresh automatically via interceptor in api-client.js"
- "Database migrations must be backward-compatible — we do zero-downtime deploys"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [e.g., React 18, TypeScript, Tailwind] |
| Backend | [e.g., Node.js, Express, Prisma] |
| Database | [e.g., PostgreSQL 15] |
| Hosting | [e.g., Vercel + Railway] |
| CI/CD | [e.g., GitHub Actions] |

## Key Files

| File | Purpose | Notes |
|------|---------|-------|
| [path] | [what it does] | [anything important] |

## Architecture / Module Map

[Dependency graph, data flow, or component hierarchy]

## Code Conventions

- [Convention 1]
- [Convention 2]
- [Convention 3]

## Common Pitfalls

1. [Pitfall and how to avoid it]
2. [Pitfall and how to avoid it]

## Development Process

Development follows a structured phase system.
See `docs/development/PROMPT_FRAMEWORK.md` for the full framework.

**Key rules:**
- Every phase ends with a handoff document and a next-phase prompt
- All dev docs live in `docs/development/`
- Always read the most recent handoff document before starting work
- Update this file whenever architecture or conventions change

### Files in `docs/development/`
| File | Purpose |
|------|---------|
| `DEVELOPMENT_PLAN.md` | Full phased roadmap |
| `PROMPT_FRAMEWORK.md` | Templates for prompts, handoffs, naming rules |
| `PHASE[N]_PROMPT.md` | Session start prompt for phase N |
| `PHASE[N]_HANDOFF.md` | What changed in phase N |
```

---

## 2B. CHANGELOG.md Template

```markdown
# Changelog

All notable changes to [PROJECT_NAME] will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- [New feature or file]

### Changed
- [Modification to existing functionality]

### Fixed
- [Bug fix]

### Removed
- [Removed feature or file]

---

## [X.X.X] - YYYY-MM-DD

### Added
- Initial project setup
- [List initial features]
```


---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 3: PHASE LIFECYCLE FRAMEWORK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## How Phases Work

```
Phase N Prompt  ──►  Development Work  ──►  Testing
                                              │
                                              ▼
                                     Update CHANGELOG.md
                                              │
                                              ▼
                                     Update CLAUDE.md
                                       (if needed)
                                              │
                                              ▼
                                  Create PHASE_N_HANDOFF.md
                                              │
                                              ▼
                                 Create PHASE_N+1_PROMPT.md
                                              │
                                              ▼
                                   Review with user ✓
```

Every phase session:
- **Starts** by reading CLAUDE.md + the latest handoff document
- **Ends** by creating a handoff document + next-phase prompt
- **Never** renames or removes code without searching the entire codebase first
- **Always** updates CHANGELOG.md and CLAUDE.md (if architecture changed)

---

## 3A. Universal Rules (Include in Every Prompt)

Copy this block into every phase prompt to enforce consistency:

```
## Mandatory Rules for This Session

### Code Safety
- Search the ENTIRE codebase before renaming or removing any function,
  variable, class, file, or export
- When splitting a file, keep the original name/export as a facade that
  delegates to the new modules — never break existing callers
- Test all major features after structural changes, not just what you touched
- Never introduce circular dependencies

### Naming Conventions
[Paste your project's conventions from CLAUDE.md here]

### Documentation
- Update CLAUDE.md if architecture, module map, or conventions change
- Update CHANGELOG.md for every deployable change
- Every new file must have a header comment explaining its purpose
- Phase must end with handoff document + next-phase prompt

### How to Work
1. Read required context files first (CLAUDE.md, latest handoff)
2. Use Desktop Commander to read/edit files on my machine
3. Make targeted, incremental changes — don't rewrite files unnecessarily
4. After each sub-task, I will test before proceeding
5. Ask before making large structural changes
```

---

## 3B. Phase Prompt Template

Use this to create `PHASE_[N]_PROMPT.md` for any phase:

```markdown
# [PROJECT_NAME] — Phase [N]: [Phase Title]

## Project Context

I am building **[PROJECT_NAME]** — [one-line description].
[Live URL if applicable].

The codebase is at:
  [LOCAL_PATH]

**Please add this directory to Desktop Commander's allowed directories.**

---

## Required Reading (Do This First)

Read these files IN ORDER before making any changes:

1. `CLAUDE.md` — Architecture, conventions, pitfalls
2. `docs/development/PHASE_[N-1]_HANDOFF.md` — What changed last phase
3. `docs/development/DEVELOPMENT_PLAN.md` — Full roadmap (for reference)

---

## What Changed in Phase [N-1]

[GENERATED — Paste the summary from the previous handoff document.
Include: files created/modified/removed, new globals or exports,
breaking changes, and known issues carried forward.]

---

## Naming & Code Conventions (Mandatory)

[Paste your project's conventions here — same block every time
so Claude never drifts from them.]

---

## Phase [N] Objectives

### [N].1 [Task Title]

**What:** [Clear description of what needs to be done]

**Why:** [Business or technical reason]

**Acceptance Criteria:**
- [ ] [Specific, testable outcome]
- [ ] [Specific, testable outcome]

**Files likely affected:** [List specific files]

---

### [N].2 [Task Title]

**What:** [Clear description]

**Why:** [Reason]

**Acceptance Criteria:**
- [ ] [Specific, testable outcome]
- [ ] [Specific, testable outcome]

**Files likely affected:** [List files]

---

### [N].3 [Task Title]

[Same structure as above]

---

## Known Issues & Constraints

[Carried forward from previous handoff — things this phase
must work around or be aware of.]

---

## Success Criteria

- [ ] [Overall criterion 1]
- [ ] [Overall criterion 2]
- [ ] No new errors introduced
- [ ] All existing functionality still works
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md updated if architecture changed

---

## End-of-Phase Checklist (MANDATORY)

When all objectives are complete, the LAST tasks before ending:

1. [ ] Verify all changes work correctly
2. [ ] Update `CHANGELOG.md` with all changes
3. [ ] Update `CLAUDE.md` if module map, conventions, or architecture changed
4. [ ] Create `docs/development/PHASE_[N]_HANDOFF.md` (use handoff template)
5. [ ] Create `docs/development/PHASE_[N+1]_PROMPT.md` (use this template)
6. [ ] Review handoff document with me before ending session

---

Let's begin. Start by reading CLAUDE.md and the Phase [N-1] handoff,
then tackle objectives in order.
```


---

## 3C. Handoff Document Template

Created at the END of each phase. Use this to create `PHASE_[N]_HANDOFF.md`:

```markdown
# Phase [N] Handoff — [Phase Title]

**Completed:** [Date]
**Status:** Complete / Partial (describe what remains)

---

## What Was Done

### [N].1 [Task Title]
- [What was implemented — be specific]
- [Key decisions made and reasoning]
- [Anything notable or unexpected]

### [N].2 [Task Title]
- [What was implemented]
- [Key decisions made]

---

## Files Changed

### New Files Created
| File | Purpose |
|------|---------|
| `path/to/new-file.js` | [What it does] |

### Files Modified
| File | What Changed |
|------|-------------|
| `path/to/file.js` | [Summary of changes] |

### Files Removed
| File | Reason |
|------|--------|
| `path/to/old-file.js` | [Why it was removed, what replaced it] |

### Files Renamed
| Old Path | New Path | Reason |
|----------|----------|--------|
| `old-name.js` | `new-name.js` | [Why] |

---

## Architecture Changes

### Dependency / Module Map Updates
[Describe any changes to the dependency graph or module structure.
Include updated diagram if significant.]

### New Exports / Globals / Endpoints Introduced
| Name | File | Purpose |
|------|------|---------|
| `ExampleExport` | `path/file.js` | [What it does] |

### Exports / Globals Removed or Deprecated
| Name | Status | Migration |
|------|--------|-----------|
| `OldExport` | Removed / Deprecated | Use `NewExport` instead |

### API Changes (if applicable)
[New routes, changed request/response shapes, removed endpoints]

### Database Changes (if applicable)
[New tables, column changes, migrations added]

---

## Breaking Changes

[List anything that could affect other parts of the codebase
or future development phases. Be explicit.]

- "Renamed X to Y — all references updated, but third-party
  integrations may need updating"
- "Removed deprecated function Z — replaced by W everywhere"
- "Changed config schema — old format still accepted via migration"

If none: "No breaking changes."

---

## Known Issues & Technical Debt

[Anything discovered but NOT fixed in this phase]

- "[Description of issue] — impacts [what] — suggested fix: [idea]"
- "[Description of tech debt] — priority: [low/medium/high]"

If none: "No new issues discovered."

---

## Testing Notes

- **Tested:** [What was verified and how]
- **Not tested:** [What still needs testing and why]
- **Needs attention:** [Anything fragile or environment-specific]

---

## Recommendations for Next Phase

[Specific, actionable advice based on what was learned]

- "The [X] pattern worked well — apply it to [Y] next"
- "Consider addressing [issue] before starting [task]"
- "[Component] is now ready for [enhancement] in Phase N+1"
- "Watch out for [gotcha] when working on [area]"

---

## Updated File Tree (Key Files)

[Show the current project structure reflecting this phase's changes.
Only include files relevant to what changed — not the entire tree.]
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 4: QUICK REFERENCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Starting a New Project — Checklist

```
1. [ ] Copy this framework file into your project
2. [ ] Fill in Section 1 placeholders with project details
3. [ ] Paste Section 1 prompt into first Claude session
4. [ ] Claude creates: README.md, CHANGELOG.md, CLAUDE.md,
       DEVELOPMENT_PLAN.md, PROMPT_FRAMEWORK.md, PHASE1_PROMPT.md
5. [ ] Review all generated docs
6. [ ] Start Phase 1 using PHASE1_PROMPT.md
```

## Starting a New Phase — Checklist

```
1. [ ] Open docs/development/PHASE_[N]_PROMPT.md
2. [ ] Copy everything into a new Claude chat
3. [ ] Claude reads CLAUDE.md + previous handoff
4. [ ] Work through objectives
5. [ ] At the end, Claude creates:
       - Updated CHANGELOG.md
       - Updated CLAUDE.md (if needed)
       - PHASE_[N]_HANDOFF.md
       - PHASE_[N+1]_PROMPT.md
6. [ ] Review handoff before ending session
```

## What Goes Where

```
project-root/
├── README.md                              ← Project overview (public)
├── CHANGELOG.md                           ← Version history (public)
├── CLAUDE.md                              ← AI context (read every session)
├── claude-system-framework.md             ← This file (reference only)
│
├── docs/
│   └── development/                       ← All dev process docs
│       ├── DEVELOPMENT_PLAN.md            ← Full phased roadmap
│       ├── PROMPT_FRAMEWORK.md            ← Project-specific framework
│       ├── PHASE1_PROMPT.md               ← Phase 1 session prompt
│       ├── PHASE1_HANDOFF.md              ← Phase 1 results (created at end)
│       ├── PHASE2_PROMPT.md               ← Phase 2 session prompt
│       ├── PHASE2_HANDOFF.md              ← Phase 2 results
│       └── ...                            ← Continues for each phase
│
└── [your project files]
```

## What Each Document Does

| Document | Created When | Updated When | Read When |
|----------|-------------|-------------|-----------|
| `README.md` | Project start | Any major feature change | New developers / reference |
| `CHANGELOG.md` | Project start | Every phase end | Tracking what changed |
| `CLAUDE.md` | Project start | Architecture/convention changes | **Every Claude session start** |
| `DEVELOPMENT_PLAN.md` | Project start | Scope changes | Planning / reference |
| `PROMPT_FRAMEWORK.md` | Project start | Process improvements | Creating prompts/handoffs |
| `PHASE_N_PROMPT.md` | End of Phase N-1 | Never (immutable) | Start of Phase N |
| `PHASE_N_HANDOFF.md` | End of Phase N | Never (immutable) | Start of Phase N+1 |


---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 5: BEST PRACTICES & ANTI-PATTERNS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## What Makes This Framework Work

### 1. Context Survives Between Sessions
Claude has no memory between chats. The handoff documents ARE the memory.
Every important decision, file change, and known issue gets written down
so the next session starts with full context.

### 2. Conventions Are Repeated, Not Assumed
The naming conventions appear in CLAUDE.md, in PROMPT_FRAMEWORK.md,
and in every phase prompt. Repetition prevents drift. Claude follows
whatever conventions are in the current prompt — so always include them.

### 3. Searching Before Changing
The single most important rule: "Search the entire codebase before
renaming or removing anything." This prevents the #1 cause of bugs
in AI-assisted development — changing something in one file while
references in other files silently break.

### 4. Facades Preserve Compatibility
When splitting a large file into smaller modules, always keep the
original export name working. Other code may reference it. Create a
thin facade that delegates to the new modules. Remove facades only
after verifying zero remaining callers.

---

## Anti-Patterns to Avoid

### ❌ "Just rewrite the whole file"
Large rewrites introduce bugs. Make targeted changes. If a file needs
major restructuring, do it in a dedicated sub-task with explicit
before/after testing.

### ❌ Skipping the handoff document
"I'll remember what I did." No — you won't, and Claude definitely won't.
The handoff is non-negotiable. It takes 5 minutes and saves hours of
confusion in the next session.

### ❌ Changing conventions mid-project
Pick conventions at the start and stick with them. If you must change
a convention, do it as an explicit task (e.g., "rename all CSS classes
from camelCase to kebab-case") with a codebase-wide find-and-replace,
and document it in the handoff.

### ❌ Putting everything in one giant phase
Each phase should be completable in 1-3 Claude sessions. If a phase
has 30+ tasks, split it into sub-phases. Smaller phases = better
handoffs = fewer bugs.

### ❌ Not testing between sub-tasks
Don't let Claude make 10 changes before you test. Test after each
sub-task. It's much easier to fix a bug when you know which change
caused it.

### ❌ Letting Claude guess about existing code
Always have Claude READ the actual file before modifying it. Don't
describe what's in the file from memory — it may have changed.

---

## Tips for Maximum Effectiveness

### Tip 1: Upload CLAUDE.md to Project Knowledge
If using Claude Projects, add CLAUDE.md to the project knowledge.
This way Claude reads it automatically at the start of every chat
without you needing to paste it.

### Tip 2: Keep Phase Prompts Self-Contained
Every phase prompt should work independently — a new Claude session
with zero prior context should be able to understand the project and
start working from the prompt alone (after reading the referenced files).

### Tip 3: Use Desktop Commander for File Operations
Claude can read, edit, search, and create files directly on your
machine through Desktop Commander. This is far more reliable than
copying code back and forth through chat messages.

### Tip 4: Version Control Is Your Safety Net
Initialize Git early. Commit before each phase starts and after each
phase ends. If something goes wrong, you can always revert.

### Tip 5: Review Handoffs Before Ending
Always review the handoff document before ending a session. Catch
any missing details while the context is still fresh.

### Tip 6: Adapt the Framework to Your Project
This framework is a starting point. If your project needs extra
sections (API documentation, database schema tracking, deployment
checklists), add them to your project's PROMPT_FRAMEWORK.md.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 6: EXAMPLE — APPLYING TO A NEW PROJECT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Here's an example of how to fill in Section 1 for a different project:

```
# New Project Setup — FitTrack Pro

## What I Need
I'm starting development on FitTrack Pro and I want to establish a
structured, phase-based development workflow.

## Project Details

- **Project name:** FitTrack Pro
- **Description:** A fitness tracking web app that lets users log
  workouts, track progress with charts, set goals, and share
  achievements. Uses AI to suggest workout plans.
- **Live URL:** not yet deployed
- **Local path:** E:\Projects\fittrack-pro
- **Tech stack:** React 18 + TypeScript, Node.js/Express backend,
  PostgreSQL, deployed on Railway + Vercel
- **Hosting:** Vercel (frontend), Railway (backend + database)
- **Current state:** New project — starting from scratch

## Naming Conventions To Follow

**Option B — React:**
- Components: `PascalCase.tsx`
- Hooks: `use[Name].ts` (camelCase)
- Utilities: `kebab-case.ts`
- API routes: `kebab-case.ts`
- CSS modules: `ComponentName.module.css`
- Database tables: `snake_case`
- Environment variables: `UPPER_SNAKE_CASE`
- Constants: `UPPER_SNAKE_CASE`
- Functions/variables: `camelCase`
- Types/Interfaces: `PascalCase` with `I` prefix for interfaces
```

Claude would then explore the project directory (or scaffold a new one),
create all the documentation files, build a phased development plan, and
generate a Phase 1 prompt — all following this framework.

---

## License

This framework is free to use, modify, and share on any project.
Created as part of the iQuizPros development process, February 2026.
