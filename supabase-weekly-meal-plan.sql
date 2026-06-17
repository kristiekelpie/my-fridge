-- Add shared weekly meal planner storage (run in Supabase SQL Editor)
create table if not exists weekly_meal_plan (
  id int primary key default 1 check (id = 1),
  plan jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now() not null
);

insert into weekly_meal_plan (id, plan)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table weekly_meal_plan enable row level security;

drop policy if exists "Public can do everything on weekly meal plan" on weekly_meal_plan;
create policy "Public can do everything on weekly meal plan"
  on weekly_meal_plan for all using (true) with check (true);

drop trigger if exists update_weekly_meal_plan_updated_at on weekly_meal_plan;
create trigger update_weekly_meal_plan_updated_at
  before update on weekly_meal_plan
  for each row execute function update_updated_at();
