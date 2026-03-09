-- COPIE E COLE ESSA QUERY NO SQL EDITOR DO SEU SUPABASE PARA ATIVAR O MÓDULO DE JEJUM

CREATE TABLE IF NOT EXISTS fasting_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  goal_hours INTEGER NOT NULL DEFAULT 16,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fasting_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own fasting logs"
ON fasting_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fasting logs"
ON fasting_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fasting logs"
ON fasting_logs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
