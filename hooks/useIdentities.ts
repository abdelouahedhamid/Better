'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import type { Identity } from '@/types'

export function useIdentities() {
  const [identities, setIdentities] = useState<Identity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const snap = await getDocs(
      query(collection(db, 'users', user.uid, 'identities'), orderBy('order', 'asc'))
    )
    setIdentities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Identity)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const addIdentity = useCallback(async (
    name: string,
    description: string,
    target_vision: string,
    color: string,
    icon: string,
  ) => {
    const user = auth.currentUser
    if (!user) return

    const order = identities.length
    const docRef = await addDoc(collection(db, 'users', user.uid, 'identities'), {
      name,
      description,
      target_vision,
      color,
      icon,
      order,
      user_id: user.uid,
      created_at: Timestamp.now(),
    })
    setIdentities(prev => [...prev, { id: docRef.id, name, description, target_vision, color, icon, order, user_id: user.uid, created_at: new Date().toISOString() }])
  }, [identities.length])

  const updateIdentity = useCallback(async (id: string, partial: Partial<Omit<Identity, 'id' | 'user_id' | 'created_at'>>) => {
    const user = auth.currentUser
    if (!user) return

    await updateDoc(doc(db, 'users', user.uid, 'identities', id), partial)
    setIdentities(prev => prev.map(i => i.id === id ? { ...i, ...partial } : i))
  }, [])

  const deleteIdentity = useCallback(async (id: string) => {
    const user = auth.currentUser
    if (!user) return

    await deleteDoc(doc(db, 'users', user.uid, 'identities', id))
    setIdentities(prev => prev.filter(i => i.id !== id))
  }, [])

  const reorderIdentities = useCallback(async (ordered: Identity[]) => {
    const user = auth.currentUser
    if (!user) return

    setIdentities(ordered)
    await Promise.all(
      ordered.map((identity, index) =>
        updateDoc(doc(db, 'users', user.uid, 'identities', identity.id), { order: index })
      )
    )
  }, [])

  return { identities, loading, addIdentity, updateIdentity, deleteIdentity, reorderIdentities, refetch: fetchData }
}
