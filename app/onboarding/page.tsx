'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, Brain, Briefcase, Heart, BookOpen, Music, Zap, Leaf, Code2, Globe, Star, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useIdentities } from '@/hooks/useIdentities'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4',
]

const ICONS = [
  { name: 'Dumbbell', Icon: Dumbbell },
  { name: 'Brain', Icon: Brain },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'Heart', Icon: Heart },
  { name: 'BookOpen', Icon: BookOpen },
  { name: 'Music', Icon: Music },
  { name: 'Zap', Icon: Zap },
  { name: 'Leaf', Icon: Leaf },
  { name: 'Code2', Icon: Code2 },
  { name: 'Globe', Icon: Globe },
  { name: 'Star', Icon: Star },
  { name: 'Coffee', Icon: Coffee },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { identities, loading, addIdentity } = useIdentities()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetVision, setTargetVision] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0].name)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && identities.length > 0) {
      router.push('/')
    }
  }, [loading, identities.length, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    await addIdentity(name.trim(), description.trim(), targetVision.trim(), color, icon)
    router.push('/')
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Who are you becoming?</CardTitle>
          <CardDescription>Define your first identity. You can add more later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="identity-name">Identity name</Label>
              <Input
                id="identity-name"
                placeholder="e.g. Athlete"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="identity-description">One-line description</Label>
              <Input
                id="identity-description"
                placeholder="e.g. Someone who trains daily and eats clean"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="identity-vision">Target vision</Label>
              <Textarea
                id="identity-vision"
                placeholder="Describe who you're becoming…"
                value={targetVision}
                onChange={e => setTargetVision(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${c}` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(({ name: iconName, Icon }) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className="flex items-center justify-center h-9 w-9 rounded-md border border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: icon === iconName ? color : undefined,
                      borderColor: icon === iconName ? color : undefined,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: icon === iconName ? '#fff' : undefined }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={!name.trim() || submitting}>
                {submitting ? 'Creating…' : 'Create identity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
