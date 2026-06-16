'use client'

import { useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'

export type PolaroidSlot = 'upper' | 'lower'

interface Props {
  slot: PolaroidSlot
  photoUrl: string | null
  onUpload: (slot: PolaroidSlot, file: File) => Promise<void>
  className?: string
  style?: React.CSSProperties
}

export default function DoorPolaroid({ slot, photoUrl, onUpload, className = '', style }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      await onUpload(slot, file)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          fileRef.current?.click()
        }}
        className={`absolute z-20 shadow-md active:scale-[0.98] transition-transform ${className}`}
        style={style}
        aria-label={`${slot} polaroid — tap to change photo`}
      >
        <div className="bg-white p-1 pb-3 shadow-[2px_4px_12px_rgba(0,0,0,0.18)]">
          <div className="relative w-[4.5rem] h-[4.25rem] sm:w-[5rem] sm:h-[4.75rem] bg-stone-100 overflow-hidden">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
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
      </button>
    </>
  )
}
