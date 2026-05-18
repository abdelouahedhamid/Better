'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { getLast84Days, getLast12Weeks, getISOWeek } from '@/lib/utils'
import type { BadHabit, WeeklyStats } from '@/types'

interface HeatmapDay {
  date: string
  done: number
  total: number
  rate: number
}

interface TaskWeek {
  week: string
  completed: number
  total: number
  rate: number
}

interface AnalyticsData {
  heatmap: HeatmapDay[]
  taskCompletion: TaskWeek[]
  badHabits: BadHabit[]
  badHabitStats: Record<string, WeeklyStats[]>
  weeklyScore: number
  loading: boolean
}

export function useAnalytics(): AnalyticsData {
  const [data, setData] = useState<Omit<AnalyticsData, 'loading'>>({
    heatmap: [],
    taskCompletion: [],
    badHabits: [],
    badHabitStats: {},
    weeklyScore: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const days84 = getLast84Days()
    const cutoff84 = days84[0]
    const weeks12 = getLast12Weeks()

    const [habitsSnap, habitLogsSnap, tasksSnap, badHabitsSnap, badLogsSnap] = await Promise.all([
      getDocs(query(collection(db, 'users', user.uid, 'habits'), where('archived', '==', false))),
      getDocs(query(collection(db, 'users', user.uid, 'habit_logs'), where('log_date', '>=', cutoff84))),
      getDocs(query(collection(db, 'users', user.uid, 'tasks'), where('scheduled_date', '>=', cutoff84))),
      getDocs(query(collection(db, 'users', user.uid, 'bad_habits'), orderBy('created_at', 'asc'))),
      getDocs(query(collection(db, 'users', user.uid, 'bad_habit_logs'), where('log_date', '>=', cutoff84))),
    ])

    const habits = habitsSnap.docs.map(d => d.data())
    const habitLogs = habitLogsSnap.docs.map(d => d.data())
    const tasks = tasksSnap.docs.map(d => d.data())
    const badHabits = badHabitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as BadHabit))
    const badLogs = badLogsSnap.docs.map(d => d.data())

    const totalHabits = habits.length

    const heatmap: HeatmapDay[] = days84.map(date => {
      const done = habitLogs.filter(l => l.log_date === date).length
      const rate = totalHabits > 0 ? done / totalHabits : 0
      return { date, done, total: totalHabits, rate }
    })

    const taskCompletion: TaskWeek[] = weeks12.map(week => {
      const weekTasks = tasks.filter(t => t.scheduled_date && getISOWeek(t.scheduled_date) === week)
      const completed = weekTasks.filter(t => t.completed).length
      const total = weekTasks.length
      return { week, completed, total, rate: total > 0 ? completed / total : 0 }
    })

    const badHabitStats: Record<string, WeeklyStats[]> = {}
    for (const habit of badHabits) {
      const logs = badLogs.filter(l => l.bad_habit_id === habit.id && l.did_it)
      badHabitStats[habit.id] = weeks12.map(week => {
        const weekLogs = logs.filter(l => getISOWeek(l.log_date) === week)
        const avgIntensity = weekLogs.length > 0
          ? weekLogs.reduce((s, l) => s + (l.quantity ?? 0), 0) / weekLogs.length
          : 0
        return { week, frequency: weekLogs.length, avgIntensity: Math.round(avgIntensity * 10) / 10 }
      })
    }

    const last7 = days84.slice(-7)
    const habitsScore = totalHabits > 0
      ? (last7.reduce((sum, date) => sum + habitLogs.filter(l => l.log_date === date).length, 0) / (totalHabits * 7)) * 100
      : 100
    const last7Tasks = tasks.filter(t => t.scheduled_date && last7.includes(t.scheduled_date))
    const tasksScore = last7Tasks.length > 0 ? (last7Tasks.filter(t => t.completed).length / last7Tasks.length) * 100 : 100
    const last7BadLogs = badLogs.filter(l => last7.includes(l.log_date))
    const badHabitsScore = last7BadLogs.length > 0
      ? (last7BadLogs.filter(l => !l.did_it).length / last7BadLogs.length) * 100
      : 100
    const weeklyScore = Math.round((habitsScore * 0.4) + (tasksScore * 0.4) + (badHabitsScore * 0.2))

    setData({ heatmap, taskCompletion, badHabits, badHabitStats, weeklyScore })
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { ...data, loading }
}
