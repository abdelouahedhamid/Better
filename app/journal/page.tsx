'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useJournal } from '@/hooks/useJournal'
import { PenLine, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { JournalEntry } from '@/types'

function groupByDate(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  return entries.reduce((acc, entry) => {
    const key = entry.date
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<string, JournalEntry[]>)
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function JournalPage() {
  const { entries, loading, deleteEntry } = useJournal()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  const grouped = groupByDate(entries)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
        <Link href="/journal/new">
          <Button size="sm" className="gap-2">
            <PenLine className="w-4 h-4" />
            Write
          </Button>
        </Link>
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <PenLine className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">No entries yet.</p>
          <Link href="/journal/new">
            <Button>Write your first entry</Button>
          </Link>
        </div>
      )}

      {sortedDates.map(date => (
        <div key={date} className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">
            {formatDisplayDate(date)}
          </p>
          {grouped[date].map(entry => (
            <div
              key={entry.id}
              className="rounded-xl border border-border/40 bg-card overflow-hidden"
            >
              <button
                className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-accent/50 transition-colors"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {entry.prompt_text || 'Free write'}
                  </p>
                  <p className="text-sm text-foreground line-clamp-2">
                    {entry.content.slice(0, 100)}{entry.content.length > 100 ? '…' : ''}
                  </p>
                </div>
                {expandedId === entry.id
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                }
              </button>

              {expandedId === entry.id && (
                <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                  {entry.prompt_text && (
                    <p className="text-xs text-muted-foreground italic">{entry.prompt_text}</p>
                  )}
                  <p className="text-sm text-foreground whitespace-pre-wrap">{entry.content}</p>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive gap-1.5"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
