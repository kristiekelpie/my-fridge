export type Category =
  | 'protein'
  | 'vegetables'
  | 'dairy'
  | 'sauces'
  | 'starch'
  | 'cooked_food'
  | 'fruits'
  | 'condiments'
  | 'drinks'
  | 'other'

export type Location = 'freezer' | 'shelf1' | 'shelf2' | 'upper_drawer' | 'shelf3' | 'lower_drawer' | 'door'
export type Store = 'Costco' | 'Walmart' | 'Albertsons' | 'Any' | 'Other'
export type ShoppingCategory = 'food' | 'household' | 'personal'
export type ExpiryStatus = 'fresh' | 'soon' | 'urgent' | 'expired'

export interface HouseholdItem {
  id: string
  created_at: string
  updated_at: string
  name: string
  category: Category
  expiry_date: string
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
  'dairy',
  'sauces',
  'starch',
  'cooked_food',
  'fruits',
  'condiments',
  'drinks',
  'other',
]

export const CATEGORY_LABELS: Record<Category, string> = {
  protein: 'Protein',
  vegetables: 'Vegetables',
  dairy: 'Dairy',
  sauces: 'Sauces',
  starch: 'Starch',
  cooked_food: 'Cooked Food',
  fruits: 'Fruits',
  condiments: 'Condiments',
  drinks: 'Drinks',
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
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  protein: '🥩',
  vegetables: '🥦',
  dairy: '🧀',
  sauces: '🍝',
  starch: '🍚',
  cooked_food: '🍱',
  fruits: '🍎',
  condiments: '🧂',
  drinks: '🥤',
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

export function normalizeItem(item: HouseholdItem): HouseholdItem {
  return { ...item, category: normalizeCategory(item.category) }
}

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isExpiringWithinDays(expiryDate: string, days: number = 3): boolean {
  return daysUntilExpiry(expiryDate) <= days
}

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const diffDays = daysUntilExpiry(expiryDate)

  if (diffDays < 0) return 'expired'
  if (diffDays <= 2) return 'urgent'
  if (diffDays <= 4) return 'soon'
  return 'fresh'
}

export const EXPIRY_STATUS_CONFIG: Record<ExpiryStatus, { label: string; bg: string; text: string; border: string }> = {
  fresh: { label: 'Fresh', bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-300' },
  soon: { label: 'Soon', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
  expired: { label: 'Expired', bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
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
