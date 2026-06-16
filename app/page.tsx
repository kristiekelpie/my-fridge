'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HouseholdItem } from '@/lib/types'
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

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('household_items')
      .select('*')
      .order('expiry_date', { ascending: true })
    if (data) setItems(data)
    setLoading(false)
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
    await supabase.from('household_items').delete().eq('id', id)
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
      {/* Slim editorial top bar */}
      <header className="flex items-center px-5 py-3 border-b border-stone-400/40 shrink-0">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-700">
          The Kitchen Log
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md active:bg-stone-200 border border-stone-300"
            aria-label="Open menu"
          >
            <Menu size={18} className="text-stone-700" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
