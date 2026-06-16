'use client'

import { useState } from 'react'
import { isExpiringWithinDays, EXPIRING_SOON_DAYS } from '@/lib/types'
import { STORAGE_AREA_HEADING } from '@/lib/storageAreas'
import type { StorageArea, HouseholdItem } from '@/lib/types'
import CabinetClosed from './CabinetClosed'
import ItemListByCategory from '@/components/fridge/ItemListByCategory'
import {
  CABINET_HEIGHT_CLASS,
  CUPBOARD_HEIGHT_CLASS,
  WINE_FRIDGE_HEIGHT_CLASS,
  ExpiringStamp,
  InstockStamp,
  SwipeHint,
  TapToOpenDesktop,
  TapToOpenMobile,
} from './StorageStamps'

interface Props {
  area: Exclude<StorageArea, 'fridge'>
  items: HouseholdItem[]
  showSwipeHint?: boolean
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
  onOpenInventory: () => void
  onOpenExpiring: () => void
}

export default function CabinetHomeView({
  area,
  items,
  showSwipeHint = false,
  onEdit,
  onDelete,
  onOpenInventory,
  onOpenExpiring,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const totalItems = items.length
  const expiringCount = items.filter(i => isExpiringWithinDays(i.expiry_date, EXPIRING_SOON_DAYS)).length

  if (isOpen) {
    return (
      <ItemListByCategory
        title={STORAGE_AREA_HEADING[area]}
        subtitle={`${totalItems} item${totalItems !== 1 ? 's' : ''} — grouped by category`}
        items={items}
        onBack={() => setIsOpen(false)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 paper overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-1.5 sm:px-6 pt-[max(0.25rem,env(safe-area-inset-top))] pb-2 sm:pb-4 overflow-visible w-full">
        <div className="shrink-0 mb-1 text-center px-3 sm:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">Nic + Kris</p>
          <h1 className="font-mono text-2xl tracking-tight text-stone-900">
            <span className="font-bold">OUR</span>{' '}
            <span className="editorial-underline">{STORAGE_AREA_HEADING[area]}</span>
          </h1>
        </div>

        <div className="relative shrink-0 mx-auto w-fit max-w-full overflow-visible">
          {area === 'cupboard' ? (
            <div
              className="absolute z-20 -rotate-6"
              style={{ top: '2%', right: '-0.25rem', transform: 'translate(8%, -10%) rotate(-6deg)' }}
            >
              <InstockStamp totalItems={totalItems} compact onClick={onOpenInventory} />
            </div>
          ) : (
            <>
              <div className="absolute z-20 sm:hidden -rotate-6" style={{ top: '3%', left: '76%' }}>
                <InstockStamp totalItems={totalItems} compact onClick={onOpenInventory} />
              </div>
              <div
                className="hidden sm:block absolute z-10"
                style={{ top: '2%', left: '100%', marginLeft: '-0.5rem', transform: 'rotate(-4deg)' }}
              >
                <InstockStamp totalItems={totalItems} onClick={onOpenInventory} />
              </div>
            </>
          )}

          <TapToOpenMobile />
          <TapToOpenDesktop />
          <SwipeHint show={showSwipeHint} />

          {area !== 'cupboard' && (
            <>
              <div
                className="hidden sm:block absolute z-20"
                style={{ bottom: '14%', left: '100%', marginLeft: '0.25rem' }}
              >
                <ExpiringStamp count={expiringCount} onClick={onOpenExpiring} />
              </div>
              <div
                className="sm:hidden absolute z-20 -rotate-3"
                style={{ top: '76%', right: '-0.25rem', transform: 'translate(8%, 0) rotate(-3deg)' }}
              >
                <ExpiringStamp count={expiringCount} compact onClick={onOpenExpiring} />
              </div>
            </>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="block w-fit mx-auto"
              aria-label={`Open ${STORAGE_AREA_HEADING[area]}`}
            >
              <CabinetClosed
                area={area}
                className={
                  area === 'wine_fridge'
                    ? WINE_FRIDGE_HEIGHT_CLASS
                    : area === 'cupboard'
                      ? CUPBOARD_HEIGHT_CLASS
                      : CABINET_HEIGHT_CLASS
                }
              />
            </button>
            {area === 'cupboard' && (
              <>
                <div
                  className="hidden sm:block absolute z-20 left-1/2 -translate-x-1/2"
                  style={{ top: '100%', marginTop: '0.15rem' }}
                >
                  <ExpiringStamp count={expiringCount} below onClick={onOpenExpiring} />
                </div>
                <div
                  className="sm:hidden absolute z-20 left-1/2 -translate-x-1/2"
                  style={{ top: '100%', marginTop: '0.1rem' }}
                >
                  <ExpiringStamp count={expiringCount} compact below onClick={onOpenExpiring} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
