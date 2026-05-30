@AGENTS.md

# CLAUDE.md — Better App

Self-improvement web app organized around **multiple target identities** (e.g. Athlete, Entrepreneur, Monk). Users define identities first, then habits/tasks/analytics are scoped to them. Core pillars: build good habits, reduce bad habits (harm-reduction model), manage daily task checklists.

## Commands

```bash
npm run dev      # local dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint check

# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 (CSS-based config, no tailwind.config.ts) |
| UI | shadcn/ui + Base UI (`@base-ui/react`) |
| Auth | Firebase Auth (email/password + Google popup) |
| Database | Firestore (subcollection-per-user) |
| Push | Web Push API + VAPID + `web-push` npm package |
| Hosting | Vercel |

Dark mode: always-on via `<html className="dark">`.

## Project Structure

```
app/
  layout.tsx                  Root layout — AuthSync, AuthGuard, Navbar, BottomNav
  page.tsx                    Dashboard (HabitsSection, TasksTimeBlocks, BadHabitsEODLog, DailyScore)
  auth/page.tsx               Login / signup — after sign-in checks identity count → /onboarding or /
  auth/callback/route.ts      Stub redirect → /auth (no code exchange needed)
  onboarding/page.tsx         First-run identity creation (shown only when user has 0 identities)
  habits/page.tsx             Manage good habits
  bad-habits/page.tsx         Harm-reduction bad habit tracking
  tasks/page.tsx              Daily task checklist — today's tasks + carried over
  analytics/page.tsx          Heatmap, charts, weekly score
  settings/page.tsx           Push notifications + account
  api/push/subscribe/route.ts Save VAPID subscription (POST=upsert, DELETE=remove)
  api/push/send/route.ts      Send push notification (Bearer CRON_SECRET auth)

components/
  AuthSync.tsx                onIdTokenChanged → writes __session cookie for middleware
  layout/Navbar.tsx           Desktop top nav (hidden md:flex)
  layout/BottomNav.tsx        Mobile bottom nav (md:hidden) — 5 items: Home/Habits/Tasks/Quit/Stats
  dashboard/HabitsSection.tsx Today's habits checklist
  dashboard/TasksTimeBlocks.tsx Today's task checklist (today + carried over)
  dashboard/BadHabitsEODLog.tsx End-of-day bad habit log
  dashboard/DailyScore.tsx    Composite score widget
  habits/HabitCard.tsx        Check-in toggle + streak badge
  habits/AddHabitDialog.tsx   Add new habit dialog
  bad-habits/BadHabitCard.tsx Frequency/intensity stats + EOD log dialog + chart dialog
  bad-habits/AddBadHabitDialog.tsx Add bad habit with baseline/goal fields
  bad-habits/ReductionChart.tsx Dual-axis LineChart (frequency left, intensity right)
  tasks/TimeBlockCard.tsx     Task row — checkbox + title + carried badge + delete
  tasks/AddTaskDialog.tsx     Add task with title + date only

hooks/
  useIdentities.ts  fetch (ordered by order), add, update, delete, reorder
  useHabits.ts      fetch, toggle, add (accepts identity_id?), archive — streak computed client-side
  useBadHabits.ts   fetch, logToday (upsert via setDoc), getTodayLog, getWeeklyStats
  useTasks.ts       fetch by date, add, complete, carry-over logic
  useAnalytics.ts   heatmap (84d), taskCompletion (12w), badHabitStats, weeklyScore

lib/
  firebase/client.ts    Firebase Auth + Firestore for client components
  firebase/admin.ts     Firebase Admin SDK for API routes
  utils.ts              cn(), formatDate, today(), getISOWeek, getLast12Weeks, getLast84Days

types/index.ts      Identity, Habit, HabitLog, BadHabit, BadHabitLog, Task, WeeklyStats, DailyScore

firestore.rules     Firestore security rules (users/{uid}/** = owner only)
firebase.json       Points Firebase CLI to firestore.rules
public/
  manifest.json     PWA manifest (name: Better, background: #09090b)
  sw.js             Service worker — push event + notificationclick handler
```

## Firebase Auth Flow

1. Sign in via `app/auth/page.tsx` — `signInWithEmailAndPassword` or `signInWithPopup(auth, new GoogleAuthProvider())`
2. After sign-in, check `users/{uid}/identities` count (limit 1) — redirect to `/onboarding` if empty, else `/`
3. `AuthSync.tsx` runs `onIdTokenChanged` → writes ID token to `__session` cookie (max-age 604800)
4. `AuthGuard` component (in layout) handles client-side auth gating — no middleware file
5. API routes verify identity: `adminAuth.verifyIdToken(req.headers.get('Authorization')?.slice(7))`

## Firestore Structure

```
users/{uid}/
  identities/{identityId}
    name, description, target_vision, color, icon, order, user_id, created_at

  habits/{habitId}
    name, color, user_id, archived, created_at, identity_id?

  habit_logs/{habitId}_{date}           ← compound ID = upsert
    habit_id, user_id, log_date

  bad_habits/{badHabitId}
    name, unit, user_id, baseline_frequency, baseline_intensity,
    goal_frequency, goal_intensity, created_at

  bad_habit_logs/{badHabitId}_{date}    ← compound ID = upsert
    bad_habit_id, user_id, log_date, did_it, quantity?, notes?

  tasks/{taskId}
    title, description?, user_id, scheduled_date?,
    completed, completed_at?, created_at

  push_subscription/default
    subscription (VAPID JSON), reminder_time, updated_at
```

Security: `firestore.rules` — `users/{uid}/**` readable/writable only when `request.auth.uid == uid`.

## Required Environment Variables

```env
# Firebase client SDK (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-side only — never NEXT_PUBLIC_)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=      # full PEM string with literal \n — from service account JSON

# Push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:your@email.com

# Cron endpoint auth
CRON_SECRET=
```

## Firebase Console Setup Checklist

- [ ] Authentication → Sign-in methods: enable **Email/Password** + **Google**
- [ ] Authentication → Settings → **Authorized domains**: add Vercel deployment URL
- [ ] Firestore Database → Rules: run `firebase deploy --only firestore:rules`
- [ ] Project Settings → **Service Accounts** → Generate new private key → copy `FIREBASE_*` vars
- [ ] Project Settings → General → **Your apps** (web) → copy `NEXT_PUBLIC_FIREBASE_*` vars

## Key Implementation Rules

**Identity system**
- Users must have ≥1 identity to use the app — enforced by onboarding gate in auth flow.
- Habits carry optional `identity_id` — null means untagged.
- Identity `order` field controls display order; `reorderIdentities` updates all docs in parallel.
- Icon stored as lucide icon name string (e.g. `"Dumbbell"`). Preset list in `app/onboarding/page.tsx`.

**Bad habits = harm reduction, not cold turkey**
- `did_it = false` = good (skipped). No streaks, no resets.
- Progress = downward trend in frequency + intensity over 12 weeks.
- `badHabitsScore` = % logs where `did_it = false`.

**Task carry-over**
- Tasks with `scheduled_date < today` and `completed = false` appear with "carried over" badge.
- No auto-mutation — visual only.

**Streak calc**
- Computed client-side from `habit_logs` — consecutive days ending today.

**Upsert in Firestore**
- Use `setDoc` with deterministic compound doc ID `${entityId}_${date}` — overwrites same doc.

**Weekly score**
- `(habitsScore × 0.4) + (tasksScore × 0.4) + (badHabitsScore × 0.2)` — last 7 days window.

**Firebase clients**
- Browser hooks: `import { auth, db } from '@/lib/firebase/client'` — use `auth.currentUser` (sync)
- API routes: `import { adminAuth, adminDb } from '@/lib/firebase/admin'`

**Push notifications**
- Client sends `Authorization: Bearer <idToken>` with every push API call.
- Cron send endpoint requires `Authorization: Bearer <CRON_SECRET>`.

**Navigation**
- Desktop: Navbar (`hidden md:flex`) — Home / Habits / Tasks / Quit / Stats / Settings
- Mobile: BottomNav (`md:hidden`) — 5 items, no Settings link

**Tailwind v4 dark mode**
- `dark:` prefix works because `<html className="dark">` is set in layout.tsx.
- No `tailwind.config.ts` — all config in CSS.
