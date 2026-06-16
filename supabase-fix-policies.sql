-- Run ONLY if you already ran supabase-setup.sql and need to refresh policies.
-- On a NEW project, run supabase-setup.sql instead (this file will error if tables don't exist).

alter table fridge_door add column if not exists left_photo_url text;

-- Household item categories: rename + expand
update household_items set category = 'protein' where category = 'meat';
update household_items set category = 'sauces' where category = 'jarred_sauces';
alter table household_items drop constraint if exists household_items_category_check;
alter table household_items add constraint household_items_category_check
  check (category in ('protein', 'vegetables', 'dairy', 'sauces', 'starch', 'cooked_food', 'fruits', 'condiments', 'drinks', 'other'));

-- Shopping list: category + Other store
alter table shopping_items add column if not exists category text not null default 'food';
alter table shopping_items drop constraint if exists shopping_items_category_check;
alter table shopping_items add constraint shopping_items_category_check
  check (category in ('food', 'household', 'personal'));
alter table shopping_items drop constraint if exists shopping_items_store_check;
alter table shopping_items add constraint shopping_items_store_check
  check (store in ('Costco', 'Walmart', 'Albertsons', 'Any', 'Other'));

-- Suggestion history (autocomplete / re-add from past items)
create table if not exists fridge_item_suggestions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_normalized text not null unique,
  category text not null check (category in ('protein', 'vegetables', 'dairy', 'sauces', 'starch', 'cooked_food', 'fruits', 'condiments', 'drinks', 'other')),
  location text not null check (location in ('freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door')),
  notes text,
  photo_url text,
  use_count int not null default 1,
  last_used_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create table if not exists shopping_suggestions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_normalized text not null unique,
  store text check (store in ('Costco', 'Walmart', 'Albertsons', 'Any', 'Other')),
  category text not null default 'food' check (category in ('food', 'household', 'personal')),
  use_count int not null default 1,
  last_used_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table fridge_item_suggestions enable row level security;
alter table shopping_suggestions enable row level security;

drop policy if exists "Public can do everything on fridge suggestions" on fridge_item_suggestions;
create policy "Public can do everything on fridge suggestions"
  on fridge_item_suggestions for all using (true) with check (true);

drop policy if exists "Public can do everything on shopping suggestions" on shopping_suggestions;
create policy "Public can do everything on shopping suggestions"
  on shopping_suggestions for all using (true) with check (true);

-- Photo on suggestion history
alter table fridge_item_suggestions add column if not exists photo_url text;

update fridge_item_suggestions s
set photo_url = hi.photo_url
from (
  select distinct on (lower(trim(name))) lower(trim(name)) as nn, photo_url
  from household_items
  where photo_url is not null
  order by lower(trim(name)), updated_at desc
) hi
where s.name_normalized = hi.nn and (s.photo_url is null or s.photo_url = '');

-- Seed from existing items (safe to re-run)
insert into fridge_item_suggestions (name, name_normalized, category, location, notes, photo_url, use_count, last_used_at)
select distinct on (lower(trim(name)))
  trim(name), lower(trim(name)), category, location, notes, photo_url, 1, updated_at
from household_items
order by lower(trim(name)), updated_at desc
on conflict (name_normalized) do nothing;

insert into shopping_suggestions (name, name_normalized, store, category, use_count, last_used_at)
select distinct on (lower(trim(name)))
  trim(name), lower(trim(name)), store, category, 1, updated_at
from shopping_items
order by lower(trim(name)), updated_at desc
on conflict (name_normalized) do nothing;

insert into fridge_door (id) values (1) on conflict (id) do nothing;

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
