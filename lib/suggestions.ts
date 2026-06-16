import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, Location, ShoppingCategory, Store } from '@/lib/types'
import { normalizeCategory, CATEGORIES } from '@/lib/types'

export interface FridgeItemSuggestion {
  id: string
  name: string
  category: Category
  location: Location
  notes: string | null
  photo_url: string | null
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

export function matchesSuggestion(name: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const n = name.toLowerCase()
  if (n[0] !== q[0]) return false

  if (n.startsWith(q)) return true

  const nameWords = n.split(/\s+/).filter(Boolean)
  const queryWords = q.split(/\s+/).filter(Boolean)

  if (nameWords.some(word => word.startsWith(q))) return true

  return queryWords.some(qWord =>
    nameWords.some(nWord => nWord.startsWith(qWord) || nWord === qWord)
  )
}

export function filterByName<T extends { name: string; last_used_at: string }>(
  items: T[],
  query: string,
  limit = 8
): T[] {
  const sorted = [...items].sort(
    (a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime()
  )
  const q = query.trim()
  if (!q) return sorted.slice(0, limit)
  return sorted.filter(item => matchesSuggestion(item.name, q)).slice(0, limit)
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
    photo_url: row.photo_url ?? null,
  }))
}

export function groupFridgeSuggestionsByCategory(
  items: FridgeItemSuggestion[]
): { category: Category; items: FridgeItemSuggestion[] }[] {
  const byCategory = new Map<Category, FridgeItemSuggestion[]>()

  for (const item of items) {
    const cat = normalizeCategory(item.category)
    const list = byCategory.get(cat) ?? []
    list.push({ ...item, category: cat })
    byCategory.set(cat, list)
  }

  return CATEGORIES
    .filter(cat => (byCategory.get(cat)?.length ?? 0) > 0)
    .map(category => ({
      category,
      items: (byCategory.get(category) ?? []).sort(
        (a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime()
      ),
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

export async function fetchFridgeSuggestionByName(
  supabase: SupabaseClient,
  name: string
): Promise<FridgeItemSuggestion | null> {
  const nameNormalized = normalizeName(name)
  if (!nameNormalized) return null

  const { data, error } = await supabase
    .from('fridge_item_suggestions')
    .select('*')
    .eq('name_normalized', nameNormalized)
    .maybeSingle()

  if (error || !data) return null

  return {
    ...data,
    category: normalizeCategory(data.category),
    photo_url: data.photo_url ?? null,
  }
}

export async function upsertFridgeSuggestion(
  supabase: SupabaseClient,
  payload: {
    name: string
    category: Category
    location: Location
    notes?: string | null
    photo_url?: string | null
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
    photo_url: payload.photo_url?.trim() || null,
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
