'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { WeeklyStats } from '@/types'

interface Props {
  data: WeeklyStats[]
  unit: string
  goalFrequency?: number
  goalIntensity?: number
}

export function ReductionChart({ data, unit, goalFrequency, goalIntensity }: Props) {
  const formatted = data.map(d => ({
    week: d.week.slice(5),
    frequency: d.frequency,
    intensity: d.avgIntensity,
  }))

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="frequency"
            name="Days/week"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="intensity"
            name={`${unit}/session`}
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {goalFrequency !== undefined && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={() => goalFrequency}
              name="Goal days/week"
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="5 4"
              dot={false}
            />
          )}
          {goalIntensity !== undefined && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={() => goalIntensity}
              name={`Goal ${unit}/session`}
              stroke="#6366f1"
              strokeWidth={1}
              strokeDasharray="5 4"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
