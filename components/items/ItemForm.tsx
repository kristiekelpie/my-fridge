'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  HouseholdItem,
  Category,
  StorageArea,
  CATEGORY_LABELS,
  CATEGORIES,
  normalizeCategory,
  getCookedFoodDefaultExpiryDate,
  getFreezerDefaultExpiryDate,
} from '@/lib/types'
import {
  ITEM_STORAGE_PLACES,
  ITEM_STORAGE_PLACE_LABELS,
  ItemStoragePlace,
  storagePlaceToFields,
  itemToStoragePlace,
  defaultStoragePlaceForArea,
  storagePlaceFromLocation,
} from '@/lib/storageAreas'
import { fetchFridgeSuggestions, upsertFridgeSuggestion, type FridgeItemSuggestion } from '@/lib/suggestions'
import SuggestionNameInput from '@/components/items/SuggestionNameInput'
import PhotoUploadField from '@/components/items/PhotoUploadField'
import { PORTRAIT_ITEM_ASPECT, usesPortraitItemLayout } from '@/lib/itemDisplay'
import { DESKTOP_PAGE_COLUMN_CLASS } from '@/components/layout/ConstrainedPageShell'
import { ChevronLeft } from 'lucide-react'

interface Props {
  initialItem?: Partial<HouseholdItem>
  storageArea: StorageArea
  onSave: () => void
  onClose: () => void
}

const FORM_FIELD =
  'w-full max-w-full min-w-0 box-border border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'

const FORM_CONTROL = `${FORM_FIELD} h-10`

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return 'Save failed'
}

function initialStoragePlace(
  initialItem: Partial<HouseholdItem> | undefined,
  storageArea: StorageArea
): ItemStoragePlace {
  if (initialItem?.storage_area && initialItem?.location) {
    return itemToStoragePlace({
      storage_area: initialItem.storage_area,
      location: initialItem.location,
    })
  }
  return defaultStoragePlaceForArea(storageArea)
}

export default function ItemForm({ initialItem, storageArea, onSave, onClose }: Props) {
  const supabase = createClient()
  const [name, setName] = useState(initialItem?.name ?? '')
  const [category, setCategory] = useState<Category>(
    initialItem?.category ? normalizeCategory(initialItem.category) : 'other'
  )
  const [expiryDate, setExpiryDate] = useState(initialItem?.expiry_date ?? '')
  const [storagePlace, setStoragePlace] = useState<ItemStoragePlace>(() =>
    initialStoragePlace(initialItem, storageArea)
  )
  const [notes, setNotes] = useState(initialItem?.notes ?? '')
  const [photoUrl, setPhotoUrl] = useState(initialItem?.photo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<FridgeItemSuggestion[]>([])
  const expiryEditedRef = useRef(!!initialItem?.expiry_date)

  const isEdit = !!initialItem?.id
  const { location } = storagePlaceToFields(storagePlace)
  const portraitPhoto = usesPortraitItemLayout(category, storagePlace)

  useEffect(() => {
    if (isEdit || expiryEditedRef.current) return
    if (storagePlace === 'freezer') {
      setExpiryDate(getFreezerDefaultExpiryDate())
      return
    }
    if (category === 'cooked_food') {
      setExpiryDate(getCookedFoodDefaultExpiryDate(location))
    }
  }, [category, location, storagePlace, isEdit])

  const loadSuggestions = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const data = await fetchFridgeSuggestions(supabase)
    setSuggestions(data)
  }, [supabase])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !expiryDate) return
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured — items cannot sync to other devices.')
      return
    }
    setSaving(true)
    setError(null)

    const { storage_area, location: itemLocation } = storagePlaceToFields(storagePlace)

    const payload = {
      name: name.trim(),
      category,
      expiry_date: expiryDate,
      storage_area,
      location: itemLocation,
      notes: notes.trim() || null,
      photo_url: photoUrl || null,
    }

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('household_items')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', initialItem!.id!)
        if (error) throw error
      } else {
        const { error } = await supabase.from('household_items').insert(payload)
        if (error) throw error
      }

      await upsertFridgeSuggestion(supabase, payload).catch(() => {
        // Item saved — suggestion history is optional
      })
      onSave()
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      if (message.includes('storage_area')) {
        setError(
          'Save failed: database is missing the storage_area column. Run supabase-storage-areas.sql in Supabase → SQL Editor.'
        )
      } else {
        setError(message)
      }
      setSaving(false)
    }
  }

  const addLabel = ITEM_STORAGE_PLACE_LABELS[storagePlace].toLowerCase()

  return (
    <div className="fixed inset-0 z-50 flex flex-col paper sm:items-center sm:px-4 sm:bg-stone-400/10">
      <div
        className={`${DESKTOP_PAGE_COLUMN_CLASS} sm:max-h-[calc(100dvh-2rem)] sm:my-4 sm:rounded-2xl sm:border sm:border-stone-300/50 sm:shadow-lg sm:overflow-hidden`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-400/40 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 -ml-2 py-2 pr-3 rounded-md active:bg-stone-200/80 font-mono text-sm tracking-[0.15em] uppercase text-stone-700"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
            Back
          </button>
          <div className="text-right">
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">
              {isEdit ? 'Editing' : `Adding to ${addLabel}`}
            </p>
            <h2 className="font-mono text-xl tracking-tight text-stone-900 mt-0.5">
              <span className="editorial-underline font-bold">{isEdit ? 'Edit Item' : 'New Item'}</span>
            </h2>
          </div>
          <div className="w-[72px]" aria-hidden />
        </div>

        <form
          id="item-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0"
        >
          <PhotoUploadField
            photoUrl={photoUrl}
            onPhotoUrlChange={setPhotoUrl}
            onError={setError}
            onUploadingChange={setUploading}
            cropAspect={portraitPhoto ? PORTRAIT_ITEM_ASPECT : 1}
          />

          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <SuggestionNameInput
              value={name}
              onChange={setName}
              suggestions={suggestions}
              onSelectSuggestion={s => {
                setName(s.name)
                setCategory(s.category)
                setStoragePlace(storagePlaceFromLocation(s.location))
                setNotes(s.notes ?? '')
                if (s.photo_url) setPhotoUrl(s.photo_url)
              }}
              getSubLabel={s =>
                `${CATEGORY_LABELS[s.category]} · ${ITEM_STORAGE_PLACE_LABELS[storagePlaceFromLocation(s.location)]}`
              }
              placeholder="e.g. Chicken thighs"
              inputClassName={FORM_CONTROL}
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Storage *</label>
            <select
              value={storagePlace}
              onChange={e => setStoragePlace(e.target.value as ItemStoragePlace)}
              className={FORM_CONTROL}
            >
              {ITEM_STORAGE_PLACES.map(place => (
                <option key={place} value={place}>
                  {ITEM_STORAGE_PLACE_LABELS[place]}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className={FORM_CONTROL}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date *</label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => {
                expiryEditedRef.current = true
                setExpiryDate(e.target.value)
              }}
              required
              className={FORM_CONTROL}
            />
            {category === 'cooked_food' && !isEdit && storagePlace !== 'freezer' && (
              <p className="font-mono text-[10px] text-stone-500 mt-1">
                Default 4-day shelf life — adjust if needed
              </p>
            )}
            {storagePlace === 'freezer' && !isEdit && (
              <p className="font-mono text-[10px] text-stone-500 mt-1">
                Default 6-month freezer shelf life — adjust if needed
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes…"
              rows={3}
              className={`${FORM_FIELD} resize-none`}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </form>

        <div className="p-4 border-t border-slate-200 shrink-0">
          <button
            type="submit"
            form="item-form"
            disabled={saving || uploading || !name.trim() || !expiryDate}
            className="w-full appearance-none border-0 bg-stone-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 active:bg-stone-800 transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : `Add to ${addLabel}`}
          </button>
        </div>
      </div>
    </div>
  )
}
