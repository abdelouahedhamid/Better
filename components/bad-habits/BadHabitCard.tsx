'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ReductionChart } from './ReductionChart'
import { cn } from '@/lib/utils'
import type { BadHabit, BadHabitLog, WeeklyStats } from '@/types'

interface Props {
  habit: BadHabit
  todayLog: BadHabitLog | undefined
  weeklyStats: WeeklyStats[]
  onLog: (didIt: boolean, quantity?: number, notes?: string) => Promise<void>
}

export function BadHabitCard({ habit, todayLog, weeklyStats, onLog }: Props) {
  const [logOpen, setLogOpen] = useState(false)
  const [chartOpen, setChartOpen] = useState(false)
  const [didIt, setDidIt] = useState<boolean | null>(null)
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const thisWeek = weeklyStats[weeklyStats.length - 1]
  const lastWeek = weeklyStats[weeklyStats.length - 2]

  function openLog() {
    if (todayLog) {
      setDidIt(todayLog.did_it)
      setQuantity(todayLog.quantity?.toString() ?? '')
      setNotes(todayLog.notes ?? '')
    } else {
      setDidIt(null)
      setQuantity('')
      setNotes('')
    }
    setLogOpen(true)
  }

  async function handleSave() {
    if (didIt === null) return
    setSaving(true)
    await onLog(didIt, didIt && quantity ? parseFloat(quantity) : undefined, notes.trim() || undefined)
    setSaving(false)
    setLogOpen(false)
  }

  const logged = !!todayLog
  const skipped = logged && !todayLog.did_it

  return (
    <>
      <Card className="border-border/40 bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{habit.name}</p>
                {logged && (
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0 h-4', skipped
                      ? 'text-emerald-400 border-emerald-400/30'
                      : 'text-amber-400 border-amber-400/30'
                    )}
                  >
                    {skipped ? 'skipped today' : `${todayLog.quantity ?? '?'} ${habit.unit} today`}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {habit.goal_frequency !== undefined && (
                  <span>
                    Goal: <span className="text-foreground font-medium">{habit.goal_frequency}d/wk</span>
                    {thisWeek && (
                      <span className={cn('ml-1', thisWeek.frequency <= habit.goal_frequency! ? 'text-emerald-400' : 'text-amber-400')}>
                        ({thisWeek.frequency} this wk)
                      </span>
                    )}
                  </span>
                )}
                {habit.goal_intensity !== undefined && (
                  <span>
                    <span className="text-foreground font-medium">{habit.goal_intensity} {habit.unit}</span>/session
                    {thisWeek && thisWeek.avgIntensity > 0 && (
                      <span className={cn('ml-1', thisWeek.avgIntensity <= habit.goal_intensity! ? 'text-emerald-400' : 'text-amber-400')}>
                        ({thisWeek.avgIntensity} avg)
                      </span>
                    )}
                  </span>
                )}
              </div>

              {lastWeek && thisWeek && (thisWeek.frequency < lastWeek.frequency) && (
                <p className="text-[10px] text-emerald-400 mt-1">↓ fewer days than last week</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setChartOpen(true)}
              >
                Chart
              </Button>
              <Button
                size="sm"
                className="h-7 px-3 text-xs"
                variant={logged ? 'outline' : 'default'}
                onClick={openLog}
              >
                {logged ? 'Edit log' : 'Log today'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log — {habit.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDidIt(false)}
                className={cn(
                  'p-3 rounded-xl border text-sm font-medium transition-all',
                  didIt === false
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-border/40 text-muted-foreground hover:border-border'
                )}
              >
                Skipped it
              </button>
              <button
                onClick={() => setDidIt(true)}
                className={cn(
                  'p-3 rounded-xl border text-sm font-medium transition-all',
                  didIt === true
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-border/40 text-muted-foreground hover:border-border'
                )}
              >
                Did it
              </button>
            </div>

            {didIt === true && (
              <div className="space-y-1.5">
                <Label>{habit.unit} consumed</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder={`How many ${habit.unit}?`}
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Context, triggers, how you felt..."
                className="h-16 resize-none"
              />
            </div>

            <Button onClick={handleSave} disabled={didIt === null || saving} className="w-full">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{habit.name} — 12-week trend</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <ReductionChart
              data={weeklyStats}
              unit={habit.unit}
              goalFrequency={habit.goal_frequency ?? undefined}
              goalIntensity={habit.goal_intensity ?? undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
