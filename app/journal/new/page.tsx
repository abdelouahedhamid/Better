'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useJournal } from '@/hooks/useJournal'
import { useIdentities } from '@/hooks/useIdentities'
import { JOURNAL_PROMPTS, getPromptsForIdentities, type JournalPrompt } from '@/lib/journal-prompts'
import { Button } from '@/components/ui/button'
import { Shuffle, PenLine, ArrowLeft } from 'lucide-react'

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function NewJournalPage() {
  const router = useRouter()
  const { addEntry } = useJournal()
  const { identities } = useIdentities()

  const [step, setStep] = useState<'pick' | 'write'>('pick')
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const identityNames = identities.map(i => i.name)

  const candidatePool = identityNames.length > 0
    ? getPromptsForIdentities(identityNames)
    : JOURNAL_PROMPTS

  const [shownPrompts, setShownPrompts] = useState<JournalPrompt[]>(() =>
    pickRandom(candidatePool, 3)
  )

  const reshuffle = useCallback(() => {
    setShownPrompts(pickRandom(JOURNAL_PROMPTS, 3))
  }, [])

  const handleSelectPrompt = (prompt: JournalPrompt | null) => {
    setSelectedPrompt(prompt)
    setStep('write')
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    const activeIdentity = identities[0]
    await addEntry({
      prompt_id: selectedPrompt?.id ?? '',
      prompt_text: selectedPrompt?.text ?? '',
      content: content.trim(),
      identity_id: activeIdentity?.id,
    })
    router.push('/journal')
  }

  if (step === 'pick') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/journal')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">New entry</h1>
        </div>

        <p className="text-sm text-muted-foreground">Choose a prompt to write about, or start freely.</p>

        <div className="space-y-3">
          {shownPrompts.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => handleSelectPrompt(prompt)}
              className="w-full text-left rounded-xl border border-border/40 bg-card px-4 py-4 hover:bg-accent transition-colors"
            >
              <p className="text-sm">{prompt.text}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{prompt.category}{prompt.identity_type ? ` · ${prompt.identity_type}` : ''}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={reshuffle} className="gap-2 flex-1">
            <Shuffle className="w-4 h-4" />
            Surprise me
          </Button>
          <Button variant="outline" onClick={() => handleSelectPrompt(null)} className="gap-2 flex-1">
            <PenLine className="w-4 h-4" />
            Write freely
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4 min-h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep('pick')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Write</h1>
      </div>

      {selectedPrompt && (
        <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">{selectedPrompt.text}</p>
        </div>
      )}

      <textarea
        className="flex-1 min-h-[300px] w-full rounded-xl border border-border/40 bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        placeholder={selectedPrompt ? 'Write your response…' : 'What\'s on your mind…'}
        value={content}
        onChange={e => setContent(e.target.value)}
        autoFocus
      />

      <Button
        onClick={handleSave}
        disabled={!content.trim() || saving}
        className="w-full"
      >
        {saving ? 'Saving…' : 'Save entry'}
      </Button>
    </div>
  )
}
