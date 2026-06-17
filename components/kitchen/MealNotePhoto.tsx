'use client'

import { useItemPhotoDisplay } from '@/components/items/useItemPhotoDisplay'

export default function MealNotePhoto({ photoUrl, className = '' }: { photoUrl?: string | null; className?: string }) {
  const src = useItemPhotoDisplay(photoUrl)
  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      className={`w-full rounded-lg object-cover aspect-[4/3] bg-stone-100 ${className}`}
      loading="lazy"
    />
  )
}
