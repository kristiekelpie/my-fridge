'use client'

import { useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import HeartMagnet from './HeartMagnet'
import PhotoCropModal from '@/components/items/PhotoCropModal'
import { useDoorPhotoDisplay } from '@/components/fridge/useDoorPhotoDisplay'

export type PolaroidSlot = 'upper' | 'lower' | 'left' | 'right'

interface Props {
  slot: PolaroidSlot
  photoUrl: string | null
  onUpload: (slot: PolaroidSlot, dataUrl: string) => Promise<void>
  magnetCorner?: 'top-left' | 'top-right' | 'top-quarter' | 'top-center'
  magnetStyle?: React.CSSProperties
  size?: 'sm' | 'md'
  className?: string
  style?: React.CSSProperties
}

export default function DoorPolaroid({
  slot,
  photoUrl,
  onUpload,
  magnetCorner = 'top-right',
  magnetStyle,
  size = 'md',
  className = '',
  style,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const displaySrc = useDoorPhotoDisplay(photoUrl)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setCropSrc(URL.createObjectURL(file))
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  async function handleCropConfirm(dataUrl: string) {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setUploading(true)
    setUploadError(null)
    try {
      await onUpload(slot, dataUrl)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const magnetClass =
    magnetCorner === 'top-left'
      ? 'absolute -top-1.5 -left-1.5 z-30 pointer-events-none'
      : magnetCorner === 'top-quarter'
        ? 'absolute -top-1.5 left-1/4 -translate-x-1/2 z-30 pointer-events-none'
        : magnetCorner === 'top-center'
          ? 'absolute -top-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none'
          : 'absolute -top-1.5 -right-1.5 z-30 pointer-events-none'

  const frameClass =
    size === 'sm'
      ? 'relative w-[3.65rem] h-[3.45rem] sm:w-[4.1rem] sm:h-[3.85rem] bg-stone-100 overflow-hidden'
      : 'relative w-[4.5rem] h-[4.25rem] sm:w-[5rem] sm:h-[4.75rem] bg-stone-100 overflow-hidden'

  return (
    <>
      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          maxPx={480}
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          fileRef.current?.click()
        }}
        className={`absolute active:scale-[0.98] transition-transform z-20 ${className}`}
        style={style}
        aria-label={`${slot} polaroid — tap to change photo`}
      >
        <div className="relative">
          <div
            className={magnetClass}
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))', ...magnetStyle }}
          >
            <HeartMagnet size={14} />
          </div>
          <div className="bg-white p-1 pb-3 shadow-[2px_4px_12px_rgba(0,0,0,0.18)]">
            <div className={frameClass}>
              {displaySrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displaySrc}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200/80">
                  <span className="font-mono text-[7px] text-stone-400 uppercase tracking-wider">photo</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-stone-600" />
                </div>
              )}
              {uploadError && (
                <div className="absolute inset-x-0 -bottom-6 text-[7px] text-red-600 font-mono text-center leading-tight">
                  failed
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </>
  )
}
