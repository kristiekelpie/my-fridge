-- Add optional photo to meal notes (run in Supabase SQL Editor)
alter table meal_notes add column if not exists photo_url text;
