'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { ReductionChart } from '@/components/bad-habits/ReductionChart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

function HeatmapCell({ rate, date }: { rate: number; date: string }) {
  const bg =
    rate === 0 ? 'bg-secondary/40' :
    rate < 0.4 ? 'bg-indigo-900/60' :
    rate < 0.7 ? 'bg-indigo-600/70' :
    rate < 1 ? 'bg-indigo-500' :
    'bg-indigo-400'

  return (
    <div
      className={cn('h-3 w-3 rounded-sm', bg)}
      title={`${date}: ${Math.round(rate * 100)}%`}
    />
  )
}

export default function AnalyticsPage() {
  const { heatmap, taskCompletion, badHabits, badHabitStats, weeklyScore, loading } = useAnalytics()

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const scoreColor = weeklyScore >= 80 ? 'text-emerald-400' : weeklyScore >= 50 ? 'text-amber-400' : 'text-red-400'
  const scoreLabel = weeklyScore >= 80 ? 'Great week' : weeklyScore >= 50 ? 'Decent week' : 'Room to grow'

  const taskBarData = taskCompletion.map(w => ({
    week: w.week.slice(5),
    completed: w.completed,
    missed: w.total - w.completed,
    rate: Math.round(w.rate * 100),
  }))

  // Build 12-week × 7-day grid from heatmap (last 84 days)
  const weeks: Array<typeof heatmap> = []
  for (let i = 0; i < 12; i++) {
    weeks.push(heatmap.slice(i * 7, i * 7 + 7))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>

      {/* Weekly Score */}
      <div className="rounded-xl border border-border/40 bg-card p-5 flex items-center gap-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">7-day score</p>
          <p className={cn('text-5xl font-bold tabular-nums', scoreColor)}>{weeklyScore}</p>
          <p className="text-xs text-muted-foreground mt-1">{scoreLabel}</p>
        </div>
        <div className="flex-1 text-xs text-muted-foreground space-y-1">
          <p>Habits <span className="text-muted-foreground/60">× 40%</span></p>
          <p>Tasks <span className="text-muted-foreground/60">× 40%</span></p>
          <p>Bad habits <span className="text-muted-foreground/60">× 20%</span></p>
        </div>
      </div>

      {/* Habit Heatmap */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Habit completion — 12 weeks</p>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          {heatmap.length === 0 || heatmap[0].total === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No habits tracked yet.</p>
          ) : (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => (
                    <HeatmapCell key={di} rate={day.rate} date={day.date} />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map(r => <HeatmapCell key={r} rate={r} date="" />)}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </div>

      {/* Task Completion Rate */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Task completion — 12 weeks</p>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          {taskCompletion.every(w => w.total === 0) ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No tasks scheduled yet.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskBarData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    formatter={(val, name) => [val, name === 'completed' ? 'Done' : 'Missed']}
                  />
                  <Bar dataKey="completed" stackId="a" fill="#6366f1" radius={[0, 0, 2, 2]} />
                  <Bar dataKey="missed" stackId="a" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bad Habit Reduction Charts */}
      {badHabits.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold">Bad habit trends — 12 weeks</p>
          {badHabits.map(habit => (
            <div key={habit.id} className="rounded-xl border border-border/40 bg-card p-4">
              <p className="text-sm font-medium mb-3">{habit.name}</p>
              <ReductionChart
                data={badHabitStats[habit.id] ?? []}
                unit={habit.unit}
                goalFrequency={habit.goal_frequency ?? undefined}
                goalIntensity={habit.goal_intensity ?? undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
