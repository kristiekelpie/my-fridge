-- Expand household item categories (run in Supabase SQL editor)

alter table household_items drop constraint if exists household_items_category_check;
alter table household_items add constraint household_items_category_check
  check (category in (
    'protein', 'vegetables', 'dairy', 'sauces', 'starch',
    'dry_goods', 'snacks', 'cooked_food', 'fruits', 'condiments', 'drinks',
    'alcohol', 'red_wine', 'white_wine', 'other'
  ));

alter table fridge_item_suggestions drop constraint if exists fridge_item_suggestions_category_check;
alter table fridge_item_suggestions add constraint fridge_item_suggestions_category_check
  check (category in (
    'protein', 'vegetables', 'dairy', 'sauces', 'starch',
    'dry_goods', 'snacks', 'cooked_food', 'fruits', 'condiments', 'drinks',
    'alcohol', 'red_wine', 'white_wine', 'other'
  ));
