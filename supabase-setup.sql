-- ═══════════════════════════════════════════════════════════════════
-- FRIDGE TRACKER — full Supabase setup (run this ONCE on a new project)
-- Paste into Supabase → SQL Editor → Run
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS where needed
-- ═══════════════════════════════════════════════════════════════════

-- ── Tables ────────────────────────────────────────────────────────

create table if not exists household_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  category text not null check (category in ('meat', 'vegetables', 'dairy', 'jarred_sauces', 'drinks', 'other')),
  expiry_date date not null,
  location text not null check (location in ('freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door')),
  photo_url text,
  notes text
);

create table if not exists meal_notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text not null,
  content text not null
);

create table if not exists shopping_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  store text check (store in ('Costco', 'Walmart', 'Albertsons', 'Any', 'Other')),
  category text not null default 'food' check (category in ('food', 'household', 'personal')),
  checked boolean default false not null
);

create table if not exists fridge_door (
  id int primary key default 1 check (id = 1),
  upper_photo_url text,
  lower_photo_url text,
  left_photo_url text,
  updated_at timestamptz default now() not null
);

alter table fridge_door add column if not exists left_photo_url text;

insert into fridge_door (id) values (1) on conflict (id) do nothing;

-- ── Row Level Security ──────────────────────────────────────────────

alter table household_items enable row level security;
alter table meal_notes enable row level security;
alter table shopping_items enable row level security;
alter table fridge_door enable row level security;

drop policy if exists "Public can do everything on items" on household_items;
create policy "Public can do everything on items"
  on household_items for all using (true) with check (true);

drop policy if exists "Public can do everything on meal notes" on meal_notes;
create policy "Public can do everything on meal notes"
  on meal_notes for all using (true) with check (true);

drop policy if exists "Public can do everything on shopping items" on shopping_items;
create policy "Public can do everything on shopping items"
  on shopping_items for all using (true) with check (true);

drop policy if exists "Public can do everything on fridge_door" on fridge_door;
create policy "Public can do everything on fridge_door"
  on fridge_door for all using (true) with check (true);

-- ── Realtime ────────────────────────────────────────────────────────

do $$ begin
  alter publication supabase_realtime add table household_items;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table meal_notes;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table shopping_items;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table fridge_door;
exception when duplicate_object then null;
end $$;

-- ── Photo storage bucket ────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload photos" on storage.objects;
drop policy if exists "Photos are publicly readable" on storage.objects;
drop policy if exists "Anyone can delete photos" on storage.objects;
drop policy if exists "Anyone can update photos" on storage.objects;

create policy "Anyone can upload photos"
  on storage.objects for insert with check (bucket_id = 'item-photos');

create policy "Photos are publicly readable"
  on storage.objects for select using (bucket_id = 'item-photos');

create policy "Anyone can delete photos"
  on storage.objects for delete using (bucket_id = 'item-photos');

create policy "Anyone can update photos"
  on storage.objects for update using (bucket_id = 'item-photos');

-- ── Auto-update timestamps ──────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_household_items_updated_at on household_items;
create trigger update_household_items_updated_at
  before update on household_items
  for each row execute function update_updated_at();

drop trigger if exists update_meal_notes_updated_at on meal_notes;
create trigger update_meal_notes_updated_at
  before update on meal_notes
  for each row execute function update_updated_at();

drop trigger if exists update_shopping_items_updated_at on shopping_items;
create trigger update_shopping_items_updated_at
  before update on shopping_items
  for each row execute function update_updated_at();

drop trigger if exists update_fridge_door_updated_at on fridge_door;
create trigger update_fridge_door_updated_at
  before update on fridge_door
  for each row execute function update_updated_at();
