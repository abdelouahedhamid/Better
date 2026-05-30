'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HabitsSection } from '@/components/dashboard/HabitsSection'
import { TasksTimeBlocks } from '@/components/dashboard/TasksTimeBlocks'
import { BadHabitsEODLog } from '@/components/dashboard/BadHabitsEODLog'
import { DailyScore } from '@/components/dashboard/DailyScore'
import { useIdentities } from '@/hooks/useIdentities'
import { cn } from '@/lib/utils'
import {
  Dumbbell, Brain, Briefcase, Heart, BookOpen,
  Music, Zap, Leaf, Code2, Globe, Star, Coffee, Wind,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell, Brain, Briefcase, Heart, BookOpen,
  Music, Zap, Leaf, Code2, Globe, Star, Coffee,
}

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { identities } = useIdentities()
  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null)

  useEffect(() => {
    if (identities.length > 0 && selectedIdentityId === null) {
      setSelectedIdentityId(identities[0].id)
    }
  }, [identities, selectedIdentityId])

  const selectedIdentity = identities.find(i => i.id === selectedIdentityId) ?? null
  const hour = new Date().getHours()

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5">
          {getGreeting(hour)}{selectedIdentity ? `, ${selectedIdentity.name}` : ''}
        </h1>
      </div>

      {identities.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {identities.map(identity => {
            const Icon = ICON_MAP[identity.icon] ?? Star
            const isSelected = selectedIdentityId === identity.id
            return (
              <button
                key={identity.id}
                onClick={() => setSelectedIdentityId(identity.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                  'border whitespace-nowrap transition-all flex-shrink-0',
                  isSelected
                    ? 'text-white border-transparent'
                    : 'border-border/40 text-muted-foreground hover:text-foreground bg-card'
                )}
                style={isSelected ? { backgroundColor: identity.color, borderColor: identity.color } : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {identity.name}
              </button>
            )
          })}
        </div>
      )}

      {hour >= 5 && hour < 12 && (
        <div className="grid grid-cols-2 gap-3">
          <Link href="/meditate" className="rounded-xl border border-border/40 bg-card px-4 py-4 flex items-center gap-3 hover:bg-accent transition-colors">
            <Brain className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Meditate</p>
              <p className="text-xs text-muted-foreground">Start your day</p>
            </div>
          </Link>
          <Link href="/journal/new" className="rounded-xl border border-border/40 bg-card px-4 py-4 flex items-center gap-3 hover:bg-accent transition-colors">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Journal</p>
              <p className="text-xs text-muted-foreground">Morning entry</p>
            </div>
          </Link>
        </div>
      )}

      <DailyScore />
      <HabitsSection identityId={selectedIdentityId} />
      <TasksTimeBlocks />

      {hour >= 18 && hour < 24 && (
        <Link href="/breathe" className="rounded-xl border border-border/40 bg-card px-4 py-4 flex items-center gap-3 hover:bg-accent transition-colors">
          <Wind className="h-5 w-5 text-[#3b82f6] shrink-0" />
          <div>
            <p className="text-sm font-medium">Wind down</p>
            <p className="text-xs text-muted-foreground">Evening breathing exercise</p>
          </div>
        </Link>
      )}

      <BadHabitsEODLog />
    </div>
  )
}
