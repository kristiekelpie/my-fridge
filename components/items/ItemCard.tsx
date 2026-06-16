'use client'

import { useState } from 'react'
import { HouseholdItem, CATEGORY_LABELS, CATEGORY_EMOJI, getExpiryStatus, EXPIRY_STATUS_CONFIG } from '@/lib/types'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  item: HouseholdItem
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ItemCard({ item, onEdit, onDelete }: Props) {
  const [flipped, setFlipped] = useState(false)
  const status = getExpiryStatus(item.expiry_date)
  const statusCfg = EXPIRY_STATUS_CONFIG[status]

  const expiry = new Date(item.expiry_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

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
      className="card-flip"
      style={{ height: '170px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`} style={{ height: '170px' }}>
        {/* Front face */}
        <div className="card-face rounded-md overflow-hidden bg-white border-2 border-stone-900/90 shadow-sm">
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 gap-2">
              <span className="text-4xl">{CATEGORY_EMOJI[item.category]}</span>
              <span className="font-mono text-[10px] text-stone-600 font-bold uppercase tracking-wider px-2 text-center line-clamp-2">
                {item.name}
              </span>
            </div>
          )}
          {/* Expiry stamp overlay */}
          <div className="absolute top-1.5 left-1.5" style={{ transform: 'rotate(-4deg)' }}>
            <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              {expiryLabel}
            </span>
          </div>
        </div>

        {/* Back face */}
        <div className="card-face card-back rounded-md bg-stone-50 border-2 border-stone-900/90 shadow-sm p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1 mb-1">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-wide text-stone-900 leading-tight line-clamp-2">
                {item.name}
              </h3>
              <span className="text-base shrink-0">{CATEGORY_EMOJI[item.category]}</span>
            </div>
            <span className={`inline-block font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border mb-1.5 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              {statusCfg.label} · {expiryLabel}
            </span>
            <p className="font-mono text-[9px] text-stone-500 uppercase tracking-wider">{CATEGORY_LABELS[item.category]}</p>
            {item.notes && (
              <p className="font-hand text-sm text-stone-600 mt-1 leading-tight line-clamp-2">{item.notes}</p>
            )}
          </div>
          <div className="flex gap-1.5 mt-2">
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onEdit(item) }}
              className="relative z-10 flex-1 flex items-center justify-center gap-1 py-1.5 rounded-sm bg-stone-200 text-stone-700 font-mono text-[9px] font-bold uppercase tracking-wider active:bg-stone-300"
            >
              <Pencil size={10} />
              Edit
            </button>
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onDelete(item.id) }}
              className="relative z-10 flex-1 flex items-center justify-center gap-1 py-1.5 rounded-sm bg-red-100 text-red-800 font-mono text-[9px] font-bold uppercase tracking-wider active:bg-red-200"
            >
              <Trash2 size={10} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
