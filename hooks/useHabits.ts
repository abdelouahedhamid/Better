'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import type { Habit, HabitLog } from '@/types'
import { today, formatDate } from '@/lib/utils'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [allLogs, setAllLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const cutoff = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 364)
      return formatDate(d)
    })()

    const habitsSnap = await getDocs(
      query(
        collection(db, 'users', user.uid, 'habits'),
        where('archived', '==', false),
        orderBy('created_at', 'asc')
      )
    )
    const todayLogsSnap = await getDocs(
      query(collection(db, 'users', user.uid, 'habit_logs'), where('log_date', '==', today()))
    )
    const allLogsSnap = await getDocs(
      query(collection(db, 'users', user.uid, 'habit_logs'), where('log_date', '>=', cutoff))
    )

    setHabits(habitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Habit)))
    setTodayLogs(todayLogsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog)))
    setAllLogs(allLogsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleHabit = useCallback(async (habitId: string) => {
    const user = auth.currentUser
    if (!user) return

    const existing = todayLogs.find(l => l.habit_id === habitId)
    if (existing) {
      await deleteDoc(doc(db, 'users', user.uid, 'habit_logs', existing.id))
      setTodayLogs(prev => prev.filter(l => l.id !== existing.id))
      setAllLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const logId = `${habitId}_${today()}`
      const logData: Omit<HabitLog, 'id'> = { habit_id: habitId, user_id: user.uid, log_date: today() }
      await setDoc(doc(db, 'users', user.uid, 'habit_logs', logId), logData)
      const newLog = { id: logId, ...logData }
      setTodayLogs(prev => [...prev, newLog])
      setAllLogs(prev => [...prev, newLog])
    }
  }, [todayLogs])

  const addHabit = useCallback(async (name: string, color: string, identity_id?: string) => {
    const user = auth.currentUser
    if (!user) return

    const docRef = await addDoc(collection(db, 'users', user.uid, 'habits'), {
      name,
      color,
      user_id: user.uid,
      archived: false,
      created_at: Timestamp.now(),
      ...(identity_id ? { identity_id } : {}),
    })
    setHabits(prev => [...prev, { id: docRef.id, name, color, user_id: user.uid, archived: false, ...(identity_id ? { identity_id } : {}) } as Habit])
  }, [])

  const archiveHabit = useCallback(async (habitId: string) => {
    const user = auth.currentUser
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'habits', habitId), { archived: true })
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }, [])

  const isCompletedToday = useCallback((habitId: string) => {
    return todayLogs.some(l => l.habit_id === habitId)
  }, [todayLogs])

  const getWeeklyRate = useCallback((habitId: string): { count: number; total: number } => {
    const logs = allLogs.filter(l => l.habit_id === habitId).map(l => l.log_date)
    let count = 0
    const d = new Date()
    for (let i = 0; i < 7; i++) {
      if (logs.includes(formatDate(d))) count++
      d.setDate(d.getDate() - 1)
    }
    return { count, total: 7 }
  }, [allLogs])

  const getMonthlyRate = useCallback((habitId: string): { count: number; total: number } => {
    const logs = allLogs.filter(l => l.habit_id === habitId).map(l => l.log_date)
    let count = 0
    const d = new Date()
    for (let i = 0; i < 30; i++) {
      if (logs.includes(formatDate(d))) count++
      d.setDate(d.getDate() - 1)
    }
    return { count, total: 30 }
  }, [allLogs])

  return { habits, todayLogs, allLogs, loading, toggleHabit, addHabit, archiveHabit, isCompletedToday, getWeeklyRate, getMonthlyRate, refetch: fetchData }
}
