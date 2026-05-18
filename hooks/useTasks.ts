'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import type { Task, Project } from '@/types'
import { today } from '@/lib/utils'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(today())

  const fetchData = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const [tasksSnap, projectsSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, 'users', user.uid, 'tasks'),
          where('scheduled_date', '<=', selectedDate)
        )
      ),
      getDocs(
        query(
          collection(db, 'users', user.uid, 'projects'),
          where('archived', '==', false),
          orderBy('created_at', 'asc')
        )
      ),
    ])

    const rawTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
    // Mirror Supabase OR: show tasks on selectedDate OR overdue+incomplete
    const filtered = rawTasks.filter(t =>
      t.scheduled_date === selectedDate ||
      (t.scheduled_date !== undefined && t.scheduled_date < selectedDate && !t.completed)
    )
    const sorted = filtered.sort((a, b) => {
      if (!a.time_start) return 1
      if (!b.time_start) return -1
      return a.time_start.localeCompare(b.time_start)
    })

    setTasks(sorted)
    setProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Project)))
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
    const user = auth.currentUser
    if (!user) return

    const docRef = await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      ...task,
      user_id: user.uid,
      completed: false,
      created_at: Timestamp.now(),
    })
    const newTask = { id: docRef.id, ...task, user_id: user.uid, completed: false } as Task
    setTasks(prev => [...prev, newTask].sort((a, b) => {
      if (!a.time_start) return 1
      if (!b.time_start) return -1
      return a.time_start.localeCompare(b.time_start)
    }))
  }, [])

  const completeTask = useCallback(async (taskId: string, completed: boolean) => {
    const user = auth.currentUser
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    setTasks(prev => prev.map(t => t.id === taskId
      ? { ...t, completed, completed_at: completed ? new Date().toISOString() : undefined }
      : t
    ))
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId))
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const addProject = useCallback(async (name: string, color: string) => {
    const user = auth.currentUser
    if (!user) return

    const docRef = await addDoc(collection(db, 'users', user.uid, 'projects'), {
      name,
      color,
      user_id: user.uid,
      archived: false,
      created_at: Timestamp.now(),
    })
    setProjects(prev => [...prev, { id: docRef.id, name, color, user_id: user.uid, archived: false } as Project])
  }, [])

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
