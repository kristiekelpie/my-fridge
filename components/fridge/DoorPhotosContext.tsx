'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchDoorPhotoUrls, uploadDoorPhotoDataUrl, type DoorPhotoUrls } from '@/lib/fridgeDoor'
import { getLocalDoorPhotos } from '@/lib/doorPhotos'
import { warmDoorPhotoCacheFromSlots } from '@/lib/doorPhotoCache'
import type { PolaroidSlot } from './DoorPolaroid'

const EMPTY: DoorPhotoUrls = { upper: null, lower: null, left: null, right: null }

function urlsEqual(a: DoorPhotoUrls, b: DoorPhotoUrls) {
  return a.upper === b.upper && a.lower === b.lower && a.left === b.left && a.right === b.right
}

interface ContextValue {
  photos: DoorPhotoUrls
  uploadPhoto: (slot: PolaroidSlot, dataUrl: string) => Promise<void>
}

const DoorPhotosContext = createContext<ContextValue | null>(null)

export function DoorPhotosProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [photos, setPhotos] = useState<DoorPhotoUrls>(() => {
    if (typeof window === 'undefined') return EMPTY
    const local = getLocalDoorPhotos()
    warmDoorPhotoCacheFromSlots(local)
    return local
  })

  const refresh = useCallback(async () => {
    const urls = await fetchDoorPhotoUrls()
    setPhotos(prev => (urlsEqual(prev, urls) ? prev : urls))
    warmDoorPhotoCacheFromSlots(urls)
  }, [])

  useEffect(() => {
    warmDoorPhotoCacheFromSlots(photos)
  }, [photos])

  useEffect(() => {
    refresh()

    if (!isSupabaseConfigured()) return

    const channel = supabase
      .channel('fridge-door-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fridge_door' }, refresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh, supabase])

  const uploadPhoto = useCallback(async (slot: PolaroidSlot, dataUrl: string) => {
    const url = await uploadDoorPhotoDataUrl(slot, dataUrl)
    setPhotos(prev => ({ ...prev, [slot]: url }))
  }, [])

  return (
    <DoorPhotosContext.Provider value={{ photos, uploadPhoto }}>
      {children}
    </DoorPhotosContext.Provider>
  )
}

export function useDoorPhotos() {
  const ctx = useContext(DoorPhotosContext)
  if (!ctx) throw new Error('useDoorPhotos must be used within DoorPhotosProvider')
  return ctx
}
