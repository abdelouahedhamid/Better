'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, getDocs, addDoc, where, orderBy, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import type { MeditationSession } from '@/types'
import { today, formatDate } from '@/lib/utils'

export function useMeditation() {
  const [sessions, setSessions] = useState<MeditationSession[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const cutoff = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      return formatDate(d)
    })()

    const snap = await getDocs(
      query(
        collection(db, 'users', user.uid, 'meditation_sessions'),
        where('date', '>=', cutoff),
        orderBy('date', 'desc')
      )
    )

    setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as MeditationSession)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const logSession = useCallback(async (session: {
    duration_minutes: number
    sound_type: MeditationSession['sound_type']
    identity_id?: string
  }) => {
    const user = auth.currentUser
    if (!user) return null

    const docRef = await addDoc(collection(db, 'users', user.uid, 'meditation_sessions'), {
      ...session,
      user_id: user.uid,
      date: today(),
      created_at: Timestamp.now(),
    })

    const newSession: MeditationSession = {
      id: docRef.id,
      user_id: user.uid,
      date: today(),
      created_at: new Date().toISOString(),
      ...session,
    }
    setSessions(prev => [newSession, ...prev])
    return docRef.id
  }, [])

  return { sessions, loading, logSession, refetch: fetchSessions }
}
