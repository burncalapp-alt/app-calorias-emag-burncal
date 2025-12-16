-- Add date column to water_logs
alter table public.water_logs 
add column if not exists date date default CURRENT_DATE;

-- Add date column to meals
alter table public.meals 
add column if not exists date date default CURRENT_DATE; 
-- (Assuming 'meals' corresponds to the table we are using, based on previous analysis)

-- Update existing records to have data based on created_at
update public.water_logs set date = created_at::date where date is null;
update public.meals set date = created_at::date where date is null;
