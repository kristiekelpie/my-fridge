'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Cropper, { type Area } from 'react-easy-crop'
import { cropImageToDataUrl } from '@/lib/cropImage'
import { Loader2, X } from 'lucide-react'

interface Props {
  imageSrc: string
  onConfirm: (dataUrl: string) => void
  onCancel: () => void
  maxPx?: number
  jpegQuality?: number
}

export default function PhotoCropModal({
  imageSrc,
  onConfirm,
  onCancel,
  maxPx = 500,
  jpegQuality = 0.82,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedArea) return
    setProcessing(true)
    try {
      const dataUrl = await cropImageToDataUrl(imageSrc, croppedArea, maxPx, jpegQuality)
      onConfirm(dataUrl)
    } catch {
      setProcessing(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-stone-900">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="p-2 text-stone-300 active:text-white disabled:opacity-50"
          aria-label="Cancel crop"
        >
          <X size={22} />
        </button>
        <p className="font-mono text-xs uppercase tracking-wider text-stone-300">Crop photo</p>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={processing || !croppedArea}
          className="font-mono text-xs uppercase tracking-wider text-white px-3 py-1.5 rounded-md bg-stone-700 active:bg-stone-600 disabled:opacity-50"
        >
          {processing ? <Loader2 size={16} className="animate-spin" /> : 'Use'}
        </button>
      </div>

      <div className="relative flex-1 min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="shrink-0 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <label className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-2 block">
          Zoom
        </label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="w-full accent-stone-200"
        />
      </div>
    </div>,
    document.body
  )
}
