'use client'

import { useBadHabits } from '@/hooks/useBadHabits'
import { BadHabitCard } from '@/components/bad-habits/BadHabitCard'
import { AddBadHabitDialog } from '@/components/bad-habits/AddBadHabitDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function BadHabitsPage() {
  const { badHabits, loading, addBadHabit, logToday, getTodayLog, getWeeklyStats } = useBadHabits()

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bad Habits</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Reduce, don't quit cold turkey. Progress = trend down.</p>
        </div>
        <AddBadHabitDialog onAdd={addBadHabit}>
          <Button size="sm">+ Track habit</Button>
        </AddBadHabitDialog>
      </div>

      {badHabits.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">
          <p className="text-3xl mb-3">🚬</p>
          <p>No bad habits tracked yet.</p>
          <p className="text-xs mt-1 mb-4">Add one and set a baseline + goal to track your progress.</p>
          <AddBadHabitDialog onAdd={addBadHabit}>
            <Button variant="outline" size="sm">Track a bad habit →</Button>
          </AddBadHabitDialog>
        </div>
      ) : (
        <div className="space-y-3">
          {badHabits.map(habit => (
            <BadHabitCard
              key={habit.id}
              habit={habit}
              todayLog={getTodayLog(habit.id)}
              weeklyStats={getWeeklyStats(habit.id)}
              onLog={(didIt, qty, notes) => logToday(habit.id, didIt, qty, notes)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
