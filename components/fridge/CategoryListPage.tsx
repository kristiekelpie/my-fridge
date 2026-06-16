'use client'

import { ChevronLeft } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
  onBack: () => void
  isEmpty: boolean
  emptyMessage?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function CategoryListPage({
  title,
  subtitle,
  onBack,
  isEmpty,
  emptyMessage = 'nothing here yet',
  children,
  footer,
}: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-0 paper relative">
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
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="font-mono text-sm text-stone-400 tracking-tight">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-300/60">{children}</div>
        )}
      </div>

      {footer}
    </div>
  )
}
