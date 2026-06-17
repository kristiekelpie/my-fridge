-- Add fourth door polaroid slot (lower-right on fridge door)
alter table fridge_door add column if not exists right_photo_url text;
