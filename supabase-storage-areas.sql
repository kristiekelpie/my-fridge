-- Run in Supabase SQL editor (required for saving items after storage-area update)

alter table household_items
  add column if not exists storage_area text not null default 'fridge';

alter table household_items
  drop constraint if exists household_items_location_check;

alter table household_items
  add constraint household_items_location_check check (
    location in (
      'freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door',
      'pantry_main', 'cupboard_main', 'wine_main',
      'pantry_top', 'pantry_middle', 'pantry_bottom', 'pantry_basket',
      'cupboard_upper', 'cupboard_lower', 'cupboard_spice',
      'wine_top', 'wine_middle', 'wine_bottom', 'wine_door'
    )
  );

alter table household_items
  drop constraint if exists household_items_storage_area_check;

alter table household_items
  add constraint household_items_storage_area_check check (
    storage_area in ('fridge', 'pantry', 'cupboard', 'wine_fridge')
  );

alter table fridge_item_suggestions
  drop constraint if exists fridge_item_suggestions_location_check;

alter table fridge_item_suggestions
  add constraint fridge_item_suggestions_location_check check (
    location in (
      'freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door',
      'pantry_main', 'cupboard_main', 'wine_main',
      'pantry_top', 'pantry_middle', 'pantry_bottom', 'pantry_basket',
      'cupboard_upper', 'cupboard_lower', 'cupboard_spice',
      'wine_top', 'wine_middle', 'wine_bottom', 'wine_door'
    )
  );
