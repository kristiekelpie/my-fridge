'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { HouseholdItem, normalizeItem, isExpiringWithinDays, EXPIRING_SOON_DAYS, StorageArea } from '@/lib/types'
import FridgeView from '@/components/fridge/FridgeView'
import ItemForm from '@/components/items/ItemForm'
import HistoryView from '@/components/history/HistoryView'
import MasterInventoryView from '@/components/fridge/MasterInventoryView'
import ItemListByCategory from '@/components/fridge/ItemListByCategory'
import ItemListByStorageArea from '@/components/fridge/ItemListByStorageArea'
import Sidebar from '@/components/sidebar/Sidebar'
import StorageSwiper from '@/components/storage/StorageSwiper'
import { DoorPhotosProvider } from '@/components/fridge/DoorPhotosContext'
import CabinetHomeView from '@/components/storage/CabinetHomeView'
import { filterItemsByArea, STORAGE_AREA_LABELS } from '@/lib/storageAreas'
import { warmItemPhotoCache } from '@/lib/itemPhotoCache'
import { Plus, Menu } from 'lucide-react'

type FullPageView = 'history' | 'inventory' | 'master-inventory' | 'expiring'

export default function HomePage() {
  const supabase = createClient()
  const [items, setItems] = useState<HouseholdItem[]>([])
  const [activeArea, setActiveArea] = useState<StorageArea>('fridge')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<HouseholdItem | null>(null)
  const [formPrefill, setFormPrefill] = useState<Partial<HouseholdItem> | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullPageView, setFullPageView] = useState<FullPageView | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [kitchenNotesOpen, setKitchenNotesOpen] = useState(false)

  const areaItems = filterItemsByArea(items, activeArea)
  const totalItems = items.length
  const allExpiringItems = items.filter(i => isExpiringWithinDays(i.expiry_date, EXPIRING_SOON_DAYS))
  const allExpiringCount = allExpiringItems.length

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

  useEffect(() => {
    warmItemPhotoCache(items.map(i => i.photo_url))
  }, [items])

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
    setFormPrefill(undefined)
  }

  function handleAddHistoryToFridge(item: Partial<HouseholdItem>) {
    setFullPageView(null)
    setEditItem(null)
    setFormPrefill({ ...item, storage_area: activeArea })
    setShowForm(true)
  }

  function openFullPageView(view: FullPageView) {
    setSidebarOpen(false)
    setFullPageView(view)
  }

  const inventoryTitle =
    activeArea === 'fridge' ? 'Inventory' : `${STORAGE_AREA_LABELS[activeArea]} Inventory`

  const sharedViewProps = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    onOpenInventory: () => openFullPageView('inventory'),
    onOpenExpiring: () => openFullPageView('expiring'),
  }

  const showAddButton = !showForm && !kitchenNotesOpen

  return (
    <div className="fixed inset-0 flex flex-col paper">
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

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {!isSupabaseConfigured() && (
          <div className="shrink-0 mx-5 mt-3 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg font-mono text-[10px] text-amber-900 leading-snug">
            Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.
          </div>
        )}
        {fetchError && (
          <div className="shrink-0 mx-5 mt-3 px-3 py-2 bg-red-50 border border-red-300 rounded-lg font-mono text-[10px] text-red-900 leading-snug">
            Could not load items: {fetchError}
          </div>
        )}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-stone-500 animate-pulse">
              Loading…
            </div>
          </div>
        ) : fullPageView === 'history' ? (
          <HistoryView
            onBack={() => setFullPageView(null)}
            onAddToFridge={handleAddHistoryToFridge}
          />
        ) : fullPageView === 'master-inventory' ? (
          <MasterInventoryView
            items={items}
            onBack={() => setFullPageView(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : fullPageView === 'inventory' ? (
          <ItemListByCategory
            title={inventoryTitle}
            subtitle={`${areaItems.length} item${areaItems.length !== 1 ? 's' : ''} — grouped by category`}
            items={areaItems}
            onBack={() => setFullPageView(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : fullPageView === 'expiring' ? (
          <ItemListByStorageArea
            title="Expiring Soon"
            subtitle={`${allExpiringCount} item${allExpiringCount !== 1 ? 's' : ''} — all storage areas`}
            items={allExpiringItems}
            onBack={() => setFullPageView(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <DoorPhotosProvider>
            <StorageSwiper activeArea={activeArea} onAreaChange={setActiveArea}>
              <FridgeView
                items={filterItemsByArea(items, 'fridge')}
                showSwipeHint
                onNotesOpenChange={setKitchenNotesOpen}
                {...sharedViewProps}
              />
              <CabinetHomeView area="pantry" items={filterItemsByArea(items, 'pantry')} {...sharedViewProps} />
              <CabinetHomeView area="cupboard" items={filterItemsByArea(items, 'cupboard')} {...sharedViewProps} />
              <CabinetHomeView area="wine_fridge" items={filterItemsByArea(items, 'wine_fridge')} {...sharedViewProps} />
            </StorageSwiper>
          </DoorPhotosProvider>
        )}
      </main>

      {showAddButton && (
      <button
        onClick={() => setShowForm(true)}
        className="fixed z-30 w-[72px] h-[72px] bg-stone-900 text-stone-50 rounded-full flex items-center justify-center active:scale-95 transition-transform border-[3px] border-stone-50"
        style={{
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28), 0 2px 6px rgba(0,0,0,0.15)',
          bottom: 'calc(max(2.25rem, env(safe-area-inset-bottom, 0px) + 1.25rem))',
          right: 'max(1.25rem, env(safe-area-inset-right, 0px))',
        }}
        aria-label="Add item"
      >
        <Plus size={34} strokeWidth={2.75} />
      </button>
      )}

      {showForm && (
        <ItemForm
          key={editItem?.id ?? `prefill-${formPrefill?.name ?? 'new'}-${activeArea}`}
          initialItem={editItem ?? formPrefill}
          storageArea={editItem?.storage_area ?? formPrefill?.storage_area ?? activeArea}
          onSave={() => { handleFormClose(); fetchItems() }}
          onClose={handleFormClose}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        itemCount={totalItems}
        expiringCount={allExpiringCount}
        onOpenInventory={() => openFullPageView('master-inventory')}
        onOpenExpiring={() => openFullPageView('expiring')}
        onOpenHistory={() => openFullPageView('history')}
      />
    </div>
  )
}
