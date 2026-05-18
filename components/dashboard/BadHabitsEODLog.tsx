'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBadHabits } from '@/hooks/useBadHabits'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { BadHabit } from '@/types'

function EODRow({ habit, onLog }: { habit: BadHabit; onLog: (didIt: boolean, qty?: number) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [qty, setQty] = useState('')

  return (
    <div className="p-3 rounded-xl border border-border/40 bg-card space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium flex-1 truncate">{habit.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2.5 text-green-400 border-green-400/30 hover:bg-green-400/10"
            onClick={() => onLog(false)}
          >
            Skipped
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2.5 text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
            onClick={() => setExpanded(e => !e)}
          >
            Did it
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="number"
            min="0"
            placeholder={`How many ${habit.unit}?`}
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            className="h-8 shrink-0"
            onClick={() => {
              onLog(true, qty ? parseFloat(qty) : undefined)
              setExpanded(false)
              setQty('')
            }}
          >
            Log
          </Button>
        </div>
      )}
    </div>
  )
}

function LoggedRow({ habit, didIt, qty, unit }: { habit: BadHabit; didIt: boolean; qty?: number; unit: string }) {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-xl border text-sm',
      didIt ? 'border-amber-500/20 bg-amber-500/5' : 'border-green-500/20 bg-green-500/5'
    )}>
      <span className="font-medium">{habit.name}</span>
      <span className={cn('text-xs font-medium', didIt ? 'text-amber-400' : 'text-green-400')}>
        {didIt ? (qty != null ? `${qty} ${unit}` : 'Did it') : 'Skipped ✓'}
      </span>
    </div>
  )
}

export function BadHabitsEODLog() {
  const { badHabits, loading, logToday, getTodayLog, loggedToday } = useBadHabits()

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">End of Day Log</h2>
        </div>
        <div className="space-y-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      </section>
    )
  }

  if (!badHabits.length) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">End of Day Log</h2>
          <Link href="/bad-habits" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manage</Link>
        </div>
        <p className="text-sm text-muted-foreground py-4 text-center">No bad habits tracked. <Link href="/bad-habits" className="underline">Add one →</Link></p>
      </section>
    )
  }

  const loggedCount = badHabits.filter(h => loggedToday(h.id)).length

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          End of Day Log <span className="text-foreground font-bold">{loggedCount}/{badHabits.length}</span>
        </h2>
        <Link href="/bad-habits" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manage</Link>
      </div>
      <div className="space-y-2">
        {badHabits.map(habit => {
          const log = getTodayLog(habit.id)
          if (log) {
            return <LoggedRow key={habit.id} habit={habit} didIt={log.did_it} qty={log.quantity} unit={habit.unit} />
          }
          return (
            <EODRow
              key={habit.id}
              habit={habit}
              onLog={(didIt, qty) => logToday(habit.id, didIt, qty)}
            />
          )
        })}
      </div>
    </section>
  )
}
