-- Create nutrition_plans table
create table if not exists public.nutrition_plans (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    date date not null,
    calories_target integer,
    protein_target integer,
    carbs_target integer,
    fats_target integer,
    meals jsonb not null default '[]'::jsonb,
    created_at timestamptz default now(),
    unique(user_id, date)
);

-- Enable RLS
alter table public.nutrition_plans enable row level security;

-- Policies
create policy "Users can view their own nutrition plans"
    on public.nutrition_plans for select
    using (auth.uid() = user_id);

create policy "Users can insert their own nutrition plans"
    on public.nutrition_plans for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own nutrition plans"
    on public.nutrition_plans for update
    using (auth.uid() = user_id);

-- Add indexes for performance
create index if not exists idx_nutrition_plans_user_date on public.nutrition_plans(user_id, date);
