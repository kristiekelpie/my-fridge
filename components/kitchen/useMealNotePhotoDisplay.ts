'use client'

/**
 * Meal notes render full-width on web — use the stored URL directly instead of
 * the 240px item thumbnail cache used for inventory cards.
 */
export function useMealNotePhotoDisplay(photoUrl: string | null | undefined): string | null {
  return photoUrl || null
}
