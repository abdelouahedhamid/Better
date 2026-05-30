'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BREATHING_PATTERNS, PHASE_LABELS, getNextPhase, type BreathingPhase } from '@/lib/breathing-patterns'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const CALM_BLUE = '#3b82f6'

const PATTERN_OPTIONS = [
  { key: 'box', label: 'Box breathing (4-4-4-4)' },
  { key: 'relaxing', label: '4-7-8 relaxing breath' },
] as const

export default function BreathePage() {
  const router = useRouter()
  const [patternKey, setPatternKey] = useState<'box' | 'relaxing'>('box')
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<BreathingPhase>('inhale')
  const [secondsLeft, setSecondsLeft] = useState(4)

  const pattern = BREATHING_PATTERNS[patternKey]
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef<BreathingPhase>('inhale')
  const patternRef = useRef(pattern)
  patternRef.current = pattern

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  useEffect(() => {
    if (!running) return
    clearTimer()
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          const next = getNextPhase(phaseRef.current, patternRef.current)
          phaseRef.current = next
          setPhase(next)
          return patternRef.current[next]
        }
        return prev - 1
      })
    }, 1000)
    return () => clearTimer()
  }, [running, clearTimer])

  const handleStart = () => {
    const p = BREATHING_PATTERNS[patternKey]
    phaseRef.current = 'inhale'
    setPhase('inhale')
    setSecondsLeft(p.inhale)
    setRunning(true)
  }

  const handleStop = () => {
    clearTimer()
    setRunning(false)
    const p = BREATHING_PATTERNS[patternKey]
    phaseRef.current = 'inhale'
    setPhase('inhale')
    setSecondsLeft(p.inhale)
  }

  const handlePatternChange = (key: 'box' | 'relaxing') => {
    if (running) handleStop()
    setPatternKey(key)
    setSecondsLeft(BREATHING_PATTERNS[key].inhale)
  }

  const scale = phase === 'inhale' ? 1.45 : phase === 'holdIn' ? 1.45 : 1
  const transitionDuration = phase === 'inhale'
    ? pattern.inhale
    : phase === 'exhale'
      ? pattern.exhale
      : 0.15

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Breathe</h1>
      </div>

      {!running && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Pattern</p>
          <div className="flex flex-col gap-2">
            {PATTERN_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => handlePatternChange(opt.key)}
                className={cn(
                  'text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                  patternKey === opt.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/40 bg-card hover:bg-accent'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-8 py-6">
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          <div
            className="rounded-full absolute"
            style={{
              width: 140,
              height: 140,
              backgroundColor: CALM_BLUE,
              opacity: 0.15,
              transform: `scale(${scale})`,
              transition: `transform ${transitionDuration}s ease-in-out`,
            }}
          />
          <div
            className="rounded-full flex items-center justify-center z-10"
            style={{
              width: 140,
              height: 140,
              border: `3px solid ${CALM_BLUE}`,
              backgroundColor: `${CALM_BLUE}22`,
              transform: `scale(${scale})`,
              transition: `transform ${transitionDuration}s ease-in-out`,
            }}
          >
            {running && (
              <span className="text-3xl font-mono font-semibold tabular-nums" style={{ color: CALM_BLUE }}>
                {secondsLeft}
              </span>
            )}
          </div>
        </div>

        {running && (
          <p className="text-2xl font-semibold tracking-wide" style={{ color: CALM_BLUE }}>
            {PHASE_LABELS[phase]}
          </p>
        )}

        {running ? (
          <Button variant="outline" onClick={handleStop} className="px-8">
            Stop
          </Button>
        ) : (
          <Button onClick={handleStart} className="px-8">
            Start
          </Button>
        )}
      </div>
    </div>
  )
}
