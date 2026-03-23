# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

NexT — weekly task manager built with Next.js 16, TypeScript, Tailwind CSS, and Firebase (Auth + Firestore). Features a 7-day calendar view and GTD-style custom lists organized into groups. All data is per-user, stored anonymously in Firestore.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript check
```

## Architecture

### Key constraint: Firebase is client-only

`src/lib/firebase.ts` uses lazy initialization via `getFirebaseAuth()` / `getFirebaseDb()` getters. Firebase is **never initialized at module level** — calling these on the server throws. All Firestore/Auth access must happen inside `useEffect` or event handlers.

### Data flow

```
useAuth (Firebase anonymous auth) → uid
useFirestore(uid) → state + actions
page.tsx → consumes both hooks, passes actions as props
```

`useFirestore` holds all Firestore logic: realtime listeners (onSnapshot), CRUD for tasks/groups/lists, and first-login initialization of default GTD lists.

### Firestore path structure

```
artifacts/{APP_ID}/users/{uid}/
  tasks/                    — Task documents
  groups/                   — Group documents (e.g. "GTD")
  lists/                    — TaskList documents, each has groupId
  settings/profile          — { name }
  settings/initialization   — { initialized: true }
```

`APP_ID` comes from `NEXT_PUBLIC_APP_ID` env var (default: `minima-list`).

### Component tree

```
page.tsx
├── ConfirmModal           — generic delete confirmation dialog
├── DayColumn[]            — one per weekday; listId = ISO date string (YYYY-MM-DD)
│   └── TaskListWithLines
│       └── TaskItem
├── GroupTab[]             — group selector/tabs
├── CustomListColumn[]     — one per list in active group
│   └── TaskListWithLines
│       └── TaskItem
└── NewListPlaceholder     — inline form to create a new list
```

Tasks in the weekly view use `formatDateKey(date)` as their `listId`. Tasks in custom lists use the Firestore document ID of the list.

### Drag-and-drop

HTML5 drag API. `TaskItem` sets `dataTransfer.setData('taskId', ...)`. `TaskListWithLines` handles `onDrop` and calls `onDropTask(taskId, listId)`, which updates the task's `listId` in Firestore.

## Environment

Copy `.env.local.example` to `.env.local` and fill in Firebase credentials. All vars are prefixed `NEXT_PUBLIC_`.

Enable **Anonymous Authentication** in the Firebase console for the project.

## AIOS God Mode

Skills installed at `.claude/skills/`:
- `aiox-god-mode` — Supreme operator. Activate with `/aiox-god-mode`. Routes requests to agents, creates components, configures system.
- `aios-god-mode` — Legacy alias → redirects to `aiox-god-mode`.
- `find-skills` — Discovers available skills.

Rules: `.claude/rules/tool-examples.md`
Settings: `.claude/settings.json`

## Squads

Squads are installed at `squads/` (root). Each squad is a self-contained multi-agent system.

### zero-to-one (`squads/zero-to-one/`)
- **Purpose:** Validate and launch an AI-first business from $0 to first revenue.
- **Activate:** `/v1 start`
- **Slash prefix:** `/v1 <command>`
- **Key commands:** `/v1 start`, `/v1 status`, `/v1 goto phase-{N}`, `/v1 pre-mortem`, `/v1 48h-mvp`, `/v1 launch`, `/v1 pivot`
- **Agents:** 34 agents across 10 phases (DISCOVER → VALIDATE → ARCHITECT → MODEL → OFFER → BUILD → LAUNCH → ITERATE → SUSTAIN → GROW)
- **CLAUDE.md:** `squads/zero-to-one/CLAUDE.md` — load for boot sequence and rules
- **Config:** `squads/zero-to-one/config/` (principles, heuristics, quality-gates)

### opb (`squads/opb/`)
- **Purpose:** Virtual board of directors for One-Person Business founders (PT-BR).
- **Activate:** `@opb` or `/reunion {minutes} {topic}`
- **Slash prefix:** `/opb` / `/reunion`
- **Key commands:** `/reunion 5 {topic}` (quick), `/reunion 15 {topic}` (tactical), `/reunion 45 {topic}` (full assembly)
- **Agents:** 12 agents — CEO Sintético (Dalio), Peter Thiel, Naval Ravikant, Alex Hormozi, Noah Kagan, Justin Welsh, Dan Koe, Alan Nicolas, CFO Synth, COO Synth, Russell Brunson, Advocatus Diaboli
- **CLAUDE.md:** `squads/opb/CLAUDE.md` — load for routing rules and output format
- **Shield:** Every plan MUST pass Advocatus Diaboli → CFO Synth → COO Synth before delivery

### God Mode ↔ Squads routing
When the user invokes a squad command (`/v1 *`, `/opb`, `/reunion`), God Mode should:
1. Read the squad's `CLAUDE.md` for boot/routing rules
2. Load only the relevant agent file from `squads/{squad}/agents/`
3. Follow the squad's own workflow — do not override with AIOS core workflows
