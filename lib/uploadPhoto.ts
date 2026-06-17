import type { SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { dataUrlToBlob } from '@/lib/doorPhotos'
import { seedItemPhotoCache } from '@/lib/itemPhotoCache'

export async function uploadPhotoDataUrl(
  supabase: SupabaseClient,
  dataUrl: string,
  folder: 'items' | 'meal-notes' = 'items'
): Promise<string> {
  if (!isSupabaseConfigured()) {
    return dataUrl
  }

  const blob = await dataUrlToBlob(dataUrl)
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
  const { error: uploadError } = await supabase.storage
    .from('item-photos')
    .upload(path, blob, { contentType: 'image/jpeg' })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('item-photos').getPublicUrl(path)
  seedItemPhotoCache(data.publicUrl, dataUrl)
  return data.publicUrl
}
