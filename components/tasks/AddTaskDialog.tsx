'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { today } from '@/lib/utils'

interface Props {
  onAdd: (task: { title: string; scheduled_date?: string }) => void
  children: React.ReactNode
}

export function AddTaskDialog({ onAdd, children }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today())

  function handleSubmit() {
    if (!title.trim()) return
    onAdd({ title: title.trim(), scheduled_date: date || undefined })
    setTitle('')
    setDate(today())
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

          <div className="space-y-1.5">
            <Label htmlFor="task-date">Date</Label>
            <Input
              id="task-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
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
