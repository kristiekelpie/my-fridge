'use client'

interface Props {
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

function HeartMagnet() {
  return (
    <svg width="22" height="20" viewBox="0 0 24 22" className="drop-shadow-sm" aria-hidden>
      <path
        d="M12 20.5s-8.5-5.4-8.5-11.2C3.5 6.2 6.4 3.5 9.5 3.5c1.8 0 3.4 1 4.2 2.5.8-1.5 2.4-2.5 4.2-2.5 3.1 0 6 2.7 6 5.8 0 5.8-8.5 11.2-8.5 11.2z"
        fill="#E53935"
      />
      <path
        d="M12 20.5s-8.5-5.4-8.5-11.2C3.5 6.2 6.4 3.5 9.5 3.5c1.8 0 3.4 1 4.2 2.5.8-1.5 2.4-2.5 4.2-2.5 3.1 0 6 2.7 6 5.8 0 5.8-8.5 11.2-8.5 11.2z"
        fill="url(#heartShine)"
        opacity="0.35"
      />
      <defs>
        <linearGradient id="heartShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  )
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
