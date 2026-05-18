@AGENTS.md

# CLAUDE.md — Better App

Self-improvement web app: build good habits, reduce bad habits (harm-reduction model), manage time-blocked tasks.

## Commands

```bash
npm run dev      # local dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint check
```

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ App Router + TypeScript |
| Styling | Tailwind CSS v4 (CSS-based config, no tailwind.config.ts) |
| UI | shadcn/ui v4.7.0, New York style, zinc base color |
| Backend | Supabase — Auth + PostgreSQL + SSR cookies (`@supabase/ssr`) |
| Charts | Recharts (LineChart, BarChart, ResponsiveContainer) |
| Push | Web Push API + VAPID + `web-push` npm package (NOT Firebase) |
| Hosting | Vercel |

Dark mode: always-on via `<html className="dark">`. Tailwind v4 uses `@custom-variant dark` in globals.css, not a config file.

## Project Structure

```
app/
  layout.tsx                  Root layout — AuthGuard, Navbar, BottomNav
  page.tsx                    Dashboard (HabitsSection, TasksTimeBlocks, BadHabitsEODLog, DailyScore)
  auth/page.tsx               Login / signup (email+password + Google OAuth)
  habits/page.tsx             Manage good habits
  bad-habits/page.tsx         Harm-reduction bad habit tracking
  tasks/page.tsx              Projects + time-blocked tasks
  analytics/page.tsx          Heatmap, charts, weekly score
  settings/page.tsx           Push notifications + account
  api/push/subscribe/route.ts Save VAPID subscription (POST=upsert, DELETE=remove)
  api/push/send/route.ts      Send push notification (Bearer CRON_SECRET auth)

components/
  layout/Navbar.tsx           Desktop top nav (hidden md:flex)
  layout/BottomNav.tsx        Mobile bottom nav (md:hidden) — 5 items: Home/Habits/Tasks/Quit/Stats
  dashboard/HabitsSection.tsx Today's habits checklist
  dashboard/TasksTimeBlocks.tsx Time-blocked tasks for today
  dashboard/BadHabitsEODLog.tsx End-of-day bad habit log
  dashboard/DailyScore.tsx    Composite score widget
  habits/HabitCard.tsx        Check-in toggle + streak badge
  habits/AddHabitDialog.tsx   Add new habit dialog
  bad-habits/BadHabitCard.tsx Frequency/intensity stats + EOD log dialog + chart dialog
  bad-habits/AddBadHabitDialog.tsx Add bad habit with baseline/goal fields
  bad-habits/ReductionChart.tsx Dual-axis LineChart (frequency left, intensity right)
  tasks/TimeBlockCard.tsx     Time range + project color + complete toggle
  tasks/ProjectSidebar.tsx    Project list + add project
  tasks/AddTaskDialog.tsx     Add task with date + time block

hooks/
  useHabits.ts      fetch, toggle, add, archive — streak computed client-side
  useBadHabits.ts   fetch, logToday (upsert), getTodayLog, getWeeklyStats
  useTasks.ts       fetch by date, add, complete, carry-over logic
  useAnalytics.ts   heatmap (84d), taskCompletion (12w), badHabitStats, weeklyScore

lib/
  supabase/client.ts    createBrowserClient (browser components)
  supabase/server.ts    createServerClient (server components/routes)
  utils.ts              cn(), formatDate, today(), getISOWeek, getLast12Weeks, getLast84Days

types/index.ts    Habit, HabitLog, BadHabit, BadHabitLog, Project, Task, WeeklyStats, DailyScore

middleware.ts     Supabase auth session refresh + redirect unauthenticated → /auth
public/
  manifest.json   PWA manifest (name: Better, background: #09090b)
  sw.js           Service worker — push event + notificationclick handler
```

## Database Schema

```sql
-- All tables have RLS: user_id = auth.uid()

habits(id UUID PK, user_id, name, color TEXT DEFAULT '#6366f1', icon TEXT, archived BOOL, created_at)
habit_logs(id UUID PK, habit_id → habits, user_id, log_date DATE, UNIQUE(habit_id, log_date))

bad_habits(id UUID PK, user_id, name, unit TEXT DEFAULT 'times',
  baseline_frequency INT, baseline_intensity NUMERIC,
  goal_frequency INT, goal_intensity NUMERIC, created_at)
bad_habit_logs(id UUID PK, bad_habit_id → bad_habits, user_id, log_date DATE,
  did_it BOOL, quantity NUMERIC, notes TEXT, UNIQUE(bad_habit_id, log_date))

projects(id UUID PK, user_id, name, color TEXT, archived BOOL, created_at)
tasks(id UUID PK, user_id, project_id → projects, title, description TEXT,
  scheduled_date DATE, time_start TIME, time_end TIME,
  completed BOOL, completed_at TIMESTAMPTZ, created_at)

push_subscriptions(id UUID PK, user_id UNIQUE, subscription JSONB, reminder_time TIME DEFAULT '08:00')
```

## Required Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-side only — NO NEXT_PUBLIC_ prefix

NEXT_PUBLIC_VAPID_PUBLIC_KEY=       # generate: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=                  # server-side only
VAPID_SUBJECT=mailto:your@email.com

CRON_SECRET=                        # random string, used to auth POST /api/push/send
```

## Key Implementation Rules

**Bad habits = harm reduction, not cold turkey**
- `did_it = false` in bad_habit_logs = good (skipped). No streaks, no resets.
- Progress = downward trend in frequency (days/week) + intensity (qty/session) over 12 weeks.
- Analytics badHabitsScore = % logs where `did_it = false`.

**Task carry-over**
- Tasks with `scheduled_date < today` and `completed = false` appear in today's view with "carried over" badge.
- No auto-mutation — just visual carry-over.

**Streak calc**
- Computed client-side from `habit_logs` ordered by date — consecutive days ending today.

**Weekly score formula**
- `(habitsScore × 0.4) + (tasksScore × 0.4) + (badHabitsScore × 0.2)`
- Each score = ratio 0–1, multiplied to get 0–100 total.

**Push notifications**
- Service worker at `public/sw.js` handles `push` event → shows notification.
- Subscribe flow in `settings/page.tsx`: permission → `pushManager.subscribe()` → `POST /api/push/subscribe`.
- Send endpoint `POST /api/push/send` requires `Authorization: Bearer <CRON_SECRET>` header.
- Body: `{ subscription, title, body, url }`.

**Supabase clients**
- Browser: `import { createClient } from '@/lib/supabase/client'`
- Server (route handlers, server components): `import { createClient } from '@/lib/supabase/server'`

**Navigation**
- Desktop: Navbar (hidden md:flex) — Home / Habits / Tasks / Quit / Stats / Settings
- Mobile: BottomNav (md:hidden) — 5 items with SVG icons, no Settings
- Settings accessible on mobile via direct URL `/settings` only (or add to BottomNav if needed)

**Tailwind v4 dark mode**
- Use `dark:` prefix normally in classnames — works because `<html className="dark">` is set in layout.tsx.
- No `tailwind.config.ts` exists — all config in CSS via `@import "tailwindcss"` and `@custom-variant dark`.

## Build Status

All 9 phases complete:
- Phase 1: Bootstrap (Next.js, shadcn, Supabase, Tailwind v4)
- Phase 2: Auth + Layout (middleware, login, Navbar, BottomNav)
- Phase 3: Good Habits (useHabits, HabitCard, AddHabitDialog, habits/page)
- Phase 4: Dashboard (HabitsSection, TasksTimeBlocks, BadHabitsEODLog, DailyScore)
- Phase 5: Tasks (useTasks, ProjectSidebar, TimeBlockCard, AddTaskDialog, tasks/page)
- Phase 6: Bad Habits (useBadHabits, BadHabitCard, ReductionChart, bad-habits/page)
- Phase 7: Analytics (useAnalytics, analytics/page with heatmap + charts)
- Phase 8: Push Notifications (subscribe/route, send/route, settings/page, sw.js)
- Phase 9: PWA Polish (manifest.json, sw.js, loading skeletons, empty states, Navbar+BottomNav)
