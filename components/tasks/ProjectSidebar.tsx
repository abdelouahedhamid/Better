'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6']

interface Props {
  projects: Project[]
  selectedProjectId: string | null
  onSelect: (id: string | null) => void
  onAdd: (name: string, color: string) => void
}

export function ProjectSidebar({ projects, selectedProjectId, onSelect, onAdd }: Props) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  function handleAdd() {
    if (!name.trim()) return
    onAdd(name.trim(), color)
    setName('')
    setColor(COLORS[0])
    setAdding(false)
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
          selectedProjectId === null
            ? 'bg-secondary text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        All tasks
      </button>

      {projects.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
            selectedProjectId === p.id
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="truncate">{p.name}</span>
        </button>
      ))}

      {adding ? (
        <div className="pt-1 space-y-2">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Project name"
            className="h-8 text-sm"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                className="h-5 w-5 rounded-full transition-all"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px var(--background), 0 0 0 3.5px ${c}` : undefined
                }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!name.trim()} className="flex-1 h-7 text-xs">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setName('') }} className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New project
        </button>
      )}
    </div>
  )
}
