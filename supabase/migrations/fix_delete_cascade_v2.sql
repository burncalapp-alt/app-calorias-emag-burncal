-- 1. Create fasting_sessions if it's missing (Fixes the "relation does not exist" error)
CREATE TABLE IF NOT EXISTS public.fasting_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  start_time timestamptz not null default now(),
  end_time timestamptz not null,
  protocol text not null,
  status text default 'active',
  created_at timestamptz default now()
);

-- Enable RLS for fasting_sessions if created newly
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their fasting sessions" ON public.fasting_sessions;
CREATE POLICY "Users can manage their fasting sessions" ON public.fasting_sessions FOR ALL USING (auth.uid() = user_id);

-- 2. Modify Tables to Cascade Delete (Deleting User -> Deletes Data)

-- Daily Logs
ALTER TABLE public.daily_logs DROP CONSTRAINT IF EXISTS daily_logs_user_id_fkey;
ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Food Logs
ALTER TABLE public.food_logs DROP CONSTRAINT IF EXISTS food_logs_user_id_fkey;
ALTER TABLE public.food_logs ADD CONSTRAINT food_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Weight History
ALTER TABLE public.weight_history DROP CONSTRAINT IF EXISTS weight_history_user_id_fkey;
ALTER TABLE public.weight_history ADD CONSTRAINT weight_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fasting Sessions (Now safe to run)
ALTER TABLE public.fasting_sessions DROP CONSTRAINT IF EXISTS fasting_sessions_user_id_fkey;
ALTER TABLE public.fasting_sessions ADD CONSTRAINT fasting_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
