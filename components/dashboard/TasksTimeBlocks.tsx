'use client'

import Link from 'next/link'
import { useTasks } from '@/hooks/useTasks'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

function TaskRow({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const isCarried = task.scheduled_date && task.scheduled_date < new Date().toISOString().split('T')[0]

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-all',
      task.completed ? 'border-border/40 bg-secondary/20 opacity-60' : 'border-border/40 bg-card'
    )}>
      <button
        onClick={onComplete}
        className={cn(
          'h-4 w-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all',
          task.completed
            ? 'bg-primary border-primary'
            : 'border-muted-foreground/40 hover:border-muted-foreground'
        )}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className={cn('text-sm font-medium truncate', task.completed && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        {isCarried && !task.completed && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-amber-500 border-amber-500/30 shrink-0">carried over</Badge>
        )}
      </div>
    </div>
  )
}

export function TasksTimeBlocks() {
  const { todayTasks, carriedOverTasks, loading, completeTask } = useTasks()

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Tasks</h2>
        </div>
        <div className="space-y-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      </section>
    )
  }

  const allTasks = [...todayTasks, ...carriedOverTasks.filter(t => !todayTasks.includes(t))]

  if (!allTasks.length) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Tasks</h2>
          <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manage</Link>
        </div>
        <p className="text-sm text-muted-foreground py-4 text-center">No tasks today. <Link href="/tasks" className="underline">Schedule one →</Link></p>
      </section>
    )
  }

  const doneCount = allTasks.filter(t => t.completed).length

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Tasks <span className="text-foreground font-bold">{doneCount}/{allTasks.length}</span>
        </h2>
        <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manage</Link>
      </div>
      <div className="space-y-2">
        {allTasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={() => completeTask(task.id, !task.completed)}
          />
        ))}
      </div>
    </section>
  )
}
