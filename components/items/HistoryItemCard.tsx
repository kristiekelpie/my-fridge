'use client'

import { Image as ImageIcon } from 'lucide-react'
import { useItemPhotoDisplay } from '@/components/items/useItemPhotoDisplay'

interface Props {
  item: { name: string; photo_url: string | null }
  onClick: () => void
}

export default function HistoryItemCard({ item, onClick }: Props) {
  const photoSrc = useItemPhotoDisplay(item.photo_url)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-md overflow-hidden bg-white border border-stone-900/90 shadow-sm active:scale-[0.98] transition-transform"
      style={{ height: '120px' }}
    >
      <div className="relative w-full h-full">
        {photoSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/85 via-stone-900/45 to-transparent pt-5 pb-1 px-1.5">
              <span className="font-mono text-[8px] text-white font-bold uppercase tracking-wider line-clamp-2 leading-tight">
                {item.name}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 gap-1 px-1.5">
            <ImageIcon size={18} className="text-stone-300 shrink-0" />
            <span className="font-mono text-[8px] text-stone-600 font-bold uppercase tracking-wider text-center line-clamp-3 leading-tight">
              {item.name}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
