'use client'

import { useEffect, useState } from 'react'
import { ensureItemPhotoCached, peekCachedItemPhoto } from '@/lib/itemPhotoCache'

export function useItemPhotoDisplay(photoUrl: string | null | undefined): string | null {
  const [src, setSrc] = useState<string | null>(() => peekCachedItemPhoto(photoUrl) ?? photoUrl ?? null)

  useEffect(() => {
    if (!photoUrl) {
      setSrc(null)
      return
    }

    const cached = peekCachedItemPhoto(photoUrl)
    if (cached) {
      setSrc(cached)
      return
    }

    setSrc(photoUrl)
    let cancelled = false
    void ensureItemPhotoCached(photoUrl).then(next => {
      if (!cancelled) setSrc(next)
    })

    return () => {
      cancelled = true
    }
  }, [photoUrl])

  return src
}
