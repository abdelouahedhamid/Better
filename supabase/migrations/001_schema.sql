-- Enable RLS helper
-- Run this in Supabase SQL editor after creating tables

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own habits" ON habits FOR ALL USING (user_id = auth.uid());

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  UNIQUE(habit_id, log_date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own habit_logs" ON habit_logs FOR ALL USING (user_id = auth.uid());

CREATE TABLE bad_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'times',
  baseline_frequency INTEGER,
  baseline_intensity NUMERIC,
  goal_frequency INTEGER,
  goal_intensity NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE bad_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own bad_habits" ON bad_habits FOR ALL USING (user_id = auth.uid());

CREATE TABLE bad_habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bad_habit_id UUID REFERENCES bad_habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  did_it BOOLEAN NOT NULL,
  quantity NUMERIC,
  notes TEXT,
  UNIQUE(bad_habit_id, log_date)
);
ALTER TABLE bad_habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own bad_habit_logs" ON bad_habit_logs FOR ALL USING (user_id = auth.uid());

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own projects" ON projects FOR ALL USING (user_id = auth.uid());

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  time_start TIME,
  time_end TIME,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own tasks" ON tasks FOR ALL USING (user_id = auth.uid());

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  reminder_time TIME NOT NULL DEFAULT '08:00'
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own push_subscriptions" ON push_subscriptions FOR ALL USING (user_id = auth.uid());
