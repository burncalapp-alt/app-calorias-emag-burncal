-- Create water_logs table
create table public.water_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount int not null, -- ml
  created_at timestamptz default now()
);

-- RLS for water_logs
alter table public.water_logs enable row level security;
create policy "Users can manage water logs" on public.water_logs for all using (auth.uid() = user_id);
