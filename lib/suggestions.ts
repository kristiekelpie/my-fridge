import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, Location, ShoppingCategory, Store } from '@/lib/types'
import { normalizeCategory } from '@/lib/types'

export interface FridgeItemSuggestion {
  id: string
  name: string
  category: Category
  location: Location
  notes: string | null
  use_count: number
  last_used_at: string
}

export interface ShoppingSuggestion {
  id: string
  name: string
  store: Store | null
  category: ShoppingCategory
  use_count: number
  last_used_at: string
}

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

export function filterByName<T extends { name: string; last_used_at: string }>(
  items: T[],
  query: string,
  limit = 8
): T[] {
  const sorted = [...items].sort(
    (a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime()
  )
  const q = query.trim().toLowerCase()
  if (!q) return sorted.slice(0, limit)
  return sorted.filter(item => item.name.toLowerCase().includes(q)).slice(0, limit)
}

export async function fetchFridgeSuggestions(
  supabase: SupabaseClient
): Promise<FridgeItemSuggestion[]> {
  const { data, error } = await supabase
    .from('fridge_item_suggestions')
    .select('*')
    .order('last_used_at', { ascending: false })
    .limit(100)

  if (error || !data) return []

  return data.map(row => ({
    ...row,
    category: normalizeCategory(row.category),
  }))
}

export async function fetchShoppingSuggestions(
  supabase: SupabaseClient
): Promise<ShoppingSuggestion[]> {
  const { data, error } = await supabase
    .from('shopping_suggestions')
    .select('*')
    .order('last_used_at', { ascending: false })
    .limit(100)

  if (error || !data) return []

  return data.map(row => ({
    ...row,
    category: row.category ?? 'food',
  }))
}

export async function upsertFridgeSuggestion(
  supabase: SupabaseClient,
  payload: {
    name: string
    category: Category
    location: Location
    notes?: string | null
  }
): Promise<void> {
  const name = payload.name.trim()
  if (!name) return

  const nameNormalized = normalizeName(name)
  const { data: existing } = await supabase
    .from('fridge_item_suggestions')
    .select('id, use_count')
    .eq('name_normalized', nameNormalized)
    .maybeSingle()

  const row = {
    name,
    name_normalized: nameNormalized,
    category: payload.category,
    location: payload.location,
    notes: payload.notes?.trim() || null,
    last_used_at: new Date().toISOString(),
  }

  if (existing) {
    await supabase
      .from('fridge_item_suggestions')
      .update({ ...row, use_count: existing.use_count + 1 })
      .eq('id', existing.id)
  } else {
    await supabase.from('fridge_item_suggestions').insert({ ...row, use_count: 1 })
  }
}

export async function upsertShoppingSuggestion(
  supabase: SupabaseClient,
  payload: {
    name: string
    store: Store | null
    category: ShoppingCategory
  }
): Promise<void> {
  const name = payload.name.trim()
  if (!name) return

  const nameNormalized = normalizeName(name)
  const { data: existing } = await supabase
    .from('shopping_suggestions')
    .select('id, use_count')
    .eq('name_normalized', nameNormalized)
    .maybeSingle()

  const row = {
    name,
    name_normalized: nameNormalized,
    store: payload.store,
    category: payload.category,
    last_used_at: new Date().toISOString(),
  }

  if (existing) {
    await supabase
      .from('shopping_suggestions')
      .update({ ...row, use_count: existing.use_count + 1 })
      .eq('id', existing.id)
  } else {
    await supabase.from('shopping_suggestions').insert({ ...row, use_count: 1 })
  }
}
