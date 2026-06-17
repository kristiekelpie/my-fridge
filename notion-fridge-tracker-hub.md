# Fridge Tracker Hub

## Overview
Fridge Tracker is a mobile-first kitchen inventory app built with Next.js, Supabase, and a custom fridge/cabinet interface. It tracks household items across the fridge, freezer, pantry, cupboard, and wine fridge, with expiry-aware inventory views, photo uploads, kitchen notes, shopping lists, and a personalized fridge door.

## Current Build
- Storage navigation: swipe through Fridge, Pantry, Cupboard, and Wine Fridge panels.
- Fridge interaction: tap the fridge to open freezer/fridge compartments, then view editable item lists.
- Inventory: master inventory across all storage areas, scoped inventory per active area, category grouping with Cooked Food first, and storage sub-headers when relevant.
- Expiring Soon: all expiring items grouped by storage area and sorted earliest expiry first.
- Item form: add/edit items with storage choices for Freezer, Fridge, Pantry, Cupboard, and Wine Fridge, plus category, expiry date, notes, and photo.
- Expiry defaults: freezer defaults to 6 months, cooked food defaults to 4 days unless stored in freezer.
- Photo handling: meal note uploads resize to 1080px, item photos and door polaroids resize to 500px.
- Kitchen notes: meal notes and shopping list are accessible from fridge notes and sidebar; meal notes support add, edit, delete, and photo upload.
- Weekly meal planner: breakfast/lunch/dinner plan for Mon–Sun, accessible from a fridge-door magnet and sidebar; per-day edit/save with local storage and Supabase sync.
- Shopping list: grouped by store with checked/unchecked state and suggestion history.
- Sidebar: quick access ordered by priority — Expiring Soon, Master Inventory, Shopping List, Weekly Meal Planner, Meal Notes, and History.
- History/suggestions: saved item suggestions support fast re-adding from history.
- Fridge door personalization: four uploadable polaroids, paper notes, weekly meal planner magnet, letter magnets, heart magnets, and a cut-out F-15 magnet.
- PWA/app icon: manifest and custom fridge app icon with heart magnet are in place.

## Recent Shipped Milestones
- `83d0293` Add weekly meal planner, refresh app icon, and polish kitchen UX.
- `f1f1a09` Add sidebar meal note editing and update photo resize limits.
- `bc49803` Add F-15 door magnet and refine inventory and expiring lists.
- `aa29da4` Fix polaroid photo crop by portaling the crop modal to the body.
- `ac14a85` Polish fridge door layout, sidebar UX, and meal note photo quality.

## Specs
### Spec: Storage Areas
Items can live in Fridge, Freezer, Pantry, Cupboard, or Wine Fridge. Freezer is modeled as a fridge storage area with `location = freezer`, while pantry/cupboard/wine fridge use single main compartments.

### Spec: Inventory Views
Master Inventory shows all areas with category grouping and storage sub-headers. Scoped inventory shows the active area only. Cooked Food appears first when present. Items inside groups are sorted by expiry date.

### Spec: Expiring Soon
Expiring Soon includes items with expiry within 4 days. It does not show category headers. It groups by storage area and sorts items earliest expiry first.

### Spec: Item Add/Edit
The item form supports name suggestions, storage selection, category selection, expiry date, notes, and photo upload. New freezer items default to a 6-month expiry. New cooked food defaults to 4 days unless in freezer.

### Spec: Photos
Meal note photos are stored at up to 1080px. Inventory item photos and door polaroids are stored at up to 500px. Meal notes render the stored photo URL directly for better quality.

### Spec: Kitchen Notes
Meal notes can be created, edited, deleted, and given a photo from both the fridge-door notes flow and the sidebar menu.

### Spec: Shopping List
Shopping items support store, category, checked state, delete, and suggestions.

### Spec: Weekly Meal Planner
Weekly meal planner stores breakfast, lunch, and dinner for each day Mon–Sun. Users tap a day to edit inline, save with a tick, cancel with X, or clear with trash. Data persists locally and syncs to Supabase `weekly_meal_plan`. Accessible from the fridge-door magnet and sidebar full-page view. Storage swipe navigation locks while kitchen notes or the planner overlay is open.

### Spec: Fridge Door
The closed fridge supports uploadable polaroids, paper notes, a weekly meal planner magnet, magnet letters, heart magnets, and a cut-out F-15 magnet asset.

## Operational Setup
- Supabase env vars must be configured: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- SQL migrations that may be needed in Supabase:
  - `supabase-storage-areas.sql`
  - `supabase-fridge-door-right-photo.sql`
  - `supabase-meal-notes-photo.sql`
  - `supabase-weekly-meal-plan.sql`
- Latest GitHub remote: `https://github.com/kristiekelpie/my-fridge.git`

## Suggested Notion Database Views
- Board by Status
- Table by Priority
- Feature/Bug filtered view
- Backlog view for Not Started and Backlog items
- Recently shipped view for Done items

## Linked Database
Import or mirror `notion-fridge-tracker-tasks-bugs.csv` as the tasks/bugs database.
