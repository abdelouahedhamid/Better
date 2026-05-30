'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMeditation } from '@/hooks/useMeditation'
import { useMeditationAudio } from '@/hooks/useMeditationAudio'
import { useIdentities } from '@/hooks/useIdentities'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Pause, Square, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MeditationSession } from '@/types'

const DURATIONS = [5, 10, 15, 20]
const SOUNDS: { value: MeditationSession['sound_type']; label: string }[] = [
  { value: 'silent', label: 'Silent' },
  { value: 'brown_noise', label: 'Brown noise' },
  { value: 'white_noise', label: 'White noise' },
  { value: 'rain', label: 'Rain' },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function MeditatePage() {
  const router = useRouter()
  const { logSession } = useMeditation()
  const { play, stop } = useMeditationAudio()
  const { identities } = useIdentities()

  const [durationMin, setDurationMin] = useState(10)
  const [soundType, setSoundType] = useState<MeditationSession['sound_type']>('silent')
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [logged, setLogged] = useState(false)

  const totalSeconds = durationMin * 60
  const remaining = totalSeconds - elapsed
  const progress = elapsed / totalSeconds

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimer()
      stop()
    }
  }, [clearTimer, stop])

  const handleStart = () => {
    play(soundType)
    setStatus('running')
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= totalSeconds) {
          clearTimer()
          stop()
          setStatus('complete')
          return totalSeconds
        }
        return prev + 1
      })
    }, 1000)
  }

  const handlePause = () => {
    clearTimer()
    stop()
    setStatus('paused')
  }

  const handleResume = () => {
    play(soundType)
    setStatus('running')
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= totalSeconds) {
          clearTimer()
          stop()
          setStatus('complete')
          return totalSeconds
        }
        return prev + 1
      })
    }, 1000)
  }

  const handleStop = () => {
    clearTimer()
    stop()
    setElapsed(0)
    setStatus('idle')
    setLogged(false)
  }

  const handleLog = async () => {
    await logSession({
      duration_minutes: durationMin,
      sound_type: soundType,
      identity_id: identities[0]?.id,
    })
    setLogged(true)
  }

  const radius = 90
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Meditate</h1>
      </div>

      {status === 'idle' && (
        <>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDurationMin(d)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                    durationMin === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border/40 bg-card hover:bg-accent'
                  )}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ambient sound</p>
            <div className="grid grid-cols-2 gap-2">
              {SOUNDS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSoundType(s.value)}
                  className={cn(
                    'py-2 px-3 rounded-lg text-sm font-medium border transition-colors',
                    soundType === s.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border/40 bg-card hover:bg-accent'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative">
          <svg width={220} height={220} className="-rotate-90">
            <circle
              cx={110}
              cy={110}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={6}
              className="text-border/30"
            />
            <circle
              cx={110}
              cy={110}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={6}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono font-semibold tabular-nums">
              {status === 'complete' ? formatTime(0) : formatTime(remaining)}
            </span>
          </div>
        </div>

        {status === 'complete' ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Session complete — {durationMin} min</span>
            </div>
            {logged ? (
              <p className="text-sm text-muted-foreground">Session logged.</p>
            ) : (
              <Button onClick={handleLog} className="w-full max-w-xs">
                Log session
              </Button>
            )}
            <Button variant="outline" onClick={handleStop} className="w-full max-w-xs">
              Start over
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            {status === 'idle' && (
              <Button onClick={handleStart} className="gap-2 px-8">
                <Play className="w-4 h-4" />
                Start
              </Button>
            )}
            {status === 'running' && (
              <>
                <Button variant="outline" onClick={handlePause} className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
                <Button variant="outline" onClick={handleStop} className="gap-2">
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              </>
            )}
            {status === 'paused' && (
              <>
                <Button onClick={handleResume} className="gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
                <Button variant="outline" onClick={handleStop} className="gap-2">
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
