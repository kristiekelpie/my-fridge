import type { PolaroidSlot } from '@/components/fridge/DoorPolaroid'

const KEYS: Record<PolaroidSlot, string> = {
  upper: 'fridge-door-upper',
  lower: 'fridge-door-lower',
}

export function getLocalDoorPhoto(slot: PolaroidSlot): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEYS[slot])
}

export function setLocalDoorPhoto(slot: PolaroidSlot, url: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS[slot], url)
}

export function getLocalDoorPhotos(): { upper: string | null; lower: string | null } {
  return {
    upper: getLocalDoorPhoto('upper'),
    lower: getLocalDoorPhoto('lower'),
  }
}
