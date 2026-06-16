'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HouseholdItem, Location, getExpiryStatus } from '@/lib/types'
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
}

const ALL_ZONES: Location[] = ['freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door']

const FRIDGE_HEIGHT_CLASS =
  'h-[min(calc(100dvh-6rem),calc(100dvh-env(safe-area-inset-bottom)-6rem),600px)] sm:h-[min(calc(100dvh-2.5rem),calc(100dvh-env(safe-area-inset-bottom)-2.5rem),680px)]'

function InstockStamp({ totalItems, compact = false }: { totalItems: number; compact?: boolean }) {
  return (
    <div className={`border-2 border-stone-900 rounded-sm bg-stone-50/60 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}`}>
      <p className={`font-mono font-bold tracking-tight text-stone-900 leading-none whitespace-nowrap ${compact ? 'text-[11px]' : 'text-lg'}`}>
        instock <span aria-hidden>😊</span>
      </p>
      <p className={`font-mono text-stone-600 tracking-wider text-center whitespace-nowrap ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
        {totalItems} ITEMS
      </p>
    </div>
  )
}

/** Mobile: stacked label on left of fridge */
function TapToOpenMobile() {
  return (
    <div className="absolute z-10 pointer-events-none sm:hidden" style={{ top: '33%', left: '0' }}>
      <p className="font-mono text-[9px] font-bold tracking-wide text-stone-900 leading-[1.15] -rotate-6">
        tap
        <br />
        to
        <br />
        open
      </p>
      <svg width="44" height="36" viewBox="0 0 56 44" className="mt-0.5 ml-2">
        <path d="M 4 8 Q 22 6 32 18 T 48 32" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 43 27 L 50 32 L 43 37" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
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
      <svg width="64" height="40" viewBox="0 0 80 50" className="mt-0.5 ml-2">
        <path d="M 5 5 Q 30 5 40 20 T 75 35" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 70 30 L 76 35 L 70 40" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function FridgeView({ items, onEdit, onDelete }: Props) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Location | null>(null)
  const [kitchenNotesOpen, setKitchenNotesOpen] = useState(false)
  const [upperPhotoUrl, setUpperPhotoUrl] = useState<string | null>(null)
  const [lowerPhotoUrl, setLowerPhotoUrl] = useState<string | null>(null)
  const [leftPhotoUrl, setLeftPhotoUrl] = useState<string | null>(null)

  const itemCounts = ALL_ZONES.reduce((acc, zone) => {
    acc[zone] = items.filter(i => i.location === zone).length
    return acc
  }, {} as Partial<Record<Location, number>>)

  const totalItems = items.length
  const urgent = items.filter(i => {
    const s = getExpiryStatus(i.expiry_date)
    return s === 'urgent' || s === 'expired'
  }).length
  const soon = items.filter(i => getExpiryStatus(i.expiry_date) === 'soon').length

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

  useEffect(() => {
    fetchDoorPhotos()

    if (!isSupabaseConfigured()) return

    const channel = supabase
      .channel('fridge-door-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fridge_door' }, fetchDoorPhotos)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchDoorPhotos, supabase])

  async function handleUploadPolaroid(slot: PolaroidSlot, file: File) {
    const url = await uploadDoorPhoto(slot, file)
    setPhotoForSlot(slot, url)
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
        <p
          className="shrink-0 font-mono text-[10px] tracking-wider text-stone-500 text-center uppercase pt-2 pb-1 px-3 cursor-pointer"
          onClick={handleCloseFridge}
        >
          Tap a zone to view items
        </p>

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
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-3 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 overflow-x-hidden sm:overflow-visible">
        <div className="shrink-0 mb-1 text-center px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">
            Nic + Kris
          </p>
          <h1 className="font-mono text-2xl tracking-tight text-stone-900">
            <span className="font-bold">OUR</span>{' '}
            <span className="editorial-underline">FRIDGE</span>
          </h1>
        </div>

        {/* Wrapper hugs fridge width on desktop so side labels sit adjacent */}
        <div className="relative shrink-0 mx-auto w-full max-w-[min(100%,280px)] sm:w-fit sm:max-w-none px-8 sm:px-0 overflow-visible">
          {/* Mobile: instock on upper freezer */}
          <div
            className="absolute z-10 pointer-events-none sm:hidden -rotate-6"
            style={{ top: '4%', right: '-4%' }}
          >
            <InstockStamp totalItems={totalItems} compact />
          </div>

          {/* Desktop: instock off right edge */}
          <div
            className="hidden sm:block absolute z-10 pointer-events-none"
            style={{ top: '2%', left: '100%', marginLeft: '-0.5rem', transform: 'rotate(-4deg)' }}
          >
            <InstockStamp totalItems={totalItems} />
          </div>

          <TapToOpenMobile />
          <TapToOpenDesktop />

          {(urgent > 0 || soon > 0) && (
            <div
              className="hidden sm:block absolute z-10 max-w-[96px] text-right pointer-events-none"
              style={{ bottom: '14%', left: '100%', marginLeft: '0.25rem' }}
            >
              <p className="font-mono text-[10px] font-bold tracking-wider text-stone-900 leading-tight">
                EXPIRING
              </p>
              <p className="font-mono text-[9px] text-stone-700 mt-0.5 leading-snug">
                {urgent > 0 && <><span className="text-red-700 font-bold">{urgent}</span> urgent</>}
                {urgent > 0 && soon > 0 && <span>, </span>}
                {soon > 0 && <><span className="text-amber-700 font-bold">{soon}</span> soon</>}
              </p>
              <svg width="64" height="36" viewBox="0 0 80 46" className="mt-0.5 ml-auto">
                <path d="M 75 5 Q 50 5 40 22 T 5 38" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                <path d="M 10 33 L 4 38 L 10 43" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {(urgent > 0 || soon > 0) && (
            <p className="sm:hidden absolute z-10 pointer-events-none font-mono text-[8px] text-stone-700 whitespace-nowrap -bottom-4 left-1/2 -translate-x-1/2">
              {urgent > 0 && <><span className="text-red-700 font-bold">{urgent}</span> expiring</>}
              {urgent > 0 && soon > 0 && <span> · </span>}
              {soon > 0 && <><span className="text-amber-700 font-bold">{soon}</span> soon</>}
            </p>
          )}

          <FridgeClosed
            onOpen={() => setIsOpen(true)}
            onOpenNotes={() => setKitchenNotesOpen(true)}
            upperPhotoUrl={upperPhotoUrl}
            lowerPhotoUrl={lowerPhotoUrl}
            leftPhotoUrl={leftPhotoUrl}
            onUploadPolaroid={handleUploadPolaroid}
            className={FRIDGE_HEIGHT_CLASS}
          />
        </div>

        <p className="shrink-0 mt-3 sm:mt-2 text-center font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500 px-4">
          tap +<span className="text-stone-400"> to add something fresh</span>
        </p>
      </div>
    </div>
  )
}
