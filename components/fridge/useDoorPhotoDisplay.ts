'use client'

import { useEffect, useState } from 'react'
import { ensureDoorPhotoCached, peekCachedDoorPhoto } from '@/lib/doorPhotoCache'

export function useDoorPhotoDisplay(photoUrl: string | null | undefined): string | null {
  const [src, setSrc] = useState<string | null>(() => peekCachedDoorPhoto(photoUrl) ?? photoUrl ?? null)

  useEffect(() => {
    if (!photoUrl) {
      setSrc(null)
      return
    }

    const cached = peekCachedDoorPhoto(photoUrl)
    if (cached) {
      setSrc(cached)
      return
    }

    let cancelled = false
    void ensureDoorPhotoCached(photoUrl).then(next => {
      if (!cancelled) setSrc(next)
    })

    return () => {
      cancelled = true
    }
  }, [photoUrl])

  return src
}
