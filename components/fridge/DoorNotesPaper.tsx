'use client'

import { MealNote, ShoppingItem } from '@/lib/types'
import HeartMagnet from './HeartMagnet'

interface Props {
  onClick: () => void
  notes: MealNote[]
  shopping: ShoppingItem[]
  className?: string
  style?: React.CSSProperties
}

const MAX_NOTES = 2
const MAX_SHOP = 4

function truncateLine(text: string, max: number) {
  const line = text.trim().split('\n')[0]?.trim() ?? ''
  if (line.length <= max) return line
  return `${line.slice(0, max - 1)}…`
}

function noteFirstLine(note: MealNote) {
  const title = note.title.trim()
  if (title) return title
  return note.content.trim().split('\n')[0]?.trim() ?? ''
}

export default function DoorNotesPaper({ onClick, notes, shopping, className = '', style }: Props) {
  const notePreview = notes.slice(0, MAX_NOTES)
  const unchecked = shopping.filter(i => !i.checked)
  const shopPreview = unchecked.slice(0, MAX_SHOP)

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
          className="w-[6rem] sm:w-[6.75rem] h-[calc(9.25rem-12px)] sm:h-[calc(9.75rem-12px)] bg-white shadow-[2px_4px_10px_rgba(0,0,0,0.15)] pt-3 px-1.5 pb-1 overflow-hidden"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 10px,
              #CBD5E1 10px,
              #CBD5E1 11px
            )`,
            backgroundPositionY: '15px',
          }}
        >
          {/* Torn top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-white"
            style={{
              clipPath: 'polygon(0% 100%, 5% 0%, 12% 100%, 20% 20%, 28% 100%, 38% 10%, 48% 100%, 58% 15%, 68% 100%, 78% 5%, 88% 100%, 95% 20%, 100% 100%)',
            }}
          />

          <div className="relative z-10 -rotate-1 text-left pt-0.5">
            <div className="space-y-2">
              <div>
                <p className="font-biro text-[13px] sm:text-[14px] leading-none text-[#1e3a5f] ml-0.5 font-semibold">
                  Notes
                </p>
                {notePreview.length === 0 ? (
                  <p className="font-hand text-[11px] sm:text-[12px] leading-tight text-stone-400 ml-1 mt-0.5 truncate">—</p>
                ) : (
                  <ul className="mt-0.5 space-y-0.5 ml-1">
                    {notePreview.map(note => (
                      <li
                        key={note.id}
                        className="font-hand text-[11px] sm:text-[12px] leading-snug text-stone-800 truncate"
                      >
                        {truncateLine(noteFirstLine(note), 18)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="font-biro text-[13px] sm:text-[14px] leading-none text-[#1e3a5f] ml-0.5 font-semibold">
                  Shopping List
                </p>
                {shopPreview.length === 0 ? (
                  <p className="font-hand text-[11px] sm:text-[12px] leading-tight text-stone-400 ml-1 mt-0.5 truncate">—</p>
                ) : (
                  <ul className="mt-0.5 space-y-0.5 ml-1">
                    {shopPreview.map(item => (
                      <li
                        key={item.id}
                        className="font-hand text-[11px] sm:text-[12px] leading-snug text-stone-800 truncate"
                      >
                        {truncateLine(item.name, 18)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
