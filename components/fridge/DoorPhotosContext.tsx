'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchDoorPhotoUrls, uploadDoorPhoto, type DoorPhotoUrls } from '@/lib/fridgeDoor'
import { getLocalDoorPhotos } from '@/lib/doorPhotos'
import type { PolaroidSlot } from './DoorPolaroid'

const EMPTY: DoorPhotoUrls = { upper: null, lower: null, left: null }

interface ContextValue {
  photos: DoorPhotoUrls
  uploadPhoto: (slot: PolaroidSlot, file: File) => Promise<void>
}

const DoorPhotosContext = createContext<ContextValue | null>(null)

export function DoorPhotosProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [photos, setPhotos] = useState<DoorPhotoUrls>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  // Show cached polaroids before paint — avoids blank flash when swiping back.
  useLayoutEffect(() => {
    setPhotos(getLocalDoorPhotos())
    setHydrated(true)
  }, [])

  const refresh = useCallback(async () => {
    const urls = await fetchDoorPhotoUrls()
    setPhotos(urls)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    refresh()

    if (!isSupabaseConfigured()) return

    const channel = supabase
      .channel('fridge-door-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fridge_door' }, refresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hydrated, refresh, supabase])

  const uploadPhoto = useCallback(async (slot: PolaroidSlot, file: File) => {
    const url = await uploadDoorPhoto(slot, file)
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
