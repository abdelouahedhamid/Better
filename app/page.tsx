'use client'

import { HabitsSection } from '@/components/dashboard/HabitsSection'
import { TasksTimeBlocks } from '@/components/dashboard/TasksTimeBlocks'
import { BadHabitsEODLog } from '@/components/dashboard/BadHabitsEODLog'
import { DailyScore } from '@/components/dashboard/DailyScore'

export default function Dashboard() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <DailyScore />
      <HabitsSection />
      <TasksTimeBlocks />
      <BadHabitsEODLog />
    </div>
  )
}
