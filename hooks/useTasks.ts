'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Project } from '@/types'
import { today } from '@/lib/utils'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(today())
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [tasksRes, projectsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .or(`scheduled_date.eq.${selectedDate},and(scheduled_date.lt.${selectedDate},completed.eq.false)`)
        .order('time_start', { ascending: true, nullsFirst: false }),
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: true }),
    ])

    setTasks(tasksRes.data ?? [])
    setProjects(projectsRes.data ?? [])
    setLoading(false)
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  const addTask = useCallback(async (task: {
    title: string
    project_id?: string
    scheduled_date?: string
    time_start?: string
    time_end?: string
    description?: string
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single()
    if (data) setTasks(prev => [...prev, data].sort((a, b) => {
      if (!a.time_start) return 1
      if (!b.time_start) return -1
      return a.time_start.localeCompare(b.time_start)
    }))
  }, [supabase])

  const completeTask = useCallback(async (taskId: string, completed: boolean) => {
    await supabase
      .from('tasks')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed, completed_at: completed ? new Date().toISOString() : undefined } : t))
  }, [supabase])

  const deleteTask = useCallback(async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [supabase])

  const addProject = useCallback(async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('projects')
      .insert({ name, color, user_id: user.id })
      .select()
      .single()
    if (data) setProjects(prev => [...prev, data])
  }, [supabase])

  const todayTasks = tasks.filter(t => t.scheduled_date === today())
  const carriedOverTasks = tasks.filter(t => t.scheduled_date && t.scheduled_date < today() && !t.completed)
  const timedTasks = tasks.filter(t => t.time_start)
  const untimedTasks = tasks.filter(t => !t.time_start)

  return {
    tasks,
    todayTasks,
    carriedOverTasks,
    timedTasks,
    untimedTasks,
    projects,
    loading,
    selectedDate,
    setSelectedDate,
    addTask,
    completeTask,
    deleteTask,
    addProject,
    refetch: fetchData,
  }
}
