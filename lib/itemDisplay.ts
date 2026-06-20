import { Category, HouseholdItem, normalizeCategory } from '@/lib/types'
import { ItemStoragePlace, normalizeStorageArea } from '@/lib/storageAreas'

/** Item card / photo crop aspect — width:height (portrait bottle). */
export const PORTRAIT_ITEM_ASPECT = 2 / 3

export function isPortraitItemCategory(category: Category): boolean {
  return category === 'red_wine' || category === 'white_wine'
}

export function isPortraitStoragePlace(storagePlace: ItemStoragePlace): boolean {
  return storagePlace === 'wine_fridge'
}

export function usesPortraitItemLayout(category: Category, storagePlace: ItemStoragePlace): boolean {
  return isPortraitItemCategory(category) || isPortraitStoragePlace(storagePlace)
}

export function usesPortraitItemCard(item: HouseholdItem): boolean {
  return (
    isPortraitItemCategory(normalizeCategory(item.category)) ||
    normalizeStorageArea(item.storage_area) === 'wine_fridge'
  )
}
