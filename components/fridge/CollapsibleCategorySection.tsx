'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Category, CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/types'

interface Props {
  category: Category
  itemCount: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleCategorySection({
  category,
  itemCount,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 -mx-5 px-5 py-2.5 bg-stone-100/80 active:bg-stone-200/70 text-left"
        aria-expanded={open}
      >
        <ChevronDown
          size={16}
          className={`shrink-0 text-stone-600 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        <span className="text-lg leading-none">{CATEGORY_EMOJI[category]}</span>
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-stone-800 flex-1 min-w-0 truncate">
          {CATEGORY_LABELS[category]}
        </h3>
        <span className="font-mono text-[10px] text-stone-400 shrink-0">{itemCount}</span>
      </button>

      {open && (
        <div className="pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">{children}</div>
        </div>
      )}
    </section>
  )
}
