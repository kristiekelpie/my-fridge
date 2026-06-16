-- Run this in your Supabase SQL editor to set up the schema

-- Create household_items table
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

-- Create meal_notes table
create table if not exists meal_notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text not null,
  content text not null
);

-- Create shopping_items table
create table if not exists shopping_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  store text check (store in ('Costco', 'Walmart', 'Albertsons', 'Any')),
  checked boolean default false not null
);

-- Enable Row Level Security but allow public (anon) access
alter table household_items enable row level security;
alter table meal_notes enable row level security;
alter table shopping_items enable row level security;

-- Public access policies (no login required)
create policy "Public can do everything on items"
  on household_items for all to anon
  using (true) with check (true);

create policy "Public can do everything on meal notes"
  on meal_notes for all to anon
  using (true) with check (true);

create policy "Public can do everything on shopping items"
  on shopping_items for all to anon
  using (true) with check (true);

-- Enable Realtime on all tables
alter publication supabase_realtime add table household_items;
alter publication supabase_realtime add table meal_notes;
alter publication supabase_realtime add table shopping_items;

-- Storage bucket for item photos
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "Anyone can upload photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'item-photos');

create policy "Photos are publicly readable"
  on storage.objects for select to public
  using (bucket_id = 'item-photos');

create policy "Anyone can delete photos"
  on storage.objects for delete to anon
  using (bucket_id = 'item-photos');

create policy "Anyone can update photos"
  on storage.objects for update to anon
  using (bucket_id = 'item-photos');

-- Trigger to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_household_items_updated_at
  before update on household_items
  for each row execute function update_updated_at();

create trigger update_meal_notes_updated_at
  before update on meal_notes
  for each row execute function update_updated_at();

create trigger update_shopping_items_updated_at
  before update on shopping_items
  for each row execute function update_updated_at();

-- Fridge door polaroids (single shared row)
create table if not exists fridge_door (
  id int primary key default 1 check (id = 1),
  upper_photo_url text,
  lower_photo_url text,
  updated_at timestamptz default now() not null
);

insert into fridge_door (id) values (1) on conflict (id) do nothing;

alter table fridge_door enable row level security;

create policy "Public can do everything on fridge_door"
  on fridge_door for all to anon
  using (true) with check (true);

alter publication supabase_realtime add table fridge_door;

create trigger update_fridge_door_updated_at
  before update on fridge_door
  for each row execute function update_updated_at();
