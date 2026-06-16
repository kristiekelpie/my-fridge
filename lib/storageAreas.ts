import type { HouseholdItem, Location, StorageArea } from '@/lib/types'
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  LOCATION_LABELS,
  groupItemsByCategory,
} from '@/lib/types'

export const STORAGE_AREAS = ['fridge', 'pantry', 'cupboard', 'wine_fridge'] as const satisfies readonly StorageArea[]

export const STORAGE_AREA_LABELS: Record<StorageArea, string> = {
  fridge: 'Fridge',
  pantry: 'Pantry',
  cupboard: 'Cupboard',
  wine_fridge: 'Wine Fridge',
}

export const STORAGE_AREA_HEADING: Record<StorageArea, string> = {
  fridge: 'FRIDGE',
  pantry: 'PANTRY',
  cupboard: 'CUPBOARD',
  wine_fridge: 'WINE FRIDGE',
}

export const FRIDGE_LOCATIONS: Location[] = [
  'freezer',
  'shelf1',
  'shelf2',
  'upper_drawer',
  'shelf3',
  'lower_drawer',
  'door',
]

export const PANTRY_LOCATIONS: Location[] = ['pantry_main']
export const CUPBOARD_LOCATIONS: Location[] = ['cupboard_main']
export const WINE_LOCATIONS: Location[] = ['wine_main']

export const LOCATIONS_BY_AREA: Record<StorageArea, Location[]> = {
  fridge: FRIDGE_LOCATIONS,
  pantry: PANTRY_LOCATIONS,
  cupboard: CUPBOARD_LOCATIONS,
  wine_fridge: WINE_LOCATIONS,
}

export function normalizeStorageArea(raw?: string | null): StorageArea {
  if (raw && raw in STORAGE_AREA_LABELS) return raw as StorageArea
  return 'fridge'
}

export function getDefaultLocation(area: StorageArea): Location {
  return LOCATIONS_BY_AREA[area][0]
}

export function filterItemsByArea(items: HouseholdItem[], area: StorageArea): HouseholdItem[] {
  return items.filter(item => normalizeStorageArea(item.storage_area) === area)
}

export function isLocationInArea(location: Location, area: StorageArea): boolean {
  return LOCATIONS_BY_AREA[area].includes(location)
}

export type StorageAreaListSection = {
  key: string
  label: string
  emoji?: string
  items: HouseholdItem[]
}

export type StorageAreaListGroup = {
  area: StorageArea
  sections: StorageAreaListSection[]
}

/** Group items by storage area, then by location (fridge) or food category (single-compartment areas). */
export function groupItemsByStorageArea(items: HouseholdItem[]): StorageAreaListGroup[] {
  return STORAGE_AREAS.map(area => {
    const areaItems = filterItemsByArea(items, area)
    if (areaItems.length === 0) return null

    const locations = LOCATIONS_BY_AREA[area]
    let sections: StorageAreaListSection[]

    if (locations.length === 1) {
      sections = groupItemsByCategory(areaItems).map(({ category, items: categoryItems }) => ({
        key: category,
        label: CATEGORY_LABELS[category],
        emoji: CATEGORY_EMOJI[category],
        items: categoryItems,
      }))
    } else {
      sections = locations
        .map(location => ({
          key: location,
          label: LOCATION_LABELS[location],
          items: areaItems
            .filter(item => item.location === location)
            .sort(
              (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
            ),
        }))
        .filter(section => section.items.length > 0)
    }

    return sections.length > 0 ? { area, sections } : null
  }).filter((group): group is StorageAreaListGroup => group !== null)
}
