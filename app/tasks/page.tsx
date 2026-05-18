'use client'

import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { TimeBlockCard } from '@/components/tasks/TimeBlockCard'
import { ProjectSidebar } from '@/components/tasks/ProjectSidebar'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { today } from '@/lib/utils'

export default function TasksPage() {
  const { tasks, projects, loading, selectedDate, setSelectedDate, addTask, completeTask, deleteTask, addProject } = useTasks()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const getProject = (projectId?: string) => projects.find(p => p.id === projectId)

  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

  const timed = filteredTasks.filter(t => t.time_start).sort((a, b) => (a.time_start ?? '').localeCompare(b.time_start ?? ''))
  const untimed = filteredTasks.filter(t => !t.time_start)
  const carried = untimed.filter(t => t.scheduled_date && t.scheduled_date < selectedDate && !t.completed)
  const todayUntimed = untimed.filter(t => !carried.includes(t))

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <AddTaskDialog projects={projects} onAdd={addTask}>
          <Button size="sm">+ Add Task</Button>
        </AddTaskDialog>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-44 shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projects</p>
          <ProjectSidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={setSelectedProjectId}
            onAdd={addProject}
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center gap-2">
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

          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <p>No tasks for this day.</p>
              <AddTaskDialog projects={projects} onAdd={addTask}>
                <Button variant="link" size="sm" className="mt-2">Add a task →</Button>
              </AddTaskDialog>
            </div>
          ) : (
            <div className="space-y-6">
              {timed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheduled</p>
                  {timed.map(task => (
                    <TimeBlockCard
                      key={task.id}
                      task={task}
                      project={getProject(task.project_id)}
                      isCarried={!!task.scheduled_date && task.scheduled_date < selectedDate}
                      onComplete={() => completeTask(task.id, !task.completed)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </div>
              )}

              {carried.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carried Over</p>
                  {carried.map(task => (
                    <TimeBlockCard
                      key={task.id}
                      task={task}
                      project={getProject(task.project_id)}
                      isCarried
                      onComplete={() => completeTask(task.id, !task.completed)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </div>
              )}

              {todayUntimed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unscheduled</p>
                  {todayUntimed.map(task => (
                    <TimeBlockCard
                      key={task.id}
                      task={task}
                      project={getProject(task.project_id)}
                      onComplete={() => completeTask(task.id, !task.completed)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="md:hidden pt-4 border-t border-border/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projects</p>
            <ProjectSidebar
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelect={setSelectedProjectId}
              onAdd={addProject}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
