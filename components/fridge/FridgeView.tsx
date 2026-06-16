'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HouseholdItem, Location, getExpiryStatus } from '@/lib/types'
import FridgeClosed from './FridgeClosed'
import FridgeInteriorOpen from './FridgeInteriorOpen'
import ZoneInterior from './ZoneInterior'
import KitchenNotesView from '@/components/kitchen/KitchenNotesView'
import { getLocalDoorPhotos, setLocalDoorPhoto } from '@/lib/doorPhotos'
import type { PolaroidSlot } from './DoorPolaroid'

interface Props {
  items: HouseholdItem[]
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

const ALL_ZONES: Location[] = ['freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door']

const FRIDGE_HEIGHT_CLASS = 'h-[min(calc(100dvh-5rem),calc(100dvh-env(safe-area-inset-bottom)-5rem),680px)]'

export default function FridgeView({ items, onEdit, onDelete }: Props) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Location | null>(null)
  const [kitchenNotesOpen, setKitchenNotesOpen] = useState(false)
  const [upperPhotoUrl, setUpperPhotoUrl] = useState<string | null>(null)
  const [lowerPhotoUrl, setLowerPhotoUrl] = useState<string | null>(null)
  const fridgeRef = useRef<HTMLDivElement>(null)

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

  const fetchDoorPhotos = useCallback(async () => {
    const { data, error } = await supabase
      .from('fridge_door')
      .select('upper_photo_url, lower_photo_url')
      .eq('id', 1)
      .maybeSingle()

    if (data) {
      setUpperPhotoUrl(data.upper_photo_url ?? getLocalDoorPhotos().upper)
      setLowerPhotoUrl(data.lower_photo_url ?? getLocalDoorPhotos().lower)
      return
    }

    const local = getLocalDoorPhotos()
    setUpperPhotoUrl(local.upper)
    setLowerPhotoUrl(local.lower)
    if (error) console.warn('fridge_door fetch:', error.message)
  }, [supabase])

  useEffect(() => {
    fetchDoorPhotos()

    const channel = supabase
      .channel('fridge-door-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fridge_door' }, fetchDoorPhotos)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchDoorPhotos, supabase])

  async function handleUploadPolaroid(slot: PolaroidSlot, file: File) {
    const preview = URL.createObjectURL(file)
    if (slot === 'upper') setUpperPhotoUrl(preview)
    else setLowerPhotoUrl(preview)

    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `door-${slot}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('item-photos').getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      const column = slot === 'upper' ? 'upper_photo_url' : 'lower_photo_url'

      const { error: dbError } = await supabase
        .from('fridge_door')
        .upsert({ id: 1, [column]: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' })

      setLocalDoorPhoto(slot, publicUrl)
      if (slot === 'upper') setUpperPhotoUrl(publicUrl)
      else setLowerPhotoUrl(publicUrl)

      if (dbError) console.warn('fridge_door save:', dbError.message)
    } catch (err) {
      const local = getLocalDoorPhotos()
      if (slot === 'upper') setUpperPhotoUrl(local.upper)
      else setLowerPhotoUrl(local.lower)
      throw err
    } finally {
      URL.revokeObjectURL(preview)
    }
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

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (fridgeRef.current && !fridgeRef.current.contains(e.target as Node)) {
      handleCloseFridge()
    }
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
      <div
        className="flex-1 flex flex-col min-h-0 paper overflow-hidden"
        onClick={handleBackdropClick}
      >
        <p className="shrink-0 font-mono text-[10px] tracking-wider text-stone-500 text-center uppercase pt-2 pb-1 px-3">
          Tap a zone to view items
        </p>

        <div className="flex-1 flex items-center justify-center min-h-0 w-full px-1">
          <div
            ref={fridgeRef}
            className={`${FRIDGE_HEIGHT_CLASS} w-full max-w-[calc(100vw-0.5rem)] flex items-center justify-center`}
          >
            <FridgeInteriorOpen
              itemCounts={itemCounts}
              onZoneClick={handleZoneClick}
              activeZone={selectedZone}
              className={`${FRIDGE_HEIGHT_CLASS} w-full max-w-full`}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 paper overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-3 py-2">
        <div className="shrink-0 mb-1 text-center">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">
            Nic + Kris
          </p>
          <h1 className="font-mono text-2xl tracking-tight text-stone-900">
            <span className="font-bold">OUR</span>{' '}
            <span className="editorial-underline">FRIDGE</span>
          </h1>
        </div>

        <div className="relative shrink-0">
          <div
            className="absolute z-10 pointer-events-none"
            style={{ top: '2%', left: '100%', marginLeft: '-0.5rem', transform: 'rotate(-4deg)' }}
          >
            <div className="border-2 border-stone-900 px-2 py-0.5 rounded-sm bg-stone-50/60">
              <p className="font-mono text-lg font-bold tracking-tight text-stone-900 leading-none">
                in stock <span className="inline-block">😊</span>
              </p>
              <p className="font-mono text-[8px] text-stone-600 tracking-wider text-center">
                {totalItems} ITEMS
              </p>
            </div>
          </div>

          <div
            className="absolute z-10 w-[72px] pointer-events-none"
            style={{ top: '30%', right: '100%', marginRight: '0.35rem' }}
          >
            <div className="flex gap-1 items-start">
              <span className="font-mono text-stone-900 text-sm leading-none shrink-0">✻</span>
              <p className="font-mono text-[10px] font-bold tracking-wider text-stone-900 leading-tight">
                TAP TO OPEN
              </p>
            </div>
            <svg width="64" height="40" viewBox="0 0 80 50" className="mt-0.5 ml-2">
              <path d="M 5 5 Q 30 5 40 20 T 75 35" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M 70 30 L 76 35 L 70 40" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          {(urgent > 0 || soon > 0) && (
            <div
              className="absolute z-10 max-w-[96px] text-right pointer-events-none"
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

          <FridgeClosed
            onOpen={() => setIsOpen(true)}
            onOpenNotes={() => setKitchenNotesOpen(true)}
            upperPhotoUrl={upperPhotoUrl}
            lowerPhotoUrl={lowerPhotoUrl}
            onUploadPolaroid={handleUploadPolaroid}
            className={FRIDGE_HEIGHT_CLASS}
          />
        </div>

        <p className="shrink-0 mt-2 text-center font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">
          tap +<span className="text-stone-400"> to add something fresh</span>
        </p>
      </div>
    </div>
  )
}
