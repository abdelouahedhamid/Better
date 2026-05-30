export interface BreathingPattern {
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  label: string
}

export const BREATHING_PATTERNS: Record<string, BreathingPattern> = {
  box: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, label: 'Box breathing' },
  relaxing: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, label: '4-7-8 breath' },
}

export type BreathingPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

export const PHASE_LABELS: Record<BreathingPhase, string> = {
  inhale: 'Inhale',
  holdIn: 'Hold',
  exhale: 'Exhale',
  holdOut: 'Hold',
}

export function getNextPhase(current: BreathingPhase, pattern: BreathingPattern): BreathingPhase {
  const sequence: BreathingPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut']
  const idx = sequence.indexOf(current)
  for (let i = 1; i <= 4; i++) {
    const next = sequence[(idx + i) % 4]
    if (pattern[next] > 0) return next
  }
  return 'inhale'
}
