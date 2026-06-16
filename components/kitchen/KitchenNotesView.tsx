'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { MealNote, ShoppingItem, Store, ShoppingCategory, SHOPPING_CATEGORY_LABELS } from '@/lib/types'
import { toggleShoppingItemChecked } from '@/lib/shoppingActions'
import { fetchShoppingSuggestions, upsertShoppingSuggestion, type ShoppingSuggestion } from '@/lib/suggestions'
import SuggestionNameInput from '@/components/items/SuggestionNameInput'
import { ChevronLeft, Trash2, Pencil } from 'lucide-react'

const STORES: Store[] = ['Costco', 'Walmart', 'Albertsons', 'Any', 'Other']
const CATEGORIES: ShoppingCategory[] = ['food', 'household', 'personal']

interface Props {
  onBack: () => void
}

type Tab = 'notes' | 'shopping'

export default function KitchenNotesView({ onBack }: Props) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('notes')
  const [notes, setNotes] = useState<MealNote[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteTitle, setEditNoteTitle] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')
  const [newShoppingName, setNewShoppingName] = useState('')
  const [newShoppingStore, setNewShoppingStore] = useState<Store>('Any')
  const [newShoppingCategory, setNewShoppingCategory] = useState<ShoppingCategory>('food')
  const [savingNote, setSavingNote] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shoppingSuggestions, setShoppingSuggestions] = useState<ShoppingSuggestion[]>([])

  const fetchNotes = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const { data, error: fetchError } = await supabase
      .from('meal_notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
      return
    }
    setNotes(data ?? [])
  }, [supabase])

  const fetchShopping = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const { data, error: fetchError } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
      return
    }
    setShopping((data ?? []).map(row => ({ ...row, category: row.category ?? 'food' })))
  }, [supabase])

  const fetchShoppingSuggestionsList = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const data = await fetchShoppingSuggestions(supabase)
    setShoppingSuggestions(data)
  }, [supabase])

  useEffect(() => {
    fetchNotes()
    fetchShopping()
    fetchShoppingSuggestionsList()

    if (!isSupabaseConfigured()) return

    const notesSub = supabase
      .channel('kitchen-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_notes' }, fetchNotes)
      .subscribe()

    const shoppingSub = supabase
      .channel('kitchen-shopping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, fetchShopping)
      .subscribe()

    return () => {
      supabase.removeChannel(notesSub)
      supabase.removeChannel(shoppingSub)
    }
  }, [fetchNotes, fetchShopping, fetchShoppingSuggestionsList, supabase])

  async function addNote() {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured.')
      return
    }
    setSavingNote(true)
    setError(null)
    const { error: insertError } = await supabase.from('meal_notes').insert({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
    })
    if (insertError) {
      setError(insertError.message)
      setSavingNote(false)
      return
    }
    setNewNoteTitle('')
    setNewNoteContent('')
    await fetchNotes()
    setSavingNote(false)
  }

  function startEditNote(note: MealNote) {
    setEditingNoteId(note.id)
    setEditNoteTitle(note.title)
    setEditNoteContent(note.content)
  }

  async function saveEditNote() {
    if (!editingNoteId || !editNoteTitle.trim() || !editNoteContent.trim()) return
    setSavingNote(true)
    setError(null)
    const { error: updateError } = await supabase
      .from('meal_notes')
      .update({ title: editNoteTitle.trim(), content: editNoteContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingNoteId)
    if (updateError) {
      setError(updateError.message)
      setSavingNote(false)
      return
    }
    setEditingNoteId(null)
    await fetchNotes()
    setSavingNote(false)
  }

  async function deleteNote(id: string) {
    const previous = notes
    setNotes(n => n.filter(x => x.id !== id))
    const { error: deleteError } = await supabase.from('meal_notes').delete().eq('id', id)
    if (deleteError) {
      setNotes(previous)
      setError(deleteError.message)
    }
  }

  async function addShoppingItem() {
    if (!newShoppingName.trim()) return
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured.')
      return
    }
    setAddingItem(true)
    setError(null)
    const { error: insertError } = await supabase.from('shopping_items').insert({
      name: newShoppingName.trim(),
      store: newShoppingStore,
      category: newShoppingCategory,
      checked: false,
    })
    if (insertError) {
      setError(insertError.message)
      setAddingItem(false)
      return
    }
    await upsertShoppingSuggestion(supabase, {
      name: newShoppingName.trim(),
      store: newShoppingStore,
      category: newShoppingCategory,
    })
    setNewShoppingName('')
    await fetchShopping()
    await fetchShoppingSuggestionsList()
    setAddingItem(false)
  }

  async function toggleShoppingItem(item: ShoppingItem) {
    const { error: toggleError } = await toggleShoppingItemChecked(supabase, item)
    if (toggleError) setError(toggleError)
    else await fetchShopping()
  }

  async function deleteShoppingItem(id: string) {
    const previous = shopping
    setShopping(s => s.filter(x => x.id !== id))
    const { error: deleteError } = await supabase.from('shopping_items').delete().eq('id', id)
    if (deleteError) {
      setShopping(previous)
      setError(deleteError.message)
    }
  }

  const groupedShopping = STORES.reduce((acc, store) => {
    const items = shopping.filter(i => i.store === store)
    if (items.length > 0) acc[store] = items
    return acc
  }, {} as Partial<Record<Store, ShoppingItem[]>>)

  return (
    <div className="flex-1 flex flex-col min-h-0 paper">
      <div className="px-5 pt-5 pb-2 border-b border-stone-400/40 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 -ml-2 py-2 pr-3 rounded-md active:bg-stone-200/80 font-mono text-sm tracking-[0.15em] uppercase text-stone-700"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          Back
        </button>
      </div>

      {error && (
        <p className="mx-5 mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex border-b border-slate-200 shrink-0">
        {(['notes', 'shopping'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-3 font-mono text-base font-bold tracking-tight border-b-2 transition-colors ${
              tab === t ? 'border-stone-900 text-stone-900' : 'border-transparent text-slate-500'
            }`}
          >
            <span className={tab === t ? 'editorial-underline' : ''}>
              {t === 'notes' ? 'Meal Notes' : 'Shopping List'}
            </span>
          </button>
        ))}
      </div>

      {tab === 'notes' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notes.length === 0 && (
              <p className="font-mono text-sm text-slate-400 text-center py-8 tracking-tight">No meal notes yet</p>
            )}
            {notes.map(note => (
              <div key={note.id} className="bg-stone-50 border border-stone-900/90 shadow-sm rounded-xl p-3 relative">
                {editingNoteId === note.id ? (
                  <div className="space-y-2 pr-1">
                    <input
                      type="text"
                      value={editNoteTitle}
                      onChange={e => setEditNoteTitle(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editNoteContent}
                      onChange={e => setEditNoteContent(e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={saveEditNote} className="flex-1 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingNoteId(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button type="button" onClick={() => startEditNote(note)} className="p-1 text-slate-400 active:text-slate-700">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => deleteNote(note.id)} className="p-1 text-slate-400 active:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 pr-6">{note.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 shrink-0">
            <div className="w-full space-y-2">
              <input
                type="text"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                placeholder="Title"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                placeholder="Note…"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                type="button"
                onClick={addNote}
                disabled={savingNote || !newNoteTitle.trim() || !newNoteContent.trim()}
                className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'shopping' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {shopping.length === 0 && (
              <p className="font-mono text-sm text-slate-400 text-center py-8 tracking-tight">Shopping list is empty</p>
            )}
            {STORES.map(store => {
              const items = groupedShopping[store]
              if (!items) return null
              return (
                <div key={store}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{store}</span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-stone-50 border border-stone-900/90 shadow-sm rounded-xl px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleShoppingItem(item)}
                          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                            item.checked ? 'bg-green-500 border-green-500' : 'border-slate-300'
                          }`}
                        >
                          {item.checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.name}
                        </span>
                        <span className="font-mono text-[9px] uppercase text-slate-400 shrink-0">
                          {SHOPPING_CATEGORY_LABELS[item.category ?? 'food']}
                        </span>
                        <button type="button" onClick={() => deleteShoppingItem(item.id)} className="p-1 text-slate-300 active:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-4 border-t border-slate-200 shrink-0">
            <div className="w-full space-y-2">
              <SuggestionNameInput
                value={newShoppingName}
                onChange={setNewShoppingName}
                suggestions={shoppingSuggestions}
                onSelectSuggestion={s => {
                  setNewShoppingName(s.name)
                  if (s.store) setNewShoppingStore(s.store)
                  setNewShoppingCategory(s.category)
                }}
                getSubLabel={s => `${s.store ?? 'Any'} · ${SHOPPING_CATEGORY_LABELS[s.category]}`}
                placeholder="Add item…"
                inputClassName="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => e.key === 'Enter' && addShoppingItem()}
              />
              <select
                value={newShoppingStore}
                onChange={e => setNewShoppingStore(e.target.value as Store)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none"
              >
                {STORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={newShoppingCategory}
                onChange={e => setNewShoppingCategory(e.target.value as ShoppingCategory)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{SHOPPING_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addShoppingItem}
                disabled={addingItem || !newShoppingName.trim()}
                className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
