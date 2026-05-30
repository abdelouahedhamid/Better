'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface Props {
  task: Task
  isCarried?: boolean
  onComplete: () => void
  onDelete: () => void
}

export function TimeBlockCard({ task, isCarried, onComplete, onDelete }: Props) {
  return (
    <div className={cn(
      'group flex items-center gap-3 p-3 rounded-xl border transition-all',
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
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-amber-500 border-amber-500/30 shrink-0">
            carried
          </Badge>
        )}
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all text-xs px-1"
      >
        ✕
      </button>
    </div>
  )
}
