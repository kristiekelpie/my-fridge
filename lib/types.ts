export type Category = 'meat' | 'vegetables' | 'dairy' | 'jarred_sauces' | 'drinks' | 'other'
export type Location = 'freezer' | 'shelf1' | 'shelf2' | 'upper_drawer' | 'shelf3' | 'lower_drawer' | 'door'
export type Store = 'Costco' | 'Walmart' | 'Albertsons' | 'Any'
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
  checked: boolean
}

export const CATEGORY_LABELS: Record<Category, string> = {
  meat: 'Meat',
  vegetables: 'Vegetables',
  dairy: 'Dairy',
  jarred_sauces: 'Jarred Sauces',
  drinks: 'Drinks',
  other: 'Other',
}

export const LOCATION_LABELS: Record<Location, string> = {
  freezer: 'Freezer',
  shelf1: '1st Shelf',
  shelf2: '2nd Shelf',
  upper_drawer: 'Upper Drawer',
  shelf3: '3rd Shelf',
  lower_drawer: 'Lower Drawer',
  door: 'Door',
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  meat: '🥩',
  vegetables: '🥦',
  dairy: '🧀',
  jarred_sauces: '🫙',
  drinks: '🥤',
  other: '📦',
}

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 1) return 'urgent'
  if (diffDays <= 4) return 'soon'
  return 'fresh'
}

export const EXPIRY_STATUS_CONFIG: Record<ExpiryStatus, { label: string; bg: string; text: string; border: string }> = {
  fresh: { label: 'Fresh', bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-300' },
  soon: { label: 'Soon', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
  expired: { label: 'Expired', bg: 'bg-stone-200', text: 'text-stone-600', border: 'border-stone-300' },
}
