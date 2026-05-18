'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog } from '@/types'
import { today, formatDate } from '@/lib/utils'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [allLogs, setAllLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [habitsRes, logsRes, allLogsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: true }),
      supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today()),
      supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', (() => {
          const d = new Date()
          d.setDate(d.getDate() - 364)
          return formatDate(d)
        })()),
    ])

    setHabits(habitsRes.data ?? [])
    setTodayLogs(logsRes.data ?? [])
    setAllLogs(allLogsRes.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleHabit = useCallback(async (habitId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const existing = todayLogs.find(l => l.habit_id === habitId)
    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id)
      setTodayLogs(prev => prev.filter(l => l.id !== existing.id))
      setAllLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, log_date: today() })
        .select()
        .single()
      if (data) {
        setTodayLogs(prev => [...prev, data])
        setAllLogs(prev => [...prev, data])
      }
    }
  }, [todayLogs, supabase])

  const addHabit = useCallback(async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('habits')
      .insert({ name, color, user_id: user.id })
      .select()
      .single()
    if (data) setHabits(prev => [...prev, data])
  }, [supabase])

  const archiveHabit = useCallback(async (habitId: string) => {
    await supabase.from('habits').update({ archived: true }).eq('id', habitId)
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }, [supabase])

  const isCompletedToday = useCallback((habitId: string) => {
    return todayLogs.some(l => l.habit_id === habitId)
  }, [todayLogs])

  const getStreak = useCallback((habitId: string): number => {
    const logs = allLogs
      .filter(l => l.habit_id === habitId)
      .map(l => l.log_date)
      .sort()
      .reverse()

    if (!logs.length) return 0

    let streak = 0
    const checkDate = new Date()

    for (let i = 0; i < 364; i++) {
      const dateStr = formatDate(checkDate)
      if (logs.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }, [allLogs])

  return { habits, todayLogs, allLogs, loading, toggleHabit, addHabit, archiveHabit, isCompletedToday, getStreak, refetch: fetchData }
}
