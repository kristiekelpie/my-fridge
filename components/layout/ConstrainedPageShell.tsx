'use client'

interface Props {
  children: React.ReactNode
  className?: string
}

/** Centered reading column on desktop (+25% vs lg/xl/2xl); full width on mobile. */
export const DESKTOP_PAGE_COLUMN_CLASS =
  'flex flex-1 flex-col min-h-0 w-full sm:max-w-[40rem] md:max-w-[45rem] lg:max-w-[52.5rem] sm:border-x sm:border-stone-300/45 paper sm:shadow-[0_0_32px_rgba(0,0,0,0.04)]'

export default function ConstrainedPageShell({ children, className = '' }: Props) {
  return (
    <div className={`flex-1 flex flex-col min-h-0 relative sm:bg-stone-400/10 ${className}`}>
      <div className="flex flex-1 flex-col min-h-0 w-full sm:items-center">
        <div className={DESKTOP_PAGE_COLUMN_CLASS}>{children}</div>
      </div>
    </div>
  )
}
