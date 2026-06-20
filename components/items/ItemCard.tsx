'use client'

import { useState } from 'react'
import { HouseholdItem, CATEGORY_LABELS, getExpiryStatus, EXPIRY_STATUS_CONFIG, normalizeCategory, daysUntilExpiry } from '@/lib/types'
import { usesPortraitItemCard } from '@/lib/itemDisplay'
import { useItemPhotoDisplay } from '@/components/items/useItemPhotoDisplay'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  item: HouseholdItem
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ItemCard({ item, onEdit, onDelete }: Props) {
  const [flipped, setFlipped] = useState(false)
  const category = normalizeCategory(item.category)
  const status = getExpiryStatus(item.expiry_date)
  const statusCfg = EXPIRY_STATUS_CONFIG[status]
  const portrait = usesPortraitItemCard(item)

  const diffDays = daysUntilExpiry(item.expiry_date)
  const photoSrc = useItemPhotoDisplay(item.photo_url)

  const expiryLabel =
    diffDays < 0
      ? `${Math.abs(diffDays)}d ago`
      : diffDays === 0
      ? 'Today'
      : diffDays === 1
      ? 'Tomorrow'
      : `${diffDays}d left`

  return (
    <div
      className={`card-flip w-full ${portrait ? 'aspect-[2/3]' : ''}`}
      style={portrait ? undefined : { height: '120px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div className={`card-flip-inner h-full ${flipped ? 'flipped' : ''}`}>
        {/* Front face */}
        <div className="card-face rounded-md overflow-hidden bg-white border border-stone-900/90 shadow-sm">
          {photoSrc ? (
            <>
              <img
                src={photoSrc}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/85 via-stone-900/45 to-transparent pt-5 pb-1 px-1.5">
                <span className="font-mono text-[9px] sm:text-[10px] text-white font-bold uppercase tracking-wider line-clamp-2 leading-tight">
                  {item.name}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 gap-1.5 px-1.5">
              <span className="font-mono text-[9px] sm:text-[10px] text-stone-600 font-bold uppercase tracking-wider text-center line-clamp-4 leading-tight">
                {item.name}
              </span>
            </div>
          )}
          {/* Expiry stamp overlay */}
          <div className="absolute top-1 left-1" style={{ transform: 'rotate(-4deg)' }}>
            <span className={`font-mono text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              {expiryLabel}
            </span>
          </div>
        </div>

        {/* Back face */}
        <div className="card-face card-back rounded-md bg-stone-50 border border-stone-900/90 shadow-sm p-2 flex flex-col min-h-0 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <h3 className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wide text-stone-900 leading-tight line-clamp-2 mb-1">
              {item.name}
            </h3>
            <span className={`inline-block font-mono text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm border mb-1 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              {statusCfg.label} · {expiryLabel}
            </span>
            <p className="font-mono text-[8px] text-stone-500 uppercase tracking-wider leading-tight">{CATEGORY_LABELS[category]}</p>
            {item.notes && (
              <p className="font-hand text-[11px] text-stone-600 mt-0.5 leading-tight line-clamp-1">{item.notes}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0 pt-1">
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onEdit(item) }}
              aria-label="Edit item"
              className="relative z-10 flex-1 h-6 flex items-center justify-center rounded-sm bg-stone-200 text-stone-700 active:bg-stone-300"
            >
              <Pencil size={11} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onDelete(item.id) }}
              aria-label="Delete item"
              className="relative z-10 flex-1 h-6 flex items-center justify-center rounded-sm bg-red-100 text-red-800 active:bg-red-200"
            >
              <Trash2 size={11} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
