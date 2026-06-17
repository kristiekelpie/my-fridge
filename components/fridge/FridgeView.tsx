'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HouseholdItem, MealNote, ShoppingItem, isExpiringWithinDays, EXPIRING_SOON_DAYS } from '@/lib/types'
import FridgeClosed from './FridgeClosed'
import FridgeInteriorOpen, { type FridgeSection } from './FridgeInteriorOpen'
import ItemListByCategory from './ItemListByCategory'
import KitchenNotesView from '@/components/kitchen/KitchenNotesView'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { useDoorPhotos } from './DoorPhotosContext'
import { FRIDGE_SECTION_LABELS } from '@/lib/storageAreas'
import {
  ExpiringStamp,
  InstockStamp,
  SwipeHint,
  TapToOpenDesktop,
  TapToOpenMobile,
} from '@/components/storage/StorageStamps'
import { useStoragePanelActive } from '@/components/storage/StoragePanelContext'

interface Props {
  items: HouseholdItem[]
  showSwipeHint?: boolean
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
  onOpenInventory: () => void
  onOpenExpiring: () => void
  onNotesOpenChange?: (open: boolean) => void
}

const FRIDGE_HEIGHT_CLASS =
  'h-[min(calc(100dvh-6.5rem),calc(100dvh-env(safe-area-inset-bottom)-6.5rem),760px)] sm:h-[min(calc(100dvh-5rem),calc(100dvh-env(safe-area-inset-bottom)-5rem),640px)]'

function filterBySection(items: HouseholdItem[], section: FridgeSection) {
  return section === 'freezer'
    ? items.filter(i => i.location === 'freezer')
    : items.filter(i => i.location !== 'freezer')
}

export default function FridgeView({
  items,
  showSwipeHint = false,
  onEdit,
  onDelete,
  onOpenInventory,
  onOpenExpiring,
  onNotesOpenChange,
}: Props) {
  const supabase = createClient()
  const isActivePanel = useStoragePanelActive()
  const { photos, uploadPhoto } = useDoorPhotos()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<FridgeSection | null>(null)
  const [kitchenNotesOpen, setKitchenNotesOpen] = useState(false)
  const [notes, setNotes] = useState<MealNote[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])

  const freezerCount = items.filter(i => i.location === 'freezer').length
  const fridgeCount = items.filter(i => i.location !== 'freezer').length
  const totalItems = items.length
  const expiringCount = items.filter(i => isExpiringWithinDays(i.expiry_date, EXPIRING_SOON_DAYS)).length

  const fetchNotes = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const { data } = await supabase
      .from('meal_notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setNotes(data)
  }, [supabase])

  const fetchShopping = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setShopping(data.map(row => ({ ...row, category: row.category ?? 'food' })))
  }, [supabase])

  useEffect(() => {
    if (!isActivePanel) return

    fetchNotes()
    fetchShopping()

    if (!isSupabaseConfigured()) return

    const notesChannel = supabase
      .channel('fridge-paper-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_notes' }, fetchNotes)
      .subscribe()

    const shoppingChannel = supabase
      .channel('fridge-paper-shopping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, fetchShopping)
      .subscribe()

    return () => {
      supabase.removeChannel(notesChannel)
      supabase.removeChannel(shoppingChannel)
    }
  }, [fetchNotes, fetchShopping, isActivePanel, supabase])

  useEffect(() => {
    onNotesOpenChange?.(kitchenNotesOpen && isActivePanel)
  }, [kitchenNotesOpen, isActivePanel, onNotesOpenChange])

  function handleSectionClick(section: FridgeSection) {
    setSelectedSection(section)
  }

  function handleBackFromSection() {
    setSelectedSection(null)
  }

  function handleCloseFridge() {
    setIsOpen(false)
  }

  if (kitchenNotesOpen) {
    return <KitchenNotesView onBack={() => setKitchenNotesOpen(false)} />
  }

  if (selectedSection) {
    const sectionItems = filterBySection(items, selectedSection)
    const title = FRIDGE_SECTION_LABELS[selectedSection]
    const subtitle =
      sectionItems.length === 0
        ? 'nothing here yet'
        : `${sectionItems.length} item${sectionItems.length !== 1 ? 's' : ''} — grouped by category`

    return (
      <ItemListByCategory
        title={title}
        subtitle={subtitle}
        items={sectionItems}
        onBack={handleBackFromSection}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  }

  if (isOpen) {
    return (
      <div className="relative flex-1 flex flex-col min-h-0 paper overflow-hidden">
        <button
          type="button"
          aria-label="Close fridge"
          className="absolute inset-0 z-0"
          onClick={handleCloseFridge}
        />

        <div className="relative z-10 flex flex-1 flex-col min-h-0 pointer-events-none">
          <div className="hidden sm:block shrink-0 font-mono text-[10px] tracking-wider text-stone-500 uppercase pt-2 pb-1 px-3 pointer-events-auto">
            <p>Tap freezer or fridge to view items</p>
            <p className="mt-0.5">Tap outside to close fridge</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0 w-full px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-2 sm:pb-3">
            <div className="flex flex-col items-center w-full max-w-[min(calc(100vw-1.5rem),420px)]">
              <p className="sm:hidden mb-2 font-mono text-[10px] tracking-wider text-stone-500 uppercase text-center pointer-events-auto">
                Tap freezer or fridge to view items
              </p>
              <div
                className={`${FRIDGE_HEIGHT_CLASS} w-full max-h-[min(72dvh,calc(100dvh-10rem))] sm:max-h-none shrink-0 pointer-events-auto mx-auto`}
                style={{ aspectRatio: '420 / 520' }}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
              >
                <FridgeInteriorOpen
                  freezerCount={freezerCount}
                  fridgeCount={fridgeCount}
                  onSectionClick={handleSectionClick}
                  activeSection={selectedSection}
                  className="h-full w-full"
                />
              </div>
              <button
                type="button"
                onClick={handleCloseFridge}
                className="sm:hidden mt-1.5 shrink-0 px-4 py-2 rounded-full border border-stone-400/70 bg-stone-50/90 font-mono text-[10px] uppercase tracking-wider text-stone-700 active:bg-stone-200 pointer-events-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 paper overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-1.5 sm:px-6 pt-[max(0.25rem,env(safe-area-inset-top))] pb-2 sm:pb-4 overflow-visible">
        <div className="shrink-0 mb-1 text-center px-3 sm:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">Nic + Kris</p>
          <h1 className="font-mono text-2xl tracking-tight text-stone-900">
            <span className="font-bold">OUR</span>{' '}
            <span className="editorial-underline">FRIDGE</span>
          </h1>
        </div>

        <div className="relative shrink-0 mx-auto w-fit max-w-full overflow-visible">
          <div className="absolute z-20 sm:hidden -rotate-6" style={{ top: '3%', left: '76%' }}>
            <InstockStamp totalItems={totalItems} compact onClick={onOpenInventory} />
          </div>
          <div
            className="hidden sm:block absolute z-10"
            style={{ top: '2%', left: '100%', marginLeft: '-0.5rem', transform: 'rotate(-4deg)' }}
          >
            <InstockStamp totalItems={totalItems} onClick={onOpenInventory} />
          </div>

          <TapToOpenMobile style={{ left: '-14%' }} />
          <TapToOpenDesktop style={{ transform: 'translateX(0.25rem)' }} />
          <SwipeHint show={showSwipeHint && isActivePanel} />

          <div
            className="hidden sm:block absolute z-20"
            style={{ bottom: '14%', left: '100%', marginLeft: '0.25rem' }}
          >
            <ExpiringStamp count={expiringCount} onClick={onOpenExpiring} />
          </div>
          <div
            className="sm:hidden absolute z-20 -rotate-3"
            style={{ top: '68%', right: '-1rem', transform: 'translate(34%, 0) rotate(-3deg)' }}
          >
            <ExpiringStamp count={expiringCount} compact onClick={onOpenExpiring} />
          </div>

          <FridgeClosed
            onOpen={() => setIsOpen(true)}
            onOpenNotes={() => setKitchenNotesOpen(true)}
            notes={notes}
            shopping={shopping}
            upperPhotoUrl={photos.upper}
            lowerPhotoUrl={photos.lower}
            leftPhotoUrl={photos.left}
            rightPhotoUrl={photos.right}
            onUploadPolaroid={uploadPhoto}
            className={FRIDGE_HEIGHT_CLASS}
          />
        </div>
      </div>
    </div>
  )
}
