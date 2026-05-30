'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import type { Task } from '@/types'
import { today } from '@/lib/utils'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(today())

  const fetchData = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const tasksSnap = await getDocs(
      query(
        collection(db, 'users', user.uid, 'tasks'),
        where('scheduled_date', '<=', selectedDate)
      )
    )

    const rawTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
    const filtered = rawTasks.filter(t =>
      t.scheduled_date === selectedDate ||
      (t.scheduled_date !== undefined && t.scheduled_date < selectedDate && !t.completed)
    )

    setTasks(filtered)
    setLoading(false)
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  const addTask = useCallback(async (task: {
    title: string
    scheduled_date?: string
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
    setTasks(prev => [...prev, newTask])
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

  const todayTasks = tasks.filter(t => t.scheduled_date === today())
  const carriedOverTasks = tasks.filter(t => t.scheduled_date && t.scheduled_date < today() && !t.completed)

  return {
    tasks,
    todayTasks,
    carriedOverTasks,
    loading,
    selectedDate,
    setSelectedDate,
    addTask,
    completeTask,
    deleteTask,
    refetch: fetchData,
  }
}
