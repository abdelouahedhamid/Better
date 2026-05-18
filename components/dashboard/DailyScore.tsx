'use client'

import { useHabits } from '@/hooks/useHabits'
import { useTasks } from '@/hooks/useTasks'
import { useBadHabits } from '@/hooks/useBadHabits'
import { cn } from '@/lib/utils'

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function DailyScore() {
  const { habits, isCompletedToday } = useHabits()
  const { tasks, todayTasks, carriedOverTasks } = useTasks()
  const { badHabits, loggedToday, getTodayLog } = useBadHabits()

  const habitsScore = habits.length
    ? (habits.filter(h => isCompletedToday(h.id)).length / habits.length) * 100
    : 0

  const allTasksToday = [...todayTasks, ...carriedOverTasks]
  const tasksScore = allTasksToday.length
    ? (allTasksToday.filter(t => t.completed).length / allTasksToday.length) * 100
    : 0

  const loggedBadHabits = badHabits.filter(h => loggedToday(h.id))
  const badHabitsScore = badHabits.length
    ? loggedBadHabits.reduce((sum, h) => {
        const log = getTodayLog(h.id)
        return sum + (log?.did_it ? 0 : 100)
      }, 0) / badHabits.length
    : 0

  const total = (habitsScore * 0.4) + (tasksScore * 0.4) + (badHabitsScore * 0.2)

  const scoreColor = total >= 80 ? '#22c55e' : total >= 50 ? '#f59e0b' : '#ef4444'

  const scoreLabel = total >= 80 ? 'Great day' : total >= 50 ? 'On track' : total >= 20 ? 'Getting started' : 'Keep going'

  return (
    <section className="p-4 rounded-2xl border border-border/40 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Daily Score</p>
          <p className="text-sm text-muted-foreground mt-0.5">{scoreLabel}</p>
        </div>
        <div
          className={cn(
            'text-3xl font-bold tabular-nums leading-none'
          )}
          style={{ color: scoreColor }}
        >
          {Math.round(total)}
        </div>
      </div>

      <div className="space-y-2.5">
        <ScoreBar label="Habits" value={habitsScore} color="#6366f1" />
        <ScoreBar label="Tasks" value={tasksScore} color="#06b6d4" />
        <ScoreBar label="Bad habits" value={badHabitsScore} color="#22c55e" />
      </div>
    </section>
  )
}
