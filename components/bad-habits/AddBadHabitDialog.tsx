'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  onAdd: (habit: {
    name: string
    unit: string
    baseline_frequency?: number
    baseline_intensity?: number
    goal_frequency?: number
    goal_intensity?: number
  }) => void
  children: React.ReactNode
}

export function AddBadHabitDialog({ onAdd, children }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('times')
  const [baseFreq, setBaseFreq] = useState('')
  const [baseIntensity, setBaseIntensity] = useState('')
  const [goalFreq, setGoalFreq] = useState('')
  const [goalIntensity, setGoalIntensity] = useState('')

  function handleSubmit() {
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      unit: unit.trim() || 'times',
      baseline_frequency: baseFreq ? parseInt(baseFreq) : undefined,
      baseline_intensity: baseIntensity ? parseFloat(baseIntensity) : undefined,
      goal_frequency: goalFreq ? parseInt(goalFreq) : undefined,
      goal_intensity: goalIntensity ? parseFloat(goalIntensity) : undefined,
    })
    setName('')
    setUnit('times')
    setBaseFreq('')
    setBaseIntensity('')
    setGoalFreq('')
    setGoalIntensity('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Track a bad habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Habit name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Smoking, Social media, Alcohol" autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label>Unit <span className="text-muted-foreground">(what you count per session)</span></Label>
            <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="cigarettes, drinks, minutes..." />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Baseline (where you are now)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Days/week</Label>
                <Input type="number" min="0" max="7" value={baseFreq} onChange={e => setBaseFreq(e.target.value)} placeholder="e.g. 7" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{unit || 'times'}/session</Label>
                <Input type="number" min="0" step="0.1" value={baseIntensity} onChange={e => setBaseIntensity(e.target.value)} placeholder="e.g. 10" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Goal (where you want to be)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Days/week</Label>
                <Input type="number" min="0" max="7" value={goalFreq} onChange={e => setGoalFreq(e.target.value)} placeholder="e.g. 2" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{unit || 'times'}/session</Label>
                <Input type="number" min="0" step="0.1" value={goalIntensity} onChange={e => setGoalIntensity(e.target.value)} placeholder="e.g. 3" />
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!name.trim()} className="w-full">Add Habit</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
