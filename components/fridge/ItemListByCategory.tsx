'use client'

import { HouseholdItem, CATEGORY_EMOJI, CATEGORY_LABELS, groupItemsByCategory } from '@/lib/types'
import ItemCard from '@/components/items/ItemCard'
import { ChevronLeft } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
  items: HouseholdItem[]
  onBack: () => void
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ItemListByCategory({ title, subtitle, items, onBack, onEdit, onDelete }: Props) {
  const groups = groupItemsByCategory(items)

  return (
    <div className="flex-1 flex flex-col min-h-0 paper">
      <div className="px-5 pt-5 pb-4 border-b border-stone-400/40 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 -ml-2 mb-3 py-2 pr-3 rounded-md active:bg-stone-200/80 font-mono text-sm tracking-[0.15em] uppercase text-stone-700 active:text-stone-900"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          Back
        </button>
        <h2 className="font-mono text-2xl tracking-tight text-stone-900">
          <span className="editorial-underline font-bold">{title}</span>
        </h2>
        <p className="font-mono text-sm text-stone-600 mt-1 tracking-tight">{subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <span className="text-5xl mb-3">🗒</span>
            <p className="font-hand text-lg">nothing here yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(({ category, items: groupItems }) => (
              <section key={category}>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-stone-300/70">
                  <span className="text-xl">{CATEGORY_EMOJI[category]}</span>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-stone-800">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <span className="font-mono text-[10px] text-stone-400 ml-auto">
                    {groupItems.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {groupItems.map(item => (
                    <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
