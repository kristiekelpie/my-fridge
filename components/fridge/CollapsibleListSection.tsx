'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  label: string
  itemCount: number
  emoji?: string
  defaultOpen?: boolean
  nested?: boolean
  layout?: 'grid' | 'stack'
  children: React.ReactNode
}

export default function CollapsibleListSection({
  label,
  itemCount,
  emoji,
  defaultOpen = true,
  nested = false,
  layout = 'grid',
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={nested ? 'pl-3' : undefined}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 text-left ${
          nested
            ? '-mx-5 px-5 py-2 bg-stone-50/90 active:bg-stone-100'
            : '-mx-5 px-5 py-2.5 bg-stone-100/80 active:bg-stone-200/70'
        }`}
        aria-expanded={open}
      >
        <ChevronDown
          size={nested ? 14 : 16}
          className={`shrink-0 text-stone-600 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        {emoji && <span className={`leading-none ${nested ? 'text-base' : 'text-lg'}`}>{emoji}</span>}
        <h3
          className={`font-mono uppercase tracking-wider text-stone-800 flex-1 min-w-0 truncate ${
            nested ? 'text-xs font-semibold' : 'text-sm font-bold'
          }`}
        >
          {label}
        </h3>
        <span className="font-mono text-[10px] text-stone-400 shrink-0">{itemCount}</span>
      </button>

      {open && (
        <div className={nested ? 'pt-2 pb-3' : layout === 'stack' ? 'pt-1 pb-4' : 'pt-3 pb-4'}>
          {layout === 'grid' ? (
            <div className="grid grid-cols-3 gap-2">{children}</div>
          ) : (
            <div className="divide-y divide-stone-200/60">{children}</div>
          )}
        </div>
      )}
    </section>
  )
}
