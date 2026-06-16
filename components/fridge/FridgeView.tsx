'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HouseholdItem, Location, MealNote, ShoppingItem, isExpiringWithinDays, EXPIRING_SOON_DAYS } from '@/lib/types'
import FridgeClosed from './FridgeClosed'
import FridgeInteriorOpen from './FridgeInteriorOpen'
import ZoneInterior from './ZoneInterior'
import KitchenNotesView from '@/components/kitchen/KitchenNotesView'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { useDoorPhotos } from './DoorPhotosContext'
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
}

const ALL_ZONES: Location[] = ['freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door']

const FRIDGE_HEIGHT_CLASS =
  'h-[min(calc(100dvh-6.5rem),calc(100dvh-env(safe-area-inset-bottom)-6.5rem),760px)] sm:h-[min(calc(100dvh-5rem),calc(100dvh-env(safe-area-inset-bottom)-5rem),640px)]'

export default function FridgeView({
  items,
  showSwipeHint = false,
  onEdit,
  onDelete,
  onOpenInventory,
  onOpenExpiring,
}: Props) {
  const supabase = createClient()
  const isActivePanel = useStoragePanelActive()
  const { photos, uploadPhoto } = useDoorPhotos()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Location | null>(null)
  const [kitchenNotesOpen, setKitchenNotesOpen] = useState(false)
  const [notes, setNotes] = useState<MealNote[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])

  const itemCounts = ALL_ZONES.reduce((acc, zone) => {
    acc[zone] = items.filter(i => i.location === zone).length
    return acc
  }, {} as Partial<Record<Location, number>>)

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

  function handleOpenFreezer() {
    setSelectedZone('freezer')
  }

  function handleZoneClick(zone: Location) {
    setSelectedZone(zone)
  }

  function handleBackFromZone() {
    setSelectedZone(null)
  }

  function handleCloseFridge() {
    setIsOpen(false)
  }

  const handleBackdropClick = useCallback(() => {
    handleCloseFridge()
  }, [])

  if (kitchenNotesOpen) {
    return <KitchenNotesView onBack={() => setKitchenNotesOpen(false)} />
  }

  if (selectedZone) {
    const zoneItems = items.filter(i => i.location === selectedZone)
    return (
      <ZoneInterior
        zone={selectedZone}
        items={zoneItems}
        onBack={handleBackFromZone}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  }

  if (isOpen) {
    return (
      <div className="flex-1 flex flex-col min-h-0 paper overflow-hidden">
        <div className="shrink-0 font-mono text-[10px] tracking-wider text-stone-500 text-center uppercase pt-2 pb-1 px-3">
          <p>Tap a zone to view items</p>
          <p className="mt-0.5">Tap outside to close fridge</p>
        </div>

        <div
          className="flex-1 flex items-center justify-center min-h-0 w-full px-2 cursor-pointer"
          onClick={handleBackdropClick}
        >
          <div
            className={`${FRIDGE_HEIGHT_CLASS} w-auto max-w-[calc(100vw-1rem)] shrink-0 cursor-default`}
            style={{ aspectRatio: '420 / 520' }}
            onClick={e => e.stopPropagation()}
          >
            <FridgeInteriorOpen
              itemCounts={itemCounts}
              onZoneClick={handleZoneClick}
              activeZone={selectedZone}
              className="h-full w-full"
            />
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

          <TapToOpenMobile />
          <TapToOpenDesktop />
          <SwipeHint show={showSwipeHint && isActivePanel} />

          <div
            className="hidden sm:block absolute z-20"
            style={{ bottom: '14%', left: '100%', marginLeft: '0.25rem' }}
          >
            <ExpiringStamp count={expiringCount} onClick={onOpenExpiring} />
          </div>
          <div
            className="sm:hidden absolute z-20 -rotate-3"
            style={{ top: '76%', right: '-0.25rem', transform: 'translate(8%, 0) rotate(-3deg)' }}
          >
            <ExpiringStamp count={expiringCount} compact onClick={onOpenExpiring} />
          </div>

          <FridgeClosed
            onOpen={() => setIsOpen(true)}
            onOpenFreezer={handleOpenFreezer}
            onOpenNotes={() => setKitchenNotesOpen(true)}
            notes={notes}
            shopping={shopping}
            upperPhotoUrl={photos.upper}
            lowerPhotoUrl={photos.lower}
            leftPhotoUrl={photos.left}
            onUploadPolaroid={uploadPhoto}
            className={FRIDGE_HEIGHT_CLASS}
          />
        </div>
      </div>
    </div>
  )
}
