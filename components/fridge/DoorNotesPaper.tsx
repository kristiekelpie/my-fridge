'use client'

import HeartMagnet from './HeartMagnet'

interface Props {
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

export default function DoorNotesPaper({ onClick, className = '', style }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`absolute z-20 active:scale-[0.98] transition-transform ${className}`}
      style={style}
      aria-label="Open meal notes and shopping list"
    >
      <div className="relative">
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}
        >
          <HeartMagnet />
        </div>
        <div
          className="w-[3.75rem] sm:w-[4.25rem] h-[5rem] sm:h-[5.5rem] bg-white shadow-[2px_4px_10px_rgba(0,0,0,0.15)] pt-4 px-1"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 11px,
              #CBD5E1 11px,
              #CBD5E1 12px
            )`,
            backgroundPositionY: '18px',
          }}
        >
          {/* Torn top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-white"
            style={{
              clipPath: 'polygon(0% 100%, 5% 0%, 12% 100%, 20% 20%, 28% 100%, 38% 10%, 48% 100%, 58% 15%, 68% 100%, 78% 5%, 88% 100%, 95% 20%, 100% 100%)',
            }}
          />
          <p className="relative z-10 font-biro text-[15px] sm:text-[17px] leading-none text-[#1e3a5f] -rotate-2 mt-0.5 ml-0.5">
            NOTES
          </p>
        </div>
      </div>
    </button>
  )
}
