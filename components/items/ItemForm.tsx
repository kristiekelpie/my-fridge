'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { HouseholdItem, Category, Location, CATEGORY_LABELS, LOCATION_LABELS, CATEGORIES, normalizeCategory } from '@/lib/types'
import { fetchFridgeSuggestions, upsertFridgeSuggestion, type FridgeItemSuggestion } from '@/lib/suggestions'
import SuggestionNameInput from '@/components/items/SuggestionNameInput'
import { Camera, Image as ImageIcon, Loader2, ChevronLeft } from 'lucide-react'

interface Props {
  initialItem?: Partial<HouseholdItem>
  defaultLocation?: Location
  onSave: () => void
  onClose: () => void
}

const LOCATIONS: Location[] = ['freezer', 'shelf1', 'shelf2', 'upper_drawer', 'shelf3', 'lower_drawer', 'door']

export default function ItemForm({ initialItem, defaultLocation, onSave, onClose }: Props) {
  const supabase = createClient()
  const [name, setName] = useState(initialItem?.name ?? '')
  const [category, setCategory] = useState<Category>(
    initialItem?.category ? normalizeCategory(initialItem.category) : 'other'
  )
  const [expiryDate, setExpiryDate] = useState(initialItem?.expiry_date ?? '')
  const [location, setLocation] = useState<Location>(initialItem?.location ?? defaultLocation ?? 'shelf1')
  const [notes, setNotes] = useState(initialItem?.notes ?? '')
  const [photoUrl, setPhotoUrl] = useState(initialItem?.photo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<FridgeItemSuggestion[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const isEdit = !!initialItem?.id

  const loadSuggestions = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const data = await fetchFridgeSuggestions(supabase)
    setSuggestions(data)
  }, [supabase])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured — photos cannot sync to other devices.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('item-photos').getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !expiryDate) return
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured — items cannot sync to other devices.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      name: name.trim(),
      category,
      expiry_date: expiryDate,
      location,
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
        const { error } = await supabase
          .from('household_items')
          .insert(payload)
        if (error) throw error
      }

      await upsertFridgeSuggestion(supabase, payload)
      onSave()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col paper">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-400/40">
        <button
          onClick={onClose}
          className="flex items-center gap-2 -ml-2 py-2 pr-3 rounded-md active:bg-stone-200/80 font-mono text-sm tracking-[0.15em] uppercase text-stone-700"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          Back
        </button>
        <div className="text-right">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">
            {isEdit ? 'Editing' : 'Adding to fridge'}
          </p>
          <h2 className="font-mono text-xl tracking-tight text-stone-900 mt-0.5">
            <span className="editorial-underline font-bold">{isEdit ? 'Edit Item' : 'New Item'}</span>
          </h2>
        </div>
        <div className="w-[72px]" aria-hidden />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
          <div className="flex gap-3 items-center">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="item" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-slate-300" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 active:bg-slate-200 disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                {uploading ? 'Uploading…' : 'Choose photo'}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
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
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <SuggestionNameInput
            value={name}
            onChange={setName}
            suggestions={suggestions}
            onSelectSuggestion={s => {
              setName(s.name)
              setCategory(s.category)
              setLocation(s.location)
              setNotes(s.notes ?? '')
            }}
            getSubLabel={s => `${CATEGORY_LABELS[s.category]} · ${LOCATION_LABELS[s.location]}`}
            placeholder="e.g. Chicken thighs"
            inputClassName="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date *</label>
          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
          <select
            value={location}
            onChange={e => setLocation(e.target.value as Location)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
          >
            {LOCATIONS.map(l => (
              <option key={l} value={l}>{LOCATION_LABELS[l]}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any notes…"
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </form>

      {/* Footer */}
      <div className="p-4 border-t border-stone-400/40">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={saving || uploading || !name.trim() || !expiryDate}
          className="w-full bg-stone-900 text-stone-50 rounded-md py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] disabled:opacity-40 active:bg-stone-700 transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to fridge'}
        </button>
      </div>
    </div>
  )
}
