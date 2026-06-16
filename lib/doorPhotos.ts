import type { PolaroidSlot } from '@/components/fridge/DoorPolaroid'

const KEYS: Record<PolaroidSlot, string> = {
  upper: 'fridge-door-upper',
  lower: 'fridge-door-lower',
  left: 'fridge-door-left',
}

const SLOT_COLUMN: Record<PolaroidSlot, string> = {
  upper: 'upper_photo_url',
  lower: 'lower_photo_url',
  left: 'left_photo_url',
}

export function getSlotColumn(slot: PolaroidSlot): string {
  return SLOT_COLUMN[slot]
}

export function getLocalDoorPhoto(slot: PolaroidSlot): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEYS[slot])
}

export function setLocalDoorPhoto(slot: PolaroidSlot, url: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEYS[slot], url)
  } catch {
    // localStorage full — photo still shows for this session via state
  }
}

export function getLocalDoorPhotos(): Record<PolaroidSlot, string | null> {
  return {
    upper: getLocalDoorPhoto('upper'),
    lower: getLocalDoorPhoto('lower'),
    left: getLocalDoorPhoto('left'),
  }
}

/** Resize and compress for polaroid display + localStorage. */
export function fileToResizedDataUrl(file: File, maxPx = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image'))
    }
    img.src = objectUrl
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}
