# AI Dev Framework — Promotion & Video Project Prompt

**Use this prompt to start a dedicated session for creating promotional content around the AI Development Framework.**

> ⚠️ This is a SEPARATE project from iQuizPros development. Do NOT make changes to the iQuizPros codebase in this session.

---

## Project Context

I have built an **AI Development Framework** — a structured system for maintaining context, consistency, and quality when building software with AI coding assistants across multiple sessions. The framework solves the core problem that AI tools forget everything between chat sessions.

The framework files live at:
```
E:\Programs\iquizpros-live-backup\docs\development\
```

**Please add `E:\Programs\iquizpros-live-backup` to Desktop Commander's allowed directories.**

The goal of this session is to produce **promotional and educational content** so I can:
1. Publish a video teaching developers how to use this framework
2. Host the downloadable starter kit on my website
3. Write website copy that drives downloads

---

## Required Reading (Do This First)

Read these files IN ORDER to understand the framework before creating any content:

1. `docs/development/claude-system-framework.md` — **THE DOWNLOADABLE PRODUCT** — the complete, self-contained single-file starter kit. This is what visitors download from the website. Read every section.
2. `docs/development/PROMPT_FRAMEWORK.md` — The iQuizPros-specific instantiation of the framework (shows what a mature, project-specific version looks like after several phases)
3. `docs/development/PHASE3_PROMPT.md` — A real, complete example of a Phase Prompt in action
4. `docs/development/PHASE2B_HANDOFF.md` — A real, complete example of a Handoff Document in action
5. `CLAUDE.md` — A real, complete example of the living architecture document

The iQuizPros files (2–5) are the **real-world proof** that the framework works. They will be referenced in the video and website copy as social proof.

---

## What the Framework Is

### The core problem it solves
AI coding assistants (Claude, Cursor, GitHub Copilot, etc.) have no memory between sessions. Every new chat starts blank. Developers waste time re-explaining context, and AI makes inconsistent decisions — different naming conventions, different architecture choices, breaking things it built before.

### The solution: one file, four components, one self-reinforcing loop

```
Phase Prompt ──► Development Work
     ▲                  │
     │                  ▼
  Next Prompt    Testing & Verification
     ▲                  │
     │                  ▼
  Handoff Doc ◄── Update CLAUDE.md
```

**1. CLAUDE.md** — The permanent memory of a project. Architecture, module map, naming conventions, common pitfalls, key files. AI reads this first at the start of EVERY session.

**2. Phase Prompts** — Structured session-starter documents. Contain: project context, required reading, what changed last phase, naming conventions (repeated every time to prevent drift), phase objectives with acceptance criteria, files to touch, known issues, success criteria, end-of-phase checklist.

**3. Handoff Documents** — Created by the AI at the END of each session. Contain: what was done, files changed (new/modified/deleted/renamed), architecture changes, breaking changes, known issues, testing notes, recommendations for next phase.

**4. PROMPT_FRAMEWORK.md** — The meta-template defining exactly what a Phase Prompt and Handoff Document must contain. Referenced in every prompt's Required Reading and End-of-Phase Checklist — so it self-propagates.

### The downloadable product: `claude-system-framework.md`
A single, self-contained markdown file containing everything a developer needs to adopt this framework on any project:
- **Section 1**: Project initialization prompt (fill in placeholders, paste into Claude, get full project documentation generated)
- **Section 2**: Documentation templates (CLAUDE.md template, CHANGELOG.md template)
- **Section 3**: Phase lifecycle framework (phase prompt template, handoff document template, universal rules block)
- **Section 4**: Quick reference (checklists, file map, document purposes table)
- **Section 5**: Best practices and anti-patterns (what works, what to avoid)
- **Section 6**: Worked example (FitTrack Pro — shows how to fill in the placeholders for a React project)

Works with any AI assistant. Works with any tech stack (Vanilla JS, React, Python/Django, etc.).

### Real proof: iQuizPros project
The framework has been running across 3 completed phases (Phase 1: Auth Consolidation, Phase 2: Build Pipeline, Phase 2B: Image Optimisation) with Phase 3 fully documented and ready. Zero context loss across sessions. Consistent naming conventions and module patterns throughout. Live at https://iquizpro.com.

---

## Session Objectives

### 1. Polish `claude-system-framework.md` for Public Release

The file already exists and is complete. Before publishing it for download, review and refine:

- Check all placeholder syntax is consistent (`[PROJECT_NAME]`, `[LOCAL_PATH]` etc.)
- Ensure the Section 6 example (FitTrack Pro) is realistic and complete enough to be instructive
- Add a version number and "last updated" date to the top of the file
- Add a brief "What This File Is" introduction at the very top (for people who land on it without context)
- Verify the file structure diagram in Section 4 (`What Goes Where`) matches the templates
- Check that the End-of-Phase Checklist in the Phase Prompt Template (Section 3B) includes explicit references to `PROMPT_FRAMEWORK.md` for the handoff and next-phase prompt (aligning with the iQuizPros-specific improvement made during real usage)
- Output: updated `docs/development/claude-system-framework.md`

### 2. Finalize the Video Script

A draft video script already exists — the user will provide it at session start. Your job:

- Review the script for accuracy against the actual framework files you have read
- Tighten the language — conversational, direct, developer-to-developer tone
- Ensure every claim is grounded in real files (reference specific sections by name)
- Add or refine: on-screen text cues (what to show on screen at each moment), B-roll notes, transitions
- Write the 60-second short-form cut (TikTok / YouTube Shorts)
- Suggest a strong thumbnail concept (text + visual)
- Output: polished script as `docs/promotional/VIDEO_SCRIPT.md`

### 3. Write the Website Landing Page Copy

A landing page for the `claude-system-framework.md` download. Structure:

| Section | Content |
|---------|---------|
| **Headline** | Problem-focused, punchy — not "Download my framework" |
| **Sub-headline** | What it solves in one sentence |
| **The problem** | 3–4 bullet points — the pain of AI context loss |
| **The solution** | The 4 components, briefly. What you get. |
| **Social proof** | Reference iQuizPros: "Built and tested across 3+ phases on a real production project" |
| **What you get** | Single-file download. Works with any AI. Works with any stack. |
| **CTA** | "Download Free — claude-system-framework.md" |
| **FAQ** | 5–6 questions (see below) |

FAQ questions to answer:
- Does this work with Cursor / GitHub Copilot / other AIs (not just Claude)?
- I'm using React / Python / another stack — will this work?
- How long does it take to set up?
- Do I need to use all the templates, or can I start simple?
- Can I use this on a project that's already in progress?
- Is this really free?

Tone: honest, practical, developer-facing — no hype, no "revolutionary", no bullet points that start with "✨".
Output: `docs/promotional/LANDING_PAGE_COPY.md`

### 4. Write 3 Social Media Posts

**Post 1 — The Hook (LinkedIn long-form / Twitter thread opener)**
Lead with the problem. No solution yet. End with a question that makes developers nod.

**Post 2 — The Solution Reveal**
Introduce the 4 components. One sentence each. Include the download link.

**Post 3 — Social Proof / Results**
Describe the iQuizPros example: 3+ phases, consistent codebase, zero context re-explaining. Link to live site + download.

Format: suitable for both LinkedIn (full sentences, 3–5 short paragraphs) and Twitter/X (thread format, each paragraph = one tweet).
Output: `docs/promotional/SOCIAL_POSTS.md`

### 5. Write a Short README for the GitHub Release (Optional)

If the framework is to be hosted on GitHub alongside the download:
- Title, one-paragraph description
- "What's inside" list (the 6 sections)
- Quick start (3 steps: download, fill in Section 1, paste into Claude)
- Link to the full video
- License (already: free to use, modify, share)
- Output: `docs/promotional/GITHUB_README.md`

---

## Tone & Style Guidelines

- **Audience**: Developers of any level who use AI coding assistants
- **Tone**: Direct, practical, peer-to-peer — not a course creator selling their framework
- **No hype**: Don't say "revolutionary", "game-changing", "10x productivity" — show specifics instead
- **Specific over vague**: Reference real sections, real file names, real project outcomes
- **Honest about effort**: The framework takes 30–60 minutes to set up on a new project. Say that. The payback is real but not instant.
- **Not Claude-exclusive**: Emphasise this works with any AI assistant — Claude is what was used to build it, but the framework is AI-agnostic

---

## Deliverables Summary

| Item | Output Path | Notes |
|------|-------------|-------|
| Polished starter kit | `docs/development/claude-system-framework.md` | Version bump, intro, checklist fix |
| Main video script | `docs/promotional/VIDEO_SCRIPT.md` | With on-screen cues and B-roll notes |
| 60-second short-form script | Inside VIDEO_SCRIPT.md | TikTok / YouTube Shorts |
| Thumbnail concept | Inside VIDEO_SCRIPT.md | Text + visual description |
| Website landing page copy | `docs/promotional/LANDING_PAGE_COPY.md` | Headline through FAQ |
| Social media posts (×3) | `docs/promotional/SOCIAL_POSTS.md` | LinkedIn + Twitter formats |
| GitHub README (optional) | `docs/promotional/GITHUB_README.md` | If hosting on GitHub |

---

## How to Work

1. **Read all five required files first** — they are the ground truth; do not paraphrase or invent details
2. **Use Desktop Commander** to read files and create new files; do NOT edit any iQuizPros source files
3. **Ask the user for the draft video script** before starting Objective 2
4. **Create output files** in `docs/promotional/` (create the directory if it doesn't exist)
5. **Work through objectives in order** — confirm with user after each before moving on
6. **Session ends** when all deliverables are reviewed and approved by the user

---

## Success Criteria

- [ ] `claude-system-framework.md` polished — version number, intro paragraph, checklist updated
- [ ] Video script finalized — accurate, specific, developer tone throughout
- [ ] 60-second short-form script written
- [ ] Thumbnail concept described
- [ ] Landing page copy written — headline through FAQ, honest tone
- [ ] 3 social media posts written in both LinkedIn and Twitter formats
- [ ] GitHub README written (if requested)
- [ ] All files saved under `docs/promotional/`
- [ ] All deliverables reviewed with user before session ends
