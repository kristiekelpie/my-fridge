import type { SupabaseClient } from '@supabase/supabase-js'
import type { ShoppingItem } from '@/lib/types'

/** When a FOOD item is checked off, add it to the master fridge inventory. */
export async function addPurchasedFoodToInventory(
  supabase: SupabaseClient,
  name: string
): Promise<{ error: string | null }> {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)

  const { error } = await supabase.from('household_items').insert({
    name: name.trim(),
    category: 'other',
    expiry_date: expiry.toISOString().slice(0, 10),
    location: 'shelf1',
    notes: 'Added from shopping list',
  })

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
