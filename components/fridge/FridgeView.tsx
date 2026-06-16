'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HouseholdItem, Location, MealNote, ShoppingItem, isExpiringWithinDays, EXPIRING_SOON_DAYS } from '@/lib/types'
import FridgeClosed from './FridgeClosed'
import FridgeInteriorOpen from './FridgeInteriorOpen'
import ZoneInterior from './ZoneInterior'
import KitchenNotesView from '@/components/kitchen/KitchenNotesView'
import { fetchDoorPhotoUrls, uploadDoorPhoto } from '@/lib/fridgeDoor'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import type { PolaroidSlot } from './DoorPolaroid'

interface Props {
  items: HouseholdItem[]
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
  onOpenInventory: () => void
  onOpenExpiring: () => void
}

const ALL_ZONES: Location[] = ['freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door']

const FRIDGE_HEIGHT_CLASS =
  'h-[min(calc(100dvh-6rem),calc(100dvh-env(safe-area-inset-bottom)-6rem),600px)] sm:h-[min(calc(100dvh-2.5rem),calc(100dvh-env(safe-area-inset-bottom)-2.5rem),680px)]'

const HAND_ARROW = {
  stroke: '#1A1A1A',
  strokeWidth: 1.2,
  fill: 'none',
  strokeLinecap: 'round' as const,
}

/** Hand-drawn curved arrow — same style as expiring stamp, mirrored for direction */
function HandDrawnArrow({
  toward,
  compact = false,
  className = '',
}: {
  toward: 'left' | 'right'
  compact?: boolean
  className?: string
}) {
  const w = compact ? 48 : 64
  const h = compact ? 32 : 36

  if (toward === 'left') {
    return (
      <svg width={w} height={h} viewBox="0 0 80 46" className={className}>
        <path d="M 75 5 Q 50 5 40 22 T 5 38" {...HAND_ARROW} />
        <path d="M 10 33 L 4 38 L 10 43" {...HAND_ARROW} />
      </svg>
    )
  }

  return (
    <svg width={w} height={h} viewBox="0 0 80 46" className={className}>
      <path d="M 5 5 Q 30 5 40 22 T 75 38" {...HAND_ARROW} />
      <path d="M 70 33 L 76 38 L 70 43" {...HAND_ARROW} />
    </svg>
  )
}

function InstockStamp({
  totalItems,
  compact = false,
  onClick,
}: {
  totalItems: number
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`border border-stone-900 rounded-sm bg-stone-50/60 active:scale-[0.98] transition-transform cursor-pointer ${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}`}
      aria-label="View inventory"
    >
      <p className={`font-mono font-bold tracking-tight text-stone-900 leading-none whitespace-nowrap ${compact ? 'text-[11px]' : 'text-lg'}`}>
        instock <span aria-hidden>😊</span>
      </p>
      <p className={`font-mono text-stone-600 tracking-wider text-center whitespace-nowrap ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
        {totalItems} ITEMS
      </p>
    </button>
  )
}

function ExpiringStamp({
  count,
  compact = false,
  onClick,
}: {
  count: number
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`active:scale-[0.98] transition-transform cursor-pointer ${compact ? 'text-right max-w-[72px]' : 'text-left max-w-[96px]'}`}
      aria-label="View expiring items"
    >
      <p className={`font-mono font-bold tracking-wider text-stone-900 leading-tight ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
        EXPIRING
      </p>
      <p className={`font-mono text-stone-700 mt-0.5 leading-snug ${compact ? 'text-[7px]' : 'text-[9px]'}`}>
        <span className={`font-bold ${count > 0 ? 'text-amber-700' : 'text-stone-400'}`}>{count}</span>
      </p>
      <HandDrawnArrow
        toward="left"
        compact={compact}
        className={`mt-0.5 ${compact ? 'mr-auto ml-0' : 'ml-auto'}`}
      />
    </button>
  )
}

/** Mobile: stacked label on left of fridge — aligned with door handle */
function TapToOpenMobile() {
  return (
    <div className="absolute z-10 pointer-events-none sm:hidden" style={{ top: '29%', left: '-22%' }}>
      <div className="grid grid-cols-[auto_1fr] gap-x-0.5 -rotate-6">
        <span className="font-mono text-stone-900 text-[9px] leading-[1.15]">✻</span>
        <span className="font-mono text-[9px] font-bold tracking-wide text-stone-900 leading-[1.15]">tap</span>
        <span className="col-start-2 font-mono text-[9px] font-bold tracking-wide text-stone-900 leading-[1.15]">to</span>
        <span className="col-start-2 font-mono text-[9px] font-bold tracking-wide text-stone-900 leading-[1.15]">open</span>
        <HandDrawnArrow toward="right" compact className="col-span-2 mt-0.5 ml-3" />
      </div>
    </div>
  )
}

/** Desktop: horizontal label off left edge of fridge */
function TapToOpenDesktop() {
  return (
    <div
      className="hidden sm:block absolute z-10 pointer-events-none"
      style={{ top: '30%', right: '100%', marginRight: '0.35rem' }}
    >
      <div className="flex flex-nowrap items-center gap-1">
        <span className="font-mono text-stone-900 text-sm leading-none">✻</span>
        <span className="font-mono text-[10px] font-bold tracking-wide text-stone-900 whitespace-nowrap">
          TAP&nbsp;TO&nbsp;OPEN
        </span>
      </div>
      <HandDrawnArrow toward="right" className="mt-0.5 ml-2" />
    </div>
  )
}

export default function FridgeView({ items, onEdit, onDelete, onOpenInventory, onOpenExpiring }: Props) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Location | null>(null)
  const [kitchenNotesOpen, setKitchenNotesOpen] = useState(false)
  const [upperPhotoUrl, setUpperPhotoUrl] = useState<string | null>(null)
  const [lowerPhotoUrl, setLowerPhotoUrl] = useState<string | null>(null)
  const [leftPhotoUrl, setLeftPhotoUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState<MealNote[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])

  const itemCounts = ALL_ZONES.reduce((acc, zone) => {
    acc[zone] = items.filter(i => i.location === zone).length
    return acc
  }, {} as Partial<Record<Location, number>>)

  const totalItems = items.length
  const expiringCount = items.filter(i => isExpiringWithinDays(i.expiry_date, EXPIRING_SOON_DAYS)).length

  const setPhotoForSlot = useCallback((slot: PolaroidSlot, url: string | null) => {
    if (slot === 'upper') setUpperPhotoUrl(url)
    else if (slot === 'lower') setLowerPhotoUrl(url)
    else setLeftPhotoUrl(url)
  }, [])

  const fetchDoorPhotos = useCallback(async () => {
    const urls = await fetchDoorPhotoUrls()
    setUpperPhotoUrl(urls.upper)
    setLowerPhotoUrl(urls.lower)
    setLeftPhotoUrl(urls.left)
  }, [])

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
    fetchDoorPhotos()
    fetchNotes()
    fetchShopping()

    if (!isSupabaseConfigured()) return

    const doorChannel = supabase
      .channel('fridge-door-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fridge_door' }, fetchDoorPhotos)
      .subscribe()

    const notesChannel = supabase
      .channel('fridge-paper-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_notes' }, fetchNotes)
      .subscribe()

    const shoppingChannel = supabase
      .channel('fridge-paper-shopping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, fetchShopping)
      .subscribe()

    return () => {
      supabase.removeChannel(doorChannel)
      supabase.removeChannel(notesChannel)
      supabase.removeChannel(shoppingChannel)
    }
  }, [fetchDoorPhotos, fetchNotes, fetchShopping, supabase])

  async function handleUploadPolaroid(slot: PolaroidSlot, file: File) {
    const url = await uploadDoorPhoto(slot, file)
    setPhotoForSlot(slot, url)
  }

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
        <div
          className="shrink-0 font-mono text-[10px] tracking-wider text-stone-500 text-center uppercase pt-2 pb-1 px-3"
        >
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
            onClick={(e) => e.stopPropagation()}
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-3 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top))] pb-4 overflow-visible">
        <div className="shrink-0 mb-1 text-center px-4 sm:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">
            Nic + Kris
          </p>
          <h1 className="font-mono text-2xl tracking-tight text-stone-900">
            <span className="font-bold">OUR</span>{' '}
            <span className="editorial-underline">FRIDGE</span>
          </h1>
        </div>

        {/* Wrapper — centred on mobile, side labels adjacent on desktop */}
        <div className="relative shrink-0 mx-auto w-fit max-w-full overflow-visible">
          {/* Mobile: instock overlapping upper-right of freezer */}
          <div
            className="absolute z-20 sm:hidden -rotate-6"
            style={{ top: '3%', left: '76%' }}
          >
            <InstockStamp totalItems={totalItems} compact onClick={onOpenInventory} />
          </div>

          {/* Desktop: instock off right edge */}
          <div
            className="hidden sm:block absolute z-10"
            style={{ top: '2%', left: '100%', marginLeft: '-0.5rem', transform: 'rotate(-4deg)' }}
          >
            <InstockStamp totalItems={totalItems} onClick={onOpenInventory} />
          </div>

          <TapToOpenMobile />
          <TapToOpenDesktop />

          <div
            className="hidden sm:block absolute z-20"
            style={{ bottom: '14%', left: '100%', marginLeft: '0.25rem' }}
          >
            <ExpiringStamp count={expiringCount} onClick={onOpenExpiring} />
          </div>

          <div
            className="sm:hidden absolute z-20 -rotate-3"
            style={{ top: '75%', left: '100%', marginLeft: '0.15rem' }}
          >
            <ExpiringStamp count={expiringCount} compact onClick={onOpenExpiring} />
          </div>

          <FridgeClosed
            onOpen={() => setIsOpen(true)}
            onOpenFreezer={handleOpenFreezer}
            onOpenNotes={() => setKitchenNotesOpen(true)}
            notes={notes}
            shopping={shopping}
            upperPhotoUrl={upperPhotoUrl}
            lowerPhotoUrl={lowerPhotoUrl}
            leftPhotoUrl={leftPhotoUrl}
            onUploadPolaroid={handleUploadPolaroid}
            className={FRIDGE_HEIGHT_CLASS}
          />
        </div>
      </div>
    </div>
  )
}
