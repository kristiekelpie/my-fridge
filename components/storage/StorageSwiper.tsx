'use client'

import { useRef, useCallback, useEffect, useState, type ReactNode } from 'react'
import { STORAGE_AREAS, STORAGE_AREA_LABELS } from '@/lib/storageAreas'
import type { StorageArea } from '@/lib/types'
import { StoragePanelActiveContext } from './StoragePanelContext'

interface Props {
  activeArea: StorageArea
  onAreaChange: (area: StorageArea) => void
  children: ReactNode[]
}

const PANEL_COUNT = STORAGE_AREAS.length
/** [wine clone, fridge, pantry, cupboard, wine, fridge clone] */
const TOTAL_PANELS = PANEL_COUNT + 2
const START_INDEX = 1

function logicalIndex(area: StorageArea) {
  return STORAGE_AREAS.indexOf(area)
}

function logicalFromPhysical(physical: number) {
  return (physical - START_INDEX + PANEL_COUNT) % PANEL_COUNT
}

function primaryPhysical(logical: number) {
  return logical + START_INDEX
}

function clonePhysical(logical: number) {
  if (logical === PANEL_COUNT - 1) return 0
  if (logical === 0) return TOTAL_PANELS - 1
  return primaryPhysical(logical)
}

function nearestPhysical(logical: number, currentPhysical: number) {
  const primary = primaryPhysical(logical)
  const clone = clonePhysical(logical)
  return Math.abs(primary - currentPhysical) <= Math.abs(clone - currentPhysical)
    ? primary
    : clone
}

export default function StorageSwiper({ activeArea, onAreaChange, children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipExternalScroll = useRef(false)
  const isJumping = useRef(false)
  const mounted = useRef(false)
  const activePhysicalRef = useRef(START_INDEX)
  const [activePhysical, setActivePhysical] = useState(START_INDEX)

  const scrollToPhysical = useCallback((index: number, smooth: boolean) => {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    el.scrollTo({ left: index * el.clientWidth, behavior: smooth ? 'smooth' : 'instant' })
    activePhysicalRef.current = index
    setActivePhysical(index)
  }, [])

  const normalizeLoopPosition = useCallback(() => {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0 || isJumping.current) return

    const physical = Math.round(el.scrollLeft / el.clientWidth)

    if (physical === 0) {
      isJumping.current = true
      el.scrollTo({ left: primaryPhysical(PANEL_COUNT - 1) * el.clientWidth, behavior: 'instant' })
      activePhysicalRef.current = primaryPhysical(PANEL_COUNT - 1)
      setActivePhysical(primaryPhysical(PANEL_COUNT - 1))
      isJumping.current = false
    } else if (physical === TOTAL_PANELS - 1) {
      isJumping.current = true
      el.scrollTo({ left: START_INDEX * el.clientWidth, behavior: 'instant' })
      activePhysicalRef.current = START_INDEX
      setActivePhysical(START_INDEX)
      isJumping.current = false
    }
  }, [])

  const settleScroll = useCallback(() => {
    if (isJumping.current) return

    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return

    normalizeLoopPosition()

    const physical = Math.round(el.scrollLeft / el.clientWidth)
    activePhysicalRef.current = physical
    setActivePhysical(physical)

    const area = STORAGE_AREAS[logicalFromPhysical(physical)]

    if (area !== activeArea) {
      skipExternalScroll.current = true
      onAreaChange(area)
    }
  }, [activeArea, normalizeLoopPosition, onAreaChange])

  const scheduleSettle = useCallback(() => {
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(settleScroll, 80)
  }, [settleScroll])

  useEffect(() => {
    scrollToPhysical(primaryPhysical(logicalIndex(activeArea)), false)
    mounted.current = true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted.current) return
    if (skipExternalScroll.current) {
      skipExternalScroll.current = false
      return
    }
    scrollToPhysical(nearestPhysical(logicalIndex(activeArea), activePhysicalRef.current), true)
  }, [activeArea, scrollToPhysical])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScrollEnd = () => {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
      settleScroll()
    }

    const onScroll = () => scheduleSettle()

    const onResize = () => {
      scrollToPhysical(activePhysicalRef.current, false)
    }

    el.addEventListener('scrollend', onScrollEnd)
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('scrollend', onScrollEnd)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
    }
  }, [scheduleSettle, scrollToPhysical, settleScroll])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none min-h-0"
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'auto' }}
      >
        {Array.from({ length: TOTAL_PANELS }, (_, i) => {
          const logical = logicalFromPhysical(i)
          const isActive = i === activePhysical
          return (
            <div
              key={`${STORAGE_AREAS[logical]}-${i}`}
              className="w-full shrink-0 snap-start snap-always flex flex-col min-h-0 overflow-hidden"
              aria-hidden={!isActive}
            >
              <StoragePanelActiveContext.Provider value={isActive}>
                {children[logical]}
              </StoragePanelActiveContext.Provider>
            </div>
          )
        })}
      </div>

      <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 border-t border-stone-300/50 bg-[#E8E4D7]/80">
        {STORAGE_AREAS.map(area => {
          const selected = area === activeArea
          return (
            <button
              key={area}
              type="button"
              onClick={() => onAreaChange(area)}
              className={`font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                selected
                  ? 'bg-stone-900 text-stone-50 border-stone-900'
                  : 'bg-stone-50/80 text-stone-600 border-stone-300 active:bg-stone-100'
              }`}
              aria-current={selected ? 'page' : undefined}
            >
              {STORAGE_AREA_LABELS[area]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
