'use client'

import { useRef, useCallback } from 'react'
import type { MeditationSession } from '@/types'

type SoundType = MeditationSession['sound_type']

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

export function useMeditationAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch {}
      sourceRef.current = null
    }
    if (ctxRef.current) {
      ctxRef.current.close()
      ctxRef.current = null
    }
  }, [])

  const play = useCallback((type: SoundType) => {
    if (type === 'silent') return
    if (typeof window === 'undefined') return

    stop()

    const ctx = new AudioContext()
    ctxRef.current = ctx

    const buffer = createNoiseBuffer(ctx)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.value = 0.15
    gainRef.current = gain

    if (type === 'brown_noise') {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowshelf'
      filter.frequency.value = 200
      filter.gain.value = 15
      source.connect(filter)
      filter.connect(gain)
    } else if (type === 'white_noise') {
      source.connect(gain)
    } else if (type === 'rain') {
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 600
      filter.Q.value = 0.5
      const filter2 = ctx.createBiquadFilter()
      filter2.type = 'highshelf'
      filter2.frequency.value = 3000
      filter2.gain.value = -8
      source.connect(filter)
      filter.connect(filter2)
      filter2.connect(gain)
    }

    gain.connect(ctx.destination)
    source.start()
    sourceRef.current = source
  }, [stop])

  return { play, stop }
}
