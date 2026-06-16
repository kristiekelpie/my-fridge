'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { HouseholdItem, normalizeItem } from '@/lib/types'
import FridgeView from '@/components/fridge/FridgeView'
import ItemForm from '@/components/items/ItemForm'
import Sidebar from '@/components/sidebar/Sidebar'
import { Plus, Menu } from 'lucide-react'

export default function HomePage() {
  const supabase = createClient()
  const [items, setItems] = useState<HouseholdItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<HouseholdItem | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const timeoutMs = 8000
    try {
      const result = await Promise.race([
        supabase
          .from('household_items')
          .select('*')
          .order('expiry_date', { ascending: true }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
        ),
      ])

      const { data, error } = result
      if (error) {
        console.error('Failed to load items:', error.message)
        setFetchError(error.message)
      } else {
        setItems((data ?? []).map(normalizeItem))
        setFetchError(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach Supabase'
      console.error('Failed to load items:', message)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchItems()

    const channel = supabase
      .channel('items-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'household_items' },
        fetchItems
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchItems, supabase])

  async function handleDelete(id: string) {
    const previous = items
    setItems(prev => prev.filter(i => i.id !== id))
    const { error } = await supabase.from('household_items').delete().eq('id', id)
    if (error) {
      console.error('Delete failed:', error.message)
      setItems(previous)
    }
  }

  function handleEdit(item: HouseholdItem) {
    setEditItem(item)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditItem(null)
  }

  return (
    <div className="fixed inset-0 flex flex-col paper">
      {/* Menu icon only — no banner */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed z-40 p-2 text-stone-600 active:text-stone-900 active:scale-95 transition-transform"
        style={{
          top: 'max(0.5rem, env(safe-area-inset-top, 0px))',
          right: 'max(0.5rem, env(safe-area-inset-right, 0px))',
        }}
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={2} />
      </button>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {!isSupabaseConfigured() && (
          <div className="shrink-0 mx-5 mt-3 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg font-mono text-[10px] text-amber-900 leading-snug">
            Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.
          </div>
        )}
        {fetchError && (
          <div className="shrink-0 mx-5 mt-3 px-3 py-2 bg-red-50 border border-red-300 rounded-lg font-mono text-[10px] text-red-900 leading-snug">
            Could not load fridge items: {fetchError}
          </div>
        )}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-stone-500 animate-pulse">
              Loading…
            </div>
          </div>
        ) : (
          <FridgeView items={items} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed z-30 w-14 h-14 bg-stone-900 text-stone-50 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform border-2 border-stone-50"
        style={{
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
          bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          right: 'max(1rem, env(safe-area-inset-right, 0px))',
        }}
        aria-label="Add item"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Item form modal */}
      {showForm && (
        <ItemForm
          initialItem={editItem ?? undefined}
          onSave={() => { handleFormClose(); fetchItems() }}
          onClose={handleFormClose}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}
