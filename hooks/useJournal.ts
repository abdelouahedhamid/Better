'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, getDocs, addDoc, deleteDoc, doc, orderBy, limit, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import type { JournalEntry } from '@/types'
import { today } from '@/lib/utils'

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const snap = await getDocs(
      query(
        collection(db, 'users', user.uid, 'journal_entries'),
        orderBy('created_at', 'desc'),
        limit(30)
      )
    )

    setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const addEntry = useCallback(async (entry: {
    prompt_id: string
    prompt_text: string
    content: string
    identity_id?: string
  }) => {
    const user = auth.currentUser
    if (!user) return null

    const docRef = await addDoc(collection(db, 'users', user.uid, 'journal_entries'), {
      ...entry,
      user_id: user.uid,
      date: today(),
      created_at: Timestamp.now(),
    })

    const newEntry: JournalEntry = {
      id: docRef.id,
      user_id: user.uid,
      date: today(),
      created_at: new Date().toISOString(),
      ...entry,
    }
    setEntries(prev => [newEntry, ...prev])
    return docRef.id
  }, [])

  const deleteEntry = useCallback(async (entryId: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'journal_entries', entryId))
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }, [])

  return { entries, loading, addEntry, deleteEntry, refetch: fetchEntries }
}
