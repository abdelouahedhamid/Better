'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Task, Project } from '@/types'

function formatTime(t: string): string {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  return `${hour % 12 || 12}:${m}${ampm}`
}

interface Props {
  task: Task
  project?: Project
  isCarried?: boolean
  onComplete: () => void
  onDelete: () => void
}

export function TimeBlockCard({ task, project, isCarried, onComplete, onDelete }: Props) {
  const accentColor = project?.color ?? '#6366f1'

  return (
    <div className={cn(
      'group flex gap-3 p-3 rounded-xl border transition-all',
      task.completed ? 'border-border/30 bg-secondary/20 opacity-60' : 'border-border/40 bg-card'
    )}>
      {task.time_start && (
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <span className="text-xs font-medium text-muted-foreground tabular-nums leading-none">{formatTime(task.time_start)}</span>
          <div className="flex-1 w-px min-h-[8px]" style={{ backgroundColor: accentColor + '60' }} />
          {task.time_end && (
            <span className="text-xs text-muted-foreground tabular-nums leading-none">{formatTime(task.time_end)}</span>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <button
            onClick={onComplete}
            className={cn(
              'mt-0.5 h-4 w-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all',
              task.completed ? 'border-transparent' : 'border-muted-foreground/40 hover:border-muted-foreground'
            )}
            style={task.completed ? { backgroundColor: accentColor } : undefined}
          >
            {task.completed && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>{task.title}</p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {project && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                  {project.name}
                </span>
              )}
              {isCarried && !task.completed && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-amber-500 border-amber-500/30">carried over</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-7 w-7 p-0 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity self-start"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </Button>
    </div>
  )
}
