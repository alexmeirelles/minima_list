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
