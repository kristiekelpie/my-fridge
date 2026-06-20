'use client'

import { useRef, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadPhotoDataUrl } from '@/lib/uploadPhoto'
import PhotoCropModal from '@/components/items/PhotoCropModal'
import { useItemPhotoDisplay } from '@/components/items/useItemPhotoDisplay'
import { useMealNotePhotoDisplay } from '@/components/kitchen/useMealNotePhotoDisplay'
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react'

interface Props {
  photoUrl: string
  onPhotoUrlChange: (url: string) => void
  onError?: (message: string | null) => void
  onUploadingChange?: (uploading: boolean) => void
  storageFolder?: 'items' | 'meal-notes'
  label?: string
  cropMaxPx?: number
  /** Crop frame width:height. Defaults to 1 (square). */
  cropAspect?: number
}

export default function PhotoUploadField({
  photoUrl,
  onPhotoUrlChange,
  onError,
  onUploadingChange,
  storageFolder = 'items',
  label = 'Photo',
  cropMaxPx,
  cropAspect = 1,
}: Props) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const resolvedCropMaxPx = cropMaxPx ?? (storageFolder === 'meal-notes' ? 1080 : 500)
  const itemDisplaySrc = useItemPhotoDisplay(photoUrl || null)
  const mealNoteDisplaySrc = useMealNotePhotoDisplay(photoUrl || null)
  const displaySrc = storageFolder === 'meal-notes' ? mealNoteDisplaySrc : itemDisplaySrc

  function setUploadingState(next: boolean) {
    setUploading(next)
    onUploadingChange?.(next)
  }

  async function handleUpload(dataUrl: string) {
    onPhotoUrlChange(dataUrl)
    onError?.(null)

    if (!isSupabaseConfigured()) {
      onError?.('Supabase is not configured — photos cannot sync to other devices.')
      return
    }

    setUploadingState(true)
    try {
      const publicUrl = await uploadPhotoDataUrl(supabase, dataUrl, storageFolder)
      onPhotoUrlChange(publicUrl)
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingState(false)
    }
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onError?.(null)
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
    await handleUpload(dataUrl)
  }

  return (
    <>
      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          maxPx={resolvedCropMaxPx}
          jpegQuality={storageFolder === 'meal-notes' ? 0.88 : 0.82}
          aspect={cropAspect}
        />
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <div className="flex gap-3 items-center">
          <div
            className={`relative rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0 ${
              cropAspect !== 1 ? 'w-16 aspect-[2/3]' : 'w-20 h-20'
            }`}
          >
            {displaySrc ? (
              <img src={displaySrc} alt="" className="w-full h-full object-cover" loading="eager" />
            ) : (
              <ImageIcon size={24} className="text-slate-300" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 size={18} className="animate-spin text-stone-600" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 active:bg-slate-200 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            {photoUrl && (
              <button
                type="button"
                onClick={() => onPhotoUrlChange('')}
                className="text-xs text-red-500 text-left"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </div>
    </>
  )
}
