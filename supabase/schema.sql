-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  gender text check (gender in ('male', 'female')),
  age int,
  height numeric, -- cm
  weight numeric, -- kg
  activity_level text, -- sedentary, light, etc.
  goal text, -- lose_weight, maintain, gain_muscle
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. Daily Logs (Aggregate data)
create table public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null,
  calories_consumed int default 0,
  calories_burned int default 0,
  water_consumed int default 0,
  protein_consumed int default 0,
  carbs_consumed int default 0,
  fat_consumed int default 0,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.daily_logs enable row level security;
create policy "Users can manage daily logs" on public.daily_logs for all using (auth.uid() = user_id);

-- 3. Food Logs (Individual entries)
create table public.food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null,
  name text not null,
  calories int not null,
  protein int default 0,
  carbs int default 0,
  fat int default 0,
  weight numeric, -- grams
  image_url text,
  meal_type text default 'snack', -- breakfast, lunch, dinner, snack
  created_at timestamptz default now()
);

alter table public.food_logs enable row level security;
create policy "Users can manage food logs" on public.food_logs for all using (auth.uid() = user_id);

-- 4. Weight History (for Charts)
create table public.weight_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  weight numeric not null,
  date date default CURRENT_DATE,
  created_at timestamptz default now()
);

alter table public.weight_history enable row level security;
create policy "Users can manage weight history" on public.weight_history for all using (auth.uid() = user_id);

-- 5. Trigger to Create Profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Fasting Sessions
create table public.fasting_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  start_time timestamptz not null default now(),
  end_time timestamptz not null,
  protocol text not null, -- e.g., '16:8'
  status text default 'active', -- 'active', 'completed', 'cancelled'
  created_at timestamptz default now()
);

alter table public.fasting_sessions enable row level security;
create policy "Users can manage their fasting sessions" on public.fasting_sessions for all using (auth.uid() = user_id);
