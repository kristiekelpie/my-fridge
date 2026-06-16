'use client'

import { useMemo, useRef, useState } from 'react'
import { filterByName } from '@/lib/suggestions'

interface Props<T extends { name: string; last_used_at: string }> {
  value: string
  onChange: (value: string) => void
  suggestions: T[]
  onSelectSuggestion: (suggestion: T) => void
  getSubLabel?: (suggestion: T) => string
  placeholder?: string
  className?: string
  inputClassName?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  recentLabel?: string
}

export default function SuggestionNameInput<T extends { name: string; last_used_at: string }>({
  value,
  onChange,
  suggestions,
  onSelectSuggestion,
  getSubLabel,
  placeholder,
  className = '',
  inputClassName = '',
  onKeyDown,
  recentLabel = 'Recent',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const matches = useMemo(
    () => filterByName(suggestions, value, 8),
    [suggestions, value]
  )

  const recentChips = useMemo(
    () => filterByName(suggestions, '', 6),
    [suggestions]
  )

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    setOpen(true)
    setHighlightIndex(-1)
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => {
      setOpen(false)
      setHighlightIndex(-1)
    }, 150)
  }

  function pick(suggestion: T) {
    onSelectSuggestion(suggestion)
    setOpen(false)
    setHighlightIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (open && matches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex(i => (i + 1) % matches.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex(i => (i <= 0 ? matches.length - 1 : i - 1))
        return
      }
      if (e.key === 'Enter' && highlightIndex >= 0) {
        e.preventDefault()
        pick(matches[highlightIndex])
        return
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setHighlightIndex(-1)
        return
      }
    }
    onKeyDown?.(e)
  }

  const showDropdown = open && matches.length > 0
  const showRecent = !value.trim() && recentChips.length > 0

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setOpen(true)
          setHighlightIndex(-1)
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />

      {showDropdown && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-lg py-1">
          {matches.map((item, index) => (
            <li key={item.name + item.last_used_at}>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => pick(item)}
                className={`w-full text-left px-3 py-2 text-sm ${
                  index === highlightIndex ? 'bg-stone-100' : 'active:bg-stone-50'
                }`}
              >
                <span className="text-stone-900">{item.name}</span>
                {getSubLabel && (
                  <span className="block font-mono text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
                    {getSubLabel(item)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showRecent && (
        <div className="mt-2">
          <p className="font-mono text-[9px] uppercase tracking-wider text-stone-400 mb-1.5">{recentLabel}</p>
          <div className="flex flex-wrap gap-1.5">
            {recentChips.map(item => (
              <button
                key={item.name + item.last_used_at}
                type="button"
                onClick={() => pick(item)}
                className="px-2.5 py-1 rounded-full border border-stone-200 bg-white text-xs text-stone-700 active:bg-stone-100"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
