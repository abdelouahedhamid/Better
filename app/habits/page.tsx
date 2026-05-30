'use client'

import { useHabits } from '@/hooks/useHabits'
import { HabitCard } from '@/components/habits/HabitCard'
import { AddHabitDialog } from '@/components/habits/AddHabitDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function HabitsPage() {
  const { habits, loading, toggleHabit, addHabit, archiveHabit, isCompletedToday, getWeeklyRate, getMonthlyRate } = useHabits()

  const completedCount = habits.filter(h => isCompletedToday(h.id)).length

  return (
    <div className="container mx-auto max-w-xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          {!loading && habits.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedCount}/{habits.length} done today
            </p>
          )}
        </div>
        <AddHabitDialog onAdd={addHabit}>
          <Button size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1.5">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Habit
          </Button>
        </AddHabitDialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[60px] rounded-xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">✨</p>
          <p className="font-medium">No habits yet</p>
          <p className="text-sm text-muted-foreground">Add your first habit to start building momentum.</p>
          <AddHabitDialog onAdd={addHabit}>
            <Button variant="outline" className="mt-2">Add your first habit</Button>
          </AddHabitDialog>
        </div>
      ) : (
        <div className="group space-y-2">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completed={isCompletedToday(habit.id)}
              weeklyRate={getWeeklyRate(habit.id)}
              monthlyRate={getMonthlyRate(habit.id)}
              onToggle={() => toggleHabit(habit.id)}
              onArchive={() => archiveHabit(habit.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
