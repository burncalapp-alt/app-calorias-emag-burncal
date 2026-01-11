-- Create fasting_sessions table
create table if not exists public.fasting_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    protocol text not null,
    status text not null default 'active',
    created_at timestamptz default now()
);

-- Enable RLS for fasting_sessions
alter table public.fasting_sessions enable row level security;

-- Policies for fasting_sessions
create policy "Users can view their own fasting sessions"
    on public.fasting_sessions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own fasting sessions"
    on public.fasting_sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own fasting sessions"
    on public.fasting_sessions for update
    using (auth.uid() = user_id);

-- Create workout_analyses table
create table if not exists public.workout_analyses (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    stats jsonb not null,
    summary text,
    feedback jsonb,
    pre_run_advice jsonb,
    score numeric,
    created_at timestamptz default now()
);

-- Enable RLS for workout_analyses
alter table public.workout_analyses enable row level security;

-- Policies for workout_analyses
create policy "Users can view their own workout analyses"
    on public.workout_analyses for select
    using (auth.uid() = user_id);

create policy "Users can insert their own workout analyses"
    on public.workout_analyses for insert
    with check (auth.uid() = user_id);

-- Create generated_workouts table
create table if not exists public.generated_workouts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    data jsonb not null,
    created_at timestamptz default now()
);

-- Enable RLS for generated_workouts
alter table public.generated_workouts enable row level security;

-- Policies for generated_workouts
create policy "Users can view their own generated workouts"
    on public.generated_workouts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own generated workouts"
    on public.generated_workouts for insert
    with check (auth.uid() = user_id);

-- Create Storage Bucket for Meal Photos
insert into storage.buckets (id, name, public)
values ('meal_photos', 'meal_photos', true)
on conflict (id) do nothing;

-- Policies for Storage
create policy "Public Access to Meal Photos"
on storage.objects for select
using ( bucket_id = 'meal_photos' );

create policy "Authenticated Users can Upload Meal Photos"
on storage.objects for insert
with check ( bucket_id = 'meal_photos' and auth.role() = 'authenticated' );
