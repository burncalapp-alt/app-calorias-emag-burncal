-- Fix delete cascade for user data tables
-- This allows deleting a user from auth.users to cascade delete all their data

-- 1. Daily Logs
ALTER TABLE public.daily_logs 
DROP CONSTRAINT IF EXISTS daily_logs_user_id_fkey;

ALTER TABLE public.daily_logs 
ADD CONSTRAINT daily_logs_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 2. Food Logs
ALTER TABLE public.food_logs 
DROP CONSTRAINT IF EXISTS food_logs_user_id_fkey;

ALTER TABLE public.food_logs 
ADD CONSTRAINT food_logs_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 3. Weight History
ALTER TABLE public.weight_history 
DROP CONSTRAINT IF EXISTS weight_history_user_id_fkey;

ALTER TABLE public.weight_history 
ADD CONSTRAINT weight_history_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 4. Fasting Sessions
ALTER TABLE public.fasting_sessions 
DROP CONSTRAINT IF EXISTS fasting_sessions_user_id_fkey;

ALTER TABLE public.fasting_sessions 
ADD CONSTRAINT fasting_sessions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;
