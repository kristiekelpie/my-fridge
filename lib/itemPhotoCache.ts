const memory = new Map<string, string>()
const SESSION_PREFIX = 'item-thumb:'
const THUMB_MAX_PX = 240

function persistThumb(url: string, dataUrl: string) {
  memory.set(url, dataUrl)
  try {
    sessionStorage.setItem(SESSION_PREFIX + url, dataUrl)
  } catch {
    // sessionStorage full — memory cache still helps this session
  }
}

export function peekCachedItemPhoto(url: string | null | undefined): string | null {
  if (!url) return null
  if (memory.has(url)) return memory.get(url)!
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(SESSION_PREFIX + url)
    if (stored) {
      memory.set(url, stored)
      return stored
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
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => reject(new Error('Could not load photo'))
    img.src = url
  })
}

const inflight = new Map<string, Promise<string>>()

export function ensureItemPhotoCached(url: string): Promise<string> {
  const cached = peekCachedItemPhoto(url)
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

export function warmItemPhotoCache(urls: (string | null | undefined)[]) {
  for (const url of urls) {
    if (!url || peekCachedItemPhoto(url)) continue
    void ensureItemPhotoCached(url)
  }
}

export function seedItemPhotoCache(url: string, dataUrl: string) {
  persistThumb(url, dataUrl)
}
