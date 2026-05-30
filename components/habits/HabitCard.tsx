'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Habit } from '@/types'

interface Props {
  habit: Habit
  completed: boolean
  weeklyRate: { count: number; total: number }
  monthlyRate: { count: number; total: number }
  onToggle: () => void
  onArchive: () => void
}

export function HabitCard({ habit, completed, weeklyRate, monthlyRate, onToggle, onArchive }: Props) {
  return (
    <div className={cn(
      'group flex items-center gap-3 p-4 rounded-xl border transition-all',
      completed
        ? 'border-border/60 bg-secondary/30'
        : 'border-border/40 bg-card hover:bg-card/80'
    )}>
      <button
        onClick={onToggle}
        className={cn(
          'h-6 w-6 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center',
          completed
            ? 'border-transparent text-white'
            : 'border-muted-foreground/40 hover:border-muted-foreground'
        )}
        style={completed ? { backgroundColor: habit.color } : undefined}
      >
        {completed && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm truncate transition-colors',
          completed && 'text-muted-foreground line-through'
        )}>
          {habit.name}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-xs font-mono text-muted-foreground">
          <span className={cn(weeklyRate.count === weeklyRate.total && 'text-foreground font-semibold')}>
            {weeklyRate.count}
          </span>
          <span className="text-muted-foreground/40">/7</span>
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          <span>{monthlyRate.count}</span>
          <span className="text-muted-foreground/40">/30</span>
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onArchive}
        className="h-7 w-7 p-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        title="Archive habit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </Button>
    </div>
  )
}
