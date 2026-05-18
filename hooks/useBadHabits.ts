'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, addDoc, setDoc, doc, orderBy, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import type { BadHabit, BadHabitLog, WeeklyStats } from '@/types'
import { today, getISOWeek, getLast12Weeks } from '@/lib/utils'

export function useBadHabits() {
  const [badHabits, setBadHabits] = useState<BadHabit[]>([])
  const [todayLogs, setTodayLogs] = useState<BadHabitLog[]>([])
  const [allLogs, setAllLogs] = useState<BadHabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const cutoff = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 83)
      return d.toISOString().split('T')[0]
    })()

    const [habitsSnap, todaySnap, allSnap] = await Promise.all([
      getDocs(query(collection(db, 'users', user.uid, 'bad_habits'), orderBy('created_at', 'asc'))),
      getDocs(query(collection(db, 'users', user.uid, 'bad_habit_logs'), where('log_date', '==', today()))),
      getDocs(query(collection(db, 'users', user.uid, 'bad_habit_logs'), where('log_date', '>=', cutoff))),
    ])

    setBadHabits(habitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as BadHabit)))
    setTodayLogs(todaySnap.docs.map(d => ({ id: d.id, ...d.data() } as BadHabitLog)))
    setAllLogs(allSnap.docs.map(d => ({ id: d.id, ...d.data() } as BadHabitLog)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const addBadHabit = useCallback(async (habit: {
    name: string
    unit?: string
    baseline_frequency?: number
    baseline_intensity?: number
    goal_frequency?: number
    goal_intensity?: number
  }) => {
    const user = auth.currentUser
    if (!user) return

    const docRef = await addDoc(collection(db, 'users', user.uid, 'bad_habits'), {
      ...habit,
      user_id: user.uid,
      unit: habit.unit ?? 'times',
      created_at: Timestamp.now(),
    })
    setBadHabits(prev => [...prev, { id: docRef.id, ...habit, user_id: user.uid, unit: habit.unit ?? 'times' } as BadHabit])
  }, [])

  const logToday = useCallback(async (badHabitId: string, didIt: boolean, quantity?: number, notes?: string) => {
    const user = auth.currentUser
    if (!user) return

    const logId = `${badHabitId}_${today()}`
    const logData: Omit<BadHabitLog, 'id'> = {
      bad_habit_id: badHabitId,
      user_id: user.uid,
      log_date: today(),
      did_it: didIt,
      ...(didIt && quantity !== undefined ? { quantity } : {}),
      ...(notes ? { notes } : {}),
    }
    await setDoc(doc(db, 'users', user.uid, 'bad_habit_logs', logId), logData)
    const newLog = { id: logId, ...logData }

    setTodayLogs(prev => [...prev.filter(l => l.bad_habit_id !== badHabitId), newLog])
    setAllLogs(prev => [...prev.filter(l => !(l.bad_habit_id === badHabitId && l.log_date === today())), newLog])
  }, [])

  const getTodayLog = useCallback((badHabitId: string) => {
    return todayLogs.find(l => l.bad_habit_id === badHabitId)
  }, [todayLogs])

  const getWeeklyStats = useCallback((badHabitId: string): WeeklyStats[] => {
    const weeks = getLast12Weeks()
    const habitLogs = allLogs.filter(l => l.bad_habit_id === badHabitId && l.did_it)

    return weeks.map(week => {
      const weekLogs = habitLogs.filter(l => getISOWeek(l.log_date) === week)
      const avgIntensity = weekLogs.length > 0
        ? weekLogs.reduce((sum, l) => sum + (l.quantity ?? 0), 0) / weekLogs.length
        : 0
      return { week, frequency: weekLogs.length, avgIntensity: Math.round(avgIntensity * 10) / 10 }
    })
  }, [allLogs])

  const loggedToday = useCallback((badHabitId: string) => {
    return todayLogs.some(l => l.bad_habit_id === badHabitId)
  }, [todayLogs])

  return {
    badHabits,
    todayLogs,
    allLogs,
    loading,
    addBadHabit,
    logToday,
    getTodayLog,
    getWeeklyStats,
    loggedToday,
    refetch: fetchData,
  }
}
