'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { today } from '@/lib/utils'
import type { Project } from '@/types'

interface Props {
  projects: Project[]
  onAdd: (task: {
    title: string
    project_id?: string
    scheduled_date?: string
    time_start?: string
    time_end?: string
    description?: string
  }) => void
  children: React.ReactNode
}

export function AddTaskDialog({ projects, onAdd, children }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [date, setDate] = useState(today())
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit() {
    if (!title.trim()) return
    onAdd({
      title: title.trim(),
      project_id: projectId || undefined,
      scheduled_date: date || undefined,
      time_start: timeStart || undefined,
      time_end: timeEnd || undefined,
      description: description.trim() || undefined,
    })
    setTitle('')
    setProjectId('')
    setDate(today())
    setTimeStart('')
    setTimeEnd('')
    setDescription('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          {projects.length > 0 && (
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="task-date">Date</Label>
            <Input
              id="task-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-start">Start time</Label>
              <Input
                id="task-start"
                type="time"
                value={timeStart}
                onChange={e => setTimeStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-end">End time</Label>
              <Input
                id="task-end"
                type="time"
                value={timeEnd}
                onChange={e => setTimeEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Notes <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Additional notes..."
              className="h-20 resize-none"
            />
          </div>

          <Button onClick={handleSubmit} disabled={!title.trim()} className="w-full">
            Add Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
