-- Add meal_categories column to nutrition_plans
alter table public.nutrition_plans 
add column if not exists meal_categories jsonb;

-- Update existing rows to have empty object (optional, prevents null issues)
update public.nutrition_plans 
set meal_categories = '{}'::jsonb 
where meal_categories is null;
