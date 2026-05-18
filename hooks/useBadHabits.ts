'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BadHabit, BadHabitLog, WeeklyStats } from '@/types'
import { today, getISOWeek, getLast12Weeks } from '@/lib/utils'

export function useBadHabits() {
  const [badHabits, setBadHabits] = useState<BadHabit[]>([])
  const [todayLogs, setTodayLogs] = useState<BadHabitLog[]>([])
  const [allLogs, setAllLogs] = useState<BadHabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const cutoff = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 83)
      return d.toISOString().split('T')[0]
    })()

    const [habitsRes, todayRes, allRes] = await Promise.all([
      supabase.from('bad_habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('bad_habit_logs').select('*').eq('user_id', user.id).eq('log_date', today()),
      supabase.from('bad_habit_logs').select('*').eq('user_id', user.id).gte('log_date', cutoff),
    ])

    setBadHabits(habitsRes.data ?? [])
    setTodayLogs(todayRes.data ?? [])
    setAllLogs(allRes.data ?? [])
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('bad_habits')
      .insert({ ...habit, user_id: user.id, unit: habit.unit ?? 'times' })
      .select()
      .single()
    if (data) setBadHabits(prev => [...prev, data])
  }, [supabase])

  const logToday = useCallback(async (badHabitId: string, didIt: boolean, quantity?: number, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('bad_habit_logs')
      .upsert(
        { bad_habit_id: badHabitId, user_id: user.id, log_date: today(), did_it: didIt, quantity: didIt ? quantity : null, notes },
        { onConflict: 'bad_habit_id,log_date' }
      )
      .select()
      .single()

    if (data) {
      setTodayLogs(prev => {
        const filtered = prev.filter(l => l.bad_habit_id !== badHabitId)
        return [...filtered, data]
      })
      setAllLogs(prev => {
        const filtered = prev.filter(l => !(l.bad_habit_id === badHabitId && l.log_date === today()))
        return [...filtered, data]
      })
    }
  }, [supabase])

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
