'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HouseholdItem } from '@/lib/types'
import {
  fetchFridgeSuggestions,
  groupFridgeSuggestionsByCategory,
  upsertFridgeSuggestion,
  upsertShoppingSuggestion,
  type FridgeItemSuggestion,
} from '@/lib/suggestions'
import HistoryItemCard from '@/components/items/HistoryItemCard'
import { warmItemPhotoCache } from '@/lib/itemPhotoCache'
import CategoryListPage from '@/components/fridge/CategoryListPage'
import CollapsibleCategorySection from '@/components/fridge/CollapsibleCategorySection'

interface Props {
  onBack: () => void
  onAddToFridge: (item: Partial<HouseholdItem>) => void
}

export default function HistoryView({ onBack, onAddToFridge }: Props) {
  const supabase = createClient()
  const [historyItems, setHistoryItems] = useState<FridgeItemSuggestion[]>([])
  const [selected, setSelected] = useState<FridgeItemSuggestion | null>(null)
  const [busy, setBusy] = useState(false)

  const fetchHistory = useCallback(async () => {
    const data = await fetchFridgeSuggestions(supabase)
    setHistoryItems(data)
  }, [supabase])

  useEffect(() => {
    fetchHistory()

    const sub = supabase
      .channel('history-view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fridge_item_suggestions' }, fetchHistory)
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [fetchHistory, supabase])

  useEffect(() => {
    warmItemPhotoCache(historyItems.map(i => i.photo_url))
  }, [historyItems])

  const groups = groupFridgeSuggestionsByCategory(historyItems)

  function handleAddToFridge(item: FridgeItemSuggestion) {
    onAddToFridge({
      name: item.name,
      category: item.category,
      location: item.location,
      notes: item.notes,
      photo_url: item.photo_url,
    })
    setSelected(null)
  }

  async function handleAddToShopping(item: FridgeItemSuggestion) {
    setBusy(true)
    await supabase.from('shopping_items').insert({
      name: item.name,
      store: 'Any',
      category: 'food',
      checked: false,
    })
    await upsertFridgeSuggestion(supabase, {
      name: item.name,
      category: item.category,
      location: item.location,
      notes: item.notes,
      photo_url: item.photo_url,
    })
    await upsertShoppingSuggestion(supabase, {
      name: item.name,
      store: 'Any',
      category: 'food',
    })
    setBusy(false)
    setSelected(null)
  }

  async function handleDeleteHistoryItem(item: FridgeItemSuggestion) {
    const previous = historyItems
    setBusy(true)
    setHistoryItems(items => items.filter(historyItem => historyItem.id !== item.id))
    setSelected(null)
    const { error } = await supabase
      .from('fridge_item_suggestions')
      .delete()
      .eq('id', item.id)
    if (error) setHistoryItems(previous)
    setBusy(false)
  }

  return (
    <CategoryListPage
      title="History"
      subtitle={`${historyItems.length} item${historyItems.length !== 1 ? 's' : ''} — grouped by category`}
      onBack={onBack}
      isEmpty={groups.length === 0}
      footer={
        selected ? (
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/25">
            <div className="bg-white border-t border-stone-300 p-5 space-y-2">
              {selected.photo_url && (
                <div className="w-16 h-16 rounded-md overflow-hidden border border-stone-300 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.photo_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="font-mono text-sm font-semibold text-stone-800 truncate">{selected.name}</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleAddToFridge(selected)}
                className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Add to Fridge
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleAddToShopping(selected)}
                className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Add to Shopping List
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDeleteHistoryItem(selected)}
                className="w-full bg-red-100 text-red-800 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 active:bg-red-200"
              >
                Delete from History
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setSelected(null)}
                className="w-full border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : undefined
      }
    >
      {groups.map(({ category, items: groupItems }) => (
        <CollapsibleCategorySection key={category} category={category} itemCount={groupItems.length}>
          {groupItems.map(item => (
            <HistoryItemCard
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
            />
          ))}
        </CollapsibleCategorySection>
      ))}
    </CategoryListPage>
  )
}
