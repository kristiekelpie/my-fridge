'use client'

import { HouseholdItem, Location, LOCATION_LABELS } from '@/lib/types'
import ItemCard from '@/components/items/ItemCard'
import { ChevronLeft } from 'lucide-react'

interface Props {
  zone: Location
  items: HouseholdItem[]
  onBack: () => void
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ZoneInterior({ zone, items, onBack, onEdit, onDelete }: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-0 paper">
      {/* Editorial header */}
      <div className="px-5 pt-5 pb-4 border-b border-stone-400/40">
        <button
          onClick={onBack}
          className="flex items-center gap-2 -ml-2 mb-3 py-2 pr-3 rounded-md active:bg-stone-200/80 font-mono text-sm tracking-[0.15em] uppercase text-stone-700 active:text-stone-900"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          Back
        </button>
        <h2 className="font-mono text-2xl tracking-tight text-stone-900">
          <span className="editorial-underline font-bold">{LOCATION_LABELS[zone]}</span>
        </h2>
        <p className="font-hand text-base text-stone-600 mt-1">
          {items.length === 0 ? 'nothing here yet' : `${items.length} item${items.length !== 1 ? 's' : ''} — sorted by expiry`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <span className="text-5xl mb-3">🗒</span>
            <p className="font-hand text-lg">empty for now</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => (
              <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
