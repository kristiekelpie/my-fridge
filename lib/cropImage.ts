export type CropArea = { x: number; y: number; width: number; height: number }

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

/** Crop a region from an image and return a compressed JPEG data URL. */
export async function cropImageToDataUrl(
  imageSrc: string,
  crop: CropArea,
  maxPx = 480
): Promise<string> {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas')

  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

  const scale = Math.min(1, maxPx / Math.max(canvas.width, canvas.height))
  if (scale < 1) {
    const w = Math.round(canvas.width * scale)
    const h = Math.round(canvas.height * scale)
    const resized = document.createElement('canvas')
    resized.width = w
    resized.height = h
    resized.getContext('2d')?.drawImage(canvas, 0, 0, w, h)
    return resized.toDataURL('image/jpeg', 0.82)
  }

  return canvas.toDataURL('image/jpeg', 0.82)
}
