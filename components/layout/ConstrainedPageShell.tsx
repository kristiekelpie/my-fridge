'use client'

interface Props {
  children: React.ReactNode
  className?: string
}

/** Centered reading column on desktop; full width on mobile. */
export const DESKTOP_PAGE_COLUMN_CLASS =
  'flex flex-1 flex-col min-h-0 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:mx-auto sm:border-x sm:border-stone-300/45'

export default function ConstrainedPageShell({ children, className = '' }: Props) {
  return (
    <div className={`flex-1 flex flex-col min-h-0 paper relative ${className}`}>
      <div className={DESKTOP_PAGE_COLUMN_CLASS}>{children}</div>
    </div>
  )
}
