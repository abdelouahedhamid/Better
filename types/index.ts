export interface Identity {
  id: string
  user_id: string
  name: string
  description: string
  target_vision: string
  color: string
  icon: string
  order: number
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  icon?: string
  archived: boolean
  created_at: string
  identity_id?: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  log_date: string
}

export interface BadHabit {
  id: string
  user_id: string
  name: string
  unit: string
  baseline_frequency?: number
  baseline_intensity?: number
  goal_frequency?: number
  goal_intensity?: number
  created_at: string
}

export interface BadHabitLog {
  id: string
  bad_habit_id: string
  user_id: string
  log_date: string
  did_it: boolean
  quantity?: number
  notes?: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  scheduled_date?: string
  completed: boolean
  completed_at?: string
  created_at: string
}

export interface PushSubscription {
  id: string
  user_id: string
  subscription: object
  reminder_time: string
}

export interface WeeklyStats {
  frequency: number
  avgIntensity: number
  week: string
}

export interface DailyScore {
  habitsScore: number
  tasksScore: number
  badHabitsScore: number
  total: number
}
