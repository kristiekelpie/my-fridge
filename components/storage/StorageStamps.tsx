'use client'

export function HandDrawnArrow({
  toward,
  compact = false,
  className = '',
  stroke = '#1A1A1A',
}: {
  toward: 'left' | 'right' | 'up'
  compact?: boolean
  className?: string
  stroke?: string
}) {
  const w = compact ? 48 : 64
  const h = compact ? 32 : 36
  const arrow = {
    stroke,
    strokeWidth: 1.2,
    fill: 'none',
    strokeLinecap: 'round' as const,
  }

  if (toward === 'up') {
    return (
      <svg
        width={compact ? 28 : 34}
        height={compact ? 40 : 48}
        viewBox="0 0 40 56"
        className={className}
      >
        <path d="M 20 50 Q 20 34 20 24 T 14 8" {...arrow} />
        <path d="M 10 12 L 20 3 L 30 12" {...arrow} />
      </svg>
    )
  }

  if (toward === 'left') {
    return (
      <svg width={w} height={h} viewBox="0 0 80 46" className={className}>
        <path d="M 75 5 Q 50 5 40 22 T 5 38" {...arrow} />
        <path d="M 10 33 L 4 38 L 10 43" {...arrow} />
      </svg>
    )
  }

  return (
    <svg width={w} height={h} viewBox="0 0 80 46" className={className}>
      <path d="M 5 5 Q 30 5 40 22 T 75 38" {...arrow} />
      <path d="M 70 33 L 76 38 L 70 43" {...arrow} />
    </svg>
  )
}

export function InstockStamp({
  totalItems,
  compact = false,
  onClick,
}: {
  totalItems: number
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className={`border border-stone-900 rounded-sm bg-stone-50/60 active:scale-[0.98] transition-transform cursor-pointer ${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}`}
      aria-label="View inventory"
    >
      <p className={`font-mono font-bold tracking-tight text-stone-900 leading-none whitespace-nowrap ${compact ? 'text-[11px]' : 'text-lg'}`}>
        instock <span aria-hidden>😊</span>
      </p>
      <p className={`font-mono text-stone-600 tracking-wider text-center whitespace-nowrap ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
        {totalItems} ITEMS
      </p>
    </button>
  )
}

export function ExpiringStamp({
  count,
  compact = false,
  below = false,
  onClick,
}: {
  count: number
  compact?: boolean
  below?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className={`active:scale-[0.98] transition-transform cursor-pointer ${
        below
          ? 'text-center'
          : compact
            ? 'text-right max-w-[72px]'
            : 'text-left max-w-[96px]'
      }`}
      aria-label="View expiring items"
    >
      {below && (
        <HandDrawnArrow
          toward="up"
          compact={compact}
          className="mb-0.5 mx-auto"
        />
      )}
      <p className={`font-mono font-bold tracking-wider text-stone-900 leading-tight ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
        EXPIRING
      </p>
      <p className={`font-mono text-stone-700 mt-0.5 leading-snug ${compact ? 'text-[7px]' : 'text-[9px]'}`}>
        <span className={`font-bold ${count > 0 ? 'text-amber-700' : 'text-stone-400'}`}>{count}</span>
      </p>
      {!below && (
        <HandDrawnArrow
          toward="left"
          compact={compact}
          className={`mt-0.5 ${compact ? 'mr-auto ml-0' : 'ml-auto'}`}
        />
      )}
    </button>
  )
}

export function TapToOpenMobile({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`absolute z-10 pointer-events-none sm:hidden ${className}`}
      style={{ top: '29%', left: '-22%', ...style }}
    >
      <div className="grid grid-cols-[auto_1fr] gap-x-0.5 -rotate-6">
        <span className="font-mono text-stone-900 text-[9px] leading-[1.15]">✻</span>
        <span className="font-mono text-[9px] font-bold tracking-wide text-stone-900 leading-[1.15]">tap</span>
        <span className="col-start-2 font-mono text-[9px] font-bold tracking-wide text-stone-900 leading-[1.15]">to</span>
        <span className="col-start-2 font-mono text-[9px] font-bold tracking-wide text-stone-900 leading-[1.15]">open</span>
        <HandDrawnArrow toward="right" compact className="col-span-2 mt-0.5 ml-3" />
      </div>
    </div>
  )
}

export function TapToOpenDesktop() {
  return (
    <div
      className="hidden sm:block absolute z-10 pointer-events-none"
      style={{ top: '30%', right: '100%', marginRight: '0.35rem' }}
    >
      <div className="flex flex-nowrap items-center gap-1">
        <span className="font-mono text-stone-900 text-sm leading-none">✻</span>
        <span className="font-mono text-[10px] font-bold tracking-wide text-stone-900 whitespace-nowrap">
          TAP&nbsp;TO&nbsp;OPEN
        </span>
      </div>
      <HandDrawnArrow toward="right" className="mt-0.5 ml-2" />
    </div>
  )
}

function StraightArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      width="28"
      height="10"
      viewBox="0 0 28 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M1 5H22" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
      <path d="M18 2L23 5L18 8" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SwipeHint({ show }: { show: boolean }) {
  if (!show) return null
  const desktopHintClass =
    'font-mono text-[9px] tracking-[0.25em] uppercase text-stone-500 whitespace-nowrap'
  const mobileWordClass =
    'font-mono text-[7px] tracking-[0.18em] uppercase text-stone-400 leading-[1.15]'

  return (
    <>
      <div className="absolute z-10 pointer-events-none right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 sm:hidden">
        <div className="grid grid-cols-[auto_1fr] gap-x-0.5 text-stone-400">
          <span className={`${mobileWordClass} col-start-2`}>swipe</span>
          <span className={`${mobileWordClass} col-start-2`}>for</span>
          <span className={`${mobileWordClass} col-start-2`}>more</span>
          <StraightArrow className="col-start-2 mt-0.5 ml-1 scale-[0.85]" />
        </div>
      </div>
      <div
        className="hidden sm:block absolute z-10 pointer-events-none top-1/2 -translate-y-1/2"
        style={{ left: '100%', marginLeft: '7rem' }}
      >
        <div className="flex flex-col items-center text-stone-500">
          <p className={desktopHintClass}>swipe for more</p>
          <StraightArrow className="mt-1" />
        </div>
      </div>
    </>
  )
}

export const CABINET_HEIGHT_CLASS =
  'h-[min(calc(100dvh-6.5rem),calc(100dvh-env(safe-area-inset-bottom)-6.5rem),760px)] sm:h-[min(calc(100dvh-5rem),calc(100dvh-env(safe-area-inset-bottom)-5rem),640px)]'

export const CUPBOARD_HEIGHT_CLASS =
  'h-[min(calc((100dvh-6.5rem)*0.78),calc((100dvh-env(safe-area-inset-bottom)-6.5rem)*0.78),560px)] sm:h-[min(calc((100dvh-5rem)*0.7),calc((100dvh-env(safe-area-inset-bottom)-5rem)*0.7),448px)]'

export const WINE_FRIDGE_HEIGHT_CLASS =
  'h-[min(calc((100dvh-6.5rem)*0.72),calc((100dvh-env(safe-area-inset-bottom)-6.5rem)*0.72),520px)] sm:h-[min(calc((100dvh-5rem)*0.75),calc((100dvh-env(safe-area-inset-bottom)-5rem)*0.75),480px)]'
