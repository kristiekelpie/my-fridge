export type Category =
  | 'protein'
  | 'vegetables'
  | 'dairy'
  | 'sauces'
  | 'starch'
  | 'dry_goods'
  | 'snacks'
  | 'cooked_food'
  | 'fruits'
  | 'condiments'
  | 'drinks'
  | 'alcohol'
  | 'red_wine'
  | 'white_wine'
  | 'other'

export type Location =
  | 'freezer'
  | 'shelf1'
  | 'shelf2'
  | 'upper_drawer'
  | 'shelf3'
  | 'lower_drawer'
  | 'door'
  | 'pantry_main'
  | 'cupboard_main'
  | 'wine_main'
  | 'pantry_top'
  | 'pantry_middle'
  | 'pantry_bottom'
  | 'pantry_basket'
  | 'cupboard_upper'
  | 'cupboard_lower'
  | 'cupboard_spice'
  | 'wine_top'
  | 'wine_middle'
  | 'wine_bottom'
  | 'wine_door'

export type StorageArea = 'fridge' | 'pantry' | 'cupboard' | 'wine_fridge'
export type Store = 'Costco' | 'Walmart' | 'Albertsons' | 'Any' | 'Other'
export type ShoppingCategory = 'food' | 'household' | 'personal'
export type ExpiryStatus = 'fresh' | 'soon' | 'urgent' | 'expired'

/** Items on the Expiring Soon page when expiry is within this many days (0 = today). */
export const EXPIRING_SOON_DAYS = 4

/** Red badge: today (0) through 2 days out. Yellow badge: 3–4 days out. */
export const EXPIRY_URGENT_MAX_DAYS = 2

/** Default cooked food shelf life when not in the freezer (days from today). */
export const COOKED_FOOD_DAYS = 4

/** Default cooked food shelf life when stored in the freezer (months from today). */
export const COOKED_FOOD_FREEZER_MONTHS = 6

export interface HouseholdItem {
  id: string
  created_at: string
  updated_at: string
  name: string
  category: Category
  expiry_date: string
  storage_area: StorageArea
  location: Location
  photo_url: string | null
  notes: string | null
}

export interface FridgeDoor {
  id: number
  upper_photo_url: string | null
  lower_photo_url: string | null
  left_photo_url: string | null
  updated_at: string
}

export interface MealNote {
  id: string
  created_at: string
  updated_at: string
  title: string
  content: string
}

export interface ShoppingItem {
  id: string
  created_at: string
  updated_at: string
  name: string
  store: Store | null
  category: ShoppingCategory
  checked: boolean
}

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  food: 'Food',
  household: 'Household',
  personal: 'Personal',
}

export const CATEGORIES: Category[] = [
  'protein',
  'vegetables',
  'fruits',
  'dairy',
  'starch',
  'dry_goods',
  'snacks',
  'sauces',
  'condiments',
  'cooked_food',
  'drinks',
  'alcohol',
  'red_wine',
  'white_wine',
  'other',
]

export const CATEGORY_LABELS: Record<Category, string> = {
  protein: 'Protein',
  vegetables: 'Vegetables',
  dairy: 'Dairy',
  sauces: 'Jarred/Sauces',
  starch: 'Carbs/Starch',
  dry_goods: 'Dry Goods',
  snacks: 'Snacks',
  cooked_food: 'Cooked Food',
  fruits: 'Fruits',
  condiments: 'Condiments',
  drinks: 'Drinks',
  alcohol: 'Alcohol',
  red_wine: 'Red Wine',
  white_wine: 'White Wine',
  other: 'Other',
}

export const LOCATION_LABELS: Record<Location, string> = {
  freezer: 'Freezer',
  shelf1: '1st Shelf',
  shelf2: '2nd Shelf',
  upper_drawer: 'Drawer',
  shelf3: '3rd Shelf',
  lower_drawer: 'Lower Drawer',
  door: 'Fridge Door',
  pantry_main: 'Pantry',
  cupboard_main: 'Cupboard',
  wine_main: 'Wine Fridge',
  pantry_top: 'Top Shelf',
  pantry_middle: 'Middle Shelf',
  pantry_bottom: 'Bottom Shelf',
  pantry_basket: 'Basket',
  cupboard_upper: 'Upper Cupboard',
  cupboard_lower: 'Lower Cupboard',
  cupboard_spice: 'Spice Rack',
  wine_top: 'Top Rack',
  wine_middle: 'Middle Rack',
  wine_bottom: 'Bottom Rack',
  wine_door: 'Door Rack',
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  protein: '🥩',
  vegetables: '🥦',
  dairy: '🧀',
  sauces: '🍝',
  starch: '🍚',
  dry_goods: '🌾',
  snacks: '🍿',
  cooked_food: '🍱',
  fruits: '🍎',
  condiments: '🧂',
  drinks: '🥤',
  alcohol: '🍸',
  red_wine: '🍷',
  white_wine: '🥂',
  other: '📦',
}

const LEGACY_CATEGORY_MAP: Record<string, Category> = {
  meat: 'protein',
  jarred_sauces: 'sauces',
}

export function normalizeCategory(raw: string): Category {
  if (raw in LEGACY_CATEGORY_MAP) return LEGACY_CATEGORY_MAP[raw]
  if (raw in CATEGORY_LABELS) return raw as Category
  return 'other'
}

export function normalizeItem(item: HouseholdItem & { storage_area?: StorageArea | null }): HouseholdItem {
  const storage_area =
    item.storage_area && item.storage_area in { fridge: 1, pantry: 1, cupboard: 1, wine_fridge: 1 }
      ? item.storage_area
      : 'fridge'
  return { ...item, category: normalizeCategory(item.category), storage_area }
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatLocalDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getCookedFoodDefaultExpiryDate(location: Location, from = new Date()): string {
  const base = new Date(from)
  base.setHours(0, 0, 0, 0)
  if (location === 'freezer') {
    base.setMonth(base.getMonth() + COOKED_FOOD_FREEZER_MONTHS)
  } else {
    base.setDate(base.getDate() + COOKED_FOOD_DAYS)
  }
  return formatLocalDateISO(base)
}

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = parseLocalDate(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isExpiringWithinDays(expiryDate: string, days: number = EXPIRING_SOON_DAYS): boolean {
  const diff = daysUntilExpiry(expiryDate)
  return diff <= days
}

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const diffDays = daysUntilExpiry(expiryDate)

  if (diffDays < 0) return 'expired'
  if (diffDays <= EXPIRY_URGENT_MAX_DAYS) return 'urgent'
  if (diffDays <= EXPIRING_SOON_DAYS) return 'soon'
  return 'fresh'
}

export const EXPIRY_STATUS_CONFIG: Record<ExpiryStatus, { label: string; bg: string; text: string; border: string }> = {
  fresh: { label: 'Fresh', bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-300' },
  soon: { label: 'Soon', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
  expired: { label: 'Expired', bg: 'bg-stone-900', text: 'text-white', border: 'border-stone-900' },
}

export function groupItemsByCategory(items: HouseholdItem[]): { category: Category; items: HouseholdItem[] }[] {
  const byCategory = new Map<Category, HouseholdItem[]>()

  for (const item of items) {
    const cat = normalizeCategory(item.category)
    const list = byCategory.get(cat) ?? []
    list.push({ ...item, category: cat })
    byCategory.set(cat, list)
  }

  return CATEGORIES
    .filter(cat => (byCategory.get(cat)?.length ?? 0) > 0)
    .map(category => ({
      category,
      items: (byCategory.get(category) ?? []).sort(
        (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      ),
    }))
}
