import type { PolaroidSlot } from '@/components/fridge/DoorPolaroid'

const memory = new Map<string, string>()
const SESSION_PREFIX = 'door-thumb:'
const THUMB_MAX_PX = 320

function persistThumb(url: string, dataUrl: string) {
  memory.set(url, dataUrl)
  try {
    sessionStorage.setItem(SESSION_PREFIX + url, dataUrl)
    localStorage.setItem(SESSION_PREFIX + url, dataUrl)
  } catch {
    // storage full — memory cache still helps this session
  }
}

export function peekCachedDoorPhoto(url: string | null | undefined): string | null {
  if (!url) return null
  if (memory.has(url)) return memory.get(url)!
  if (typeof window === 'undefined') return null
  try {
    const sessionStored = sessionStorage.getItem(SESSION_PREFIX + url)
    if (sessionStored) {
      memory.set(url, sessionStored)
      return sessionStored
    }
    const localStored = localStorage.getItem(SESSION_PREFIX + url)
    if (localStored) {
      memory.set(url, localStored)
      return localStored
    }
  } catch {
    // ignore
  }
  return null
}

function urlToResizedDataUrl(url: string, maxPx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Could not load door photo'))
    img.src = url
  })
}

const inflight = new Map<string, Promise<string>>()

export function ensureDoorPhotoCached(url: string): Promise<string> {
  const cached = peekCachedDoorPhoto(url)
  if (cached) return Promise.resolve(cached)

  const pending = inflight.get(url)
  if (pending) return pending

  const task = urlToResizedDataUrl(url, THUMB_MAX_PX)
    .then(dataUrl => {
      persistThumb(url, dataUrl)
      return dataUrl
    })
    .catch(() => url)
    .finally(() => {
      inflight.delete(url)
    })

  inflight.set(url, task)
  return task
}

export function warmDoorPhotoCache(urls: (string | null | undefined)[]) {
  for (const url of urls) {
    if (!url || peekCachedDoorPhoto(url)) continue
    void ensureDoorPhotoCached(url)
  }
}

export function seedDoorPhotoCache(url: string, dataUrl: string) {
  persistThumb(url, dataUrl)
}

export function warmDoorPhotoCacheFromSlots(urls: Record<PolaroidSlot, string | null>) {
  warmDoorPhotoCache([urls.upper, urls.lower, urls.left, urls.right])
}
