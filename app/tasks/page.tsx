'use client'

import { useTasks } from '@/hooks/useTasks'
import { TimeBlockCard } from '@/components/tasks/TimeBlockCard'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { today } from '@/lib/utils'

export default function TasksPage() {
  const { tasks, loading, selectedDate, setSelectedDate, addTask, completeTask, deleteTask } = useTasks()

  const todayTasks = tasks.filter(t => t.scheduled_date === selectedDate)
  const carried = tasks.filter(t => t.scheduled_date && t.scheduled_date < selectedDate && !t.completed)

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <AddTaskDialog onAdd={addTask}>
          <Button size="sm">+ Add Task</Button>
        </AddTaskDialog>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="h-9 w-40 text-sm"
        />
        {selectedDate !== today() && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(today())} className="h-9 text-xs">
            Today
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {carried.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carried Over</p>
            {carried.map(task => (
              <TimeBlockCard
                key={task.id}
                task={task}
                isCarried
                onComplete={() => completeTask(task.id, !task.completed)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today</p>
          {todayTasks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <p>No tasks for this day.</p>
              <AddTaskDialog onAdd={addTask}>
                <Button variant="link" size="sm" className="mt-2">Add a task →</Button>
              </AddTaskDialog>
            </div>
          ) : (
            todayTasks.map(task => (
              <TimeBlockCard
                key={task.id}
                task={task}
                onComplete={() => completeTask(task.id, !task.completed)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
