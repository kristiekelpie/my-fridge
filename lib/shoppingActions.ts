import type { SupabaseClient } from '@supabase/supabase-js'
import type { ShoppingItem, Category, Location } from '@/lib/types'
import { fetchFridgeSuggestionByName, upsertFridgeSuggestion } from '@/lib/suggestions'

/** When a FOOD item is checked off, add it to the master fridge inventory. */
export async function addPurchasedFoodToInventory(
  supabase: SupabaseClient,
  name: string
): Promise<{ error: string | null }> {
  const history = await fetchFridgeSuggestionByName(supabase, name)

  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)

  const payload = {
    name: name.trim(),
    category: (history?.category ?? 'other') as Category,
    expiry_date: expiry.toISOString().slice(0, 10),
    location: (history?.location ?? 'shelf1') as Location,
    notes: history?.notes ?? 'Added from shopping list',
    photo_url: history?.photo_url ?? null,
  }

  const { error } = await supabase.from('household_items').insert(payload)

  if (!error) {
    await upsertFridgeSuggestion(supabase, payload)
  }

  return { error: error?.message ?? null }
}

export async function toggleShoppingItemChecked(
  supabase: SupabaseClient,
  item: ShoppingItem
): Promise<{ error: string | null }> {
  const newChecked = !item.checked

  const { error: updateError } = await supabase
    .from('shopping_items')
    .update({ checked: newChecked })
    .eq('id', item.id)

  if (updateError) return { error: updateError.message }

  if (newChecked && item.category === 'food') {
    return addPurchasedFoodToInventory(supabase, item.name)
  }

  return { error: null }
}
