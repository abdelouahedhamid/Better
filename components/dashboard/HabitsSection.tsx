'use client'

import Link from 'next/link'
import { useHabits } from '@/hooks/useHabits'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface HabitsSectionProps {
  identityId: string | null
}

export function HabitsSection({ identityId }: HabitsSectionProps) {
  const { habits, loading, isCompletedToday, toggleHabit } = useHabits()
  const visibleHabits = identityId ? habits.filter(h => h.identity_id === identityId) : habits

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Habits</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      </section>
    )
  }

  if (!visibleHabits.length) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Habits</h2>
          <Link href="/habits" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manage</Link>
        </div>
        <p className="text-sm text-muted-foreground py-4 text-center">No habits yet. <Link href="/habits" className="underline">Add one →</Link></p>
      </section>
    )
  }

  const doneCount = visibleHabits.filter(h => isCompletedToday(h.id)).length

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Habits <span className="text-foreground font-bold">{doneCount}/{visibleHabits.length}</span>
        </h2>
        <Link href="/habits" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manage</Link>
      </div>
      <div className="space-y-2">
        {visibleHabits.map(habit => {
          const done = isCompletedToday(habit.id)
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                done ? 'border-border/60 bg-secondary/30' : 'border-border/40 bg-card hover:bg-card/80'
              )}
            >
              <span
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                  done ? 'border-transparent text-white' : 'border-muted-foreground/40'
                )}
                style={done ? { backgroundColor: habit.color } : undefined}
              >
                {done && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>{habit.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
