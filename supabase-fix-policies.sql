-- Run ONLY if you already ran supabase-setup.sql and need to refresh policies.
-- On a NEW project, run supabase-setup.sql instead (this file will error if tables don't exist).

alter table fridge_door add column if not exists left_photo_url text;

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
