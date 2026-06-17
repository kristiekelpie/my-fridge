'use client'

import type { MealNote } from '@/lib/types'

interface Props {
  notes: MealNote[]
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const MEALS = ['BREAKFAST', 'LUNCH', 'DINNER']

function noteText(notes: MealNote[], index: number) {
  const note = notes[index]
  if (!note) return index % 4 === 0 ? 'plan' : ''
  const text = note.title.trim() || note.content.trim().split('\n')[0]?.trim() || 'meal'
  return text.length > 12 ? `${text.slice(0, 11)}…` : text
}

function Pin({ className = '' }: { className?: string }) {
  return (
    <span
      className={`absolute z-10 h-2.5 w-2.5 rounded-full bg-[#D8C24A] shadow-[1px_2px_3px_rgba(0,0,0,0.35)] border border-yellow-700/30 ${className}`}
      aria-hidden
    />
  )
}

export default function WeeklyMealPlannerMagnet({ notes, onClick, className = '', style }: Props) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className={`absolute z-[18] active:scale-[0.98] transition-transform ${className}`}
      style={style}
      aria-label="Open weekly meal planner"
    >
      <div className="relative w-[6.35rem] sm:w-[7.5rem] rounded-[2px] border border-white/30 bg-stone-700/55 shadow-[2px_4px_10px_rgba(0,0,0,0.22)] backdrop-blur-[1px] px-2 pt-2 pb-1.5">
        <Pin className="-top-1 -left-1" />
        <Pin className="-top-1 -right-1" />
        <Pin className="-bottom-1 -left-1" />
        <Pin className="-bottom-1 -right-1" />

        <p className="font-mono text-[7px] sm:text-[8px] tracking-[0.22em] text-white uppercase leading-none mb-1">
          Weekly Meal Planner
        </p>
        <div className="grid grid-cols-[1fr_repeat(3,1fr)] text-white">
          <span aria-hidden />
          {MEALS.map(meal => (
            <span
              key={meal}
              className="pb-0.5 font-mono text-[3.7px] sm:text-[4.2px] tracking-wider leading-none"
            >
              {meal}
            </span>
          ))}
          {DAYS.map((day, row) => (
            <div key={day} className="contents">
              <span className="border-r border-white/65 py-0.5 font-mono text-[5.5px] sm:text-[6px] tracking-wider leading-none">
                {day}
              </span>
              {MEALS.map((meal, col) => (
                <span
                  key={`${day}-${meal}`}
                  className={`min-h-[0.72rem] sm:min-h-[0.84rem] border-b border-white/65 px-0.5 py-[1px] font-mono text-[5.2px] sm:text-[5.8px] leading-[0.9] text-white ${
                    col < MEALS.length - 1 ? 'border-r border-white/65' : ''
                  }`}
                >
                  {noteText(notes, row * MEALS.length + col)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </button>
  )
}
