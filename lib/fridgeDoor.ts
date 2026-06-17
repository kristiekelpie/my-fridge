import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import type { PolaroidSlot } from '@/components/fridge/DoorPolaroid'
import {
  getLocalDoorPhotos,
  setLocalDoorPhoto,
  getSlotColumn,
  fileToResizedDataUrl,
  dataUrlToBlob,
} from '@/lib/doorPhotos'
import { seedDoorPhotoCache, warmDoorPhotoCacheFromSlots } from '@/lib/doorPhotoCache'
import type { FridgeDoor } from '@/lib/types'

export type DoorPhotoUrls = Record<PolaroidSlot, string | null>

const EMPTY: DoorPhotoUrls = { upper: null, lower: null, left: null, right: null }

function rowToUrls(
  row: Pick<FridgeDoor, 'upper_photo_url' | 'lower_photo_url' | 'left_photo_url' | 'right_photo_url'> | null
): DoorPhotoUrls {
  if (!row) return { ...EMPTY }
  return {
    upper: row.upper_photo_url ?? null,
    lower: row.lower_photo_url ?? null,
    left: row.left_photo_url ?? null,
    right: row.right_photo_url ?? null,
  }
}

function cacheUrls(urls: DoorPhotoUrls) {
  for (const slot of ['upper', 'lower', 'left', 'right'] as PolaroidSlot[]) {
    if (urls[slot]) setLocalDoorPhoto(slot, urls[slot]!)
  }
}

/** Cloud is source of truth; localStorage is offline cache only. */
export async function fetchDoorPhotoUrls(): Promise<DoorPhotoUrls> {
  if (!isSupabaseConfigured()) {
    return getLocalDoorPhotos()
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('fridge_door')
    .select('upper_photo_url, lower_photo_url, left_photo_url, right_photo_url')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.warn('fridge_door fetch:', error.message)
    return getLocalDoorPhotos()
  }

  const urls = rowToUrls(data)
  cacheUrls(urls)
  warmDoorPhotoCacheFromSlots(urls)
  return urls
}

export async function uploadDoorPhoto(slot: PolaroidSlot, file: File): Promise<string> {
  const dataUrl = await fileToResizedDataUrl(file)

  if (!isSupabaseConfigured()) {
    setLocalDoorPhoto(slot, dataUrl)
    seedDoorPhotoCache(dataUrl, dataUrl)
    return dataUrl
  }

  const supabase = createClient()
  const blob = await dataUrlToBlob(dataUrl)
  const path = `door-${slot}-${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('item-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })

  if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)

  const { data: urlData } = supabase.storage.from('item-photos').getPublicUrl(path)
  const publicUrl = urlData.publicUrl
  const column = getSlotColumn(slot)

  const { error: updateError } = await supabase
    .from('fridge_door')
    .update({ [column]: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (updateError) {
    // Row may not exist yet on fresh projects
    const { error: upsertError } = await supabase
      .from('fridge_door')
      .upsert(
        { id: 1, [column]: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
    if (upsertError) throw new Error(`Could not save photo: ${upsertError.message}`)
  }

  setLocalDoorPhoto(slot, publicUrl)
  seedDoorPhotoCache(publicUrl, dataUrl)
  return publicUrl
}
