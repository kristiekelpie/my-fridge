# Fridge Tracker — Setup Guide

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project. Pick a region close to you. Free tier is fine.

## 2. Run the database schema

In your Supabase dashboard → SQL Editor, paste and run the contents of `supabase-schema.sql`.

This creates:
- `household_items` — fridge/freezer/pantry items
- `meal_notes` — meal plan notes
- `shopping_items` — shopping list
- Storage bucket `item-photos` for photos
- Realtime enabled on all tables
- Public access policies (no login needed)

## 3. Fill in your env vars

Copy `.env.local.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=     # Project URL from Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # anon/public key from Supabase → Settings → API
```

## 4. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your laptop, or `http://<your-mac-ip>:3000` on your phone (same WiFi).

## Deploy (optional, for anywhere access)

```bash
npx vercel
```

Add the two env vars in Vercel's dashboard → Settings → Environment Variables.

## How sharing works

Both phones connect to the same Supabase project. Supabase Realtime pushes updates instantly — add an item on one phone and it appears on the other within a second, no refresh needed.

## ⚠️ Security note

Anyone with the URL can view and edit everything (there's no login). For a personal shared fridge, that's fine — just don't share the link publicly. If you deploy to Vercel and want a tiny bit of obscurity, use a long random subdomain.
