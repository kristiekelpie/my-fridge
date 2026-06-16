'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MealNote, ShoppingItem, Store, ShoppingCategory, SHOPPING_CATEGORY_LABELS } from '@/lib/types'
import { toggleShoppingItemChecked } from '@/lib/shoppingActions'
import { fetchShoppingSuggestions, upsertShoppingSuggestion, type ShoppingSuggestion } from '@/lib/suggestions'
import SuggestionNameInput from '@/components/items/SuggestionNameInput'
import { X, Plus, Trash2, ChevronRight } from 'lucide-react'

const STORES: Store[] = ['Costco', 'Walmart', 'Albertsons', 'Any', 'Other']
const CATEGORIES: ShoppingCategory[] = ['food', 'household', 'personal']

interface Props {
  open: boolean
  onClose: () => void
}

type Panel = 'main' | 'notes' | 'shopping'

export default function Sidebar({ open, onClose }: Props) {
  const supabase = createClient()
  const [panel, setPanel] = useState<Panel>('main')
  const [notes, setNotes] = useState<MealNote[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newShoppingName, setNewShoppingName] = useState('')
  const [newShoppingStore, setNewShoppingStore] = useState<Store>('Any')
  const [newShoppingCategory, setNewShoppingCategory] = useState<ShoppingCategory>('food')
  const [savingNote, setSavingNote] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [shoppingSuggestions, setShoppingSuggestions] = useState<ShoppingSuggestion[]>([])

  const fetchNotes = useCallback(async () => {
    const { data } = await supabase
      .from('meal_notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setNotes(data)
  }, [supabase])

  const fetchShopping = useCallback(async () => {
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setShopping(data.map(row => ({ ...row, category: row.category ?? 'food' })))
  }, [supabase])

  const fetchShoppingSuggestionsList = useCallback(async () => {
    const data = await fetchShoppingSuggestions(supabase)
    setShoppingSuggestions(data)
  }, [supabase])

  useEffect(() => {
    if (!open) return
    fetchNotes()
    fetchShopping()
    fetchShoppingSuggestionsList()

    const notesSub = supabase
      .channel('sidebar-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_notes' }, fetchNotes)
      .subscribe()

    const shoppingSub = supabase
      .channel('sidebar-shopping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, fetchShopping)
      .subscribe()

    return () => {
      supabase.removeChannel(notesSub)
      supabase.removeChannel(shoppingSub)
    }
  }, [open, fetchNotes, fetchShopping, fetchShoppingSuggestionsList, supabase])

  async function addNote() {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return
    setSavingNote(true)
    const { error } = await supabase.from('meal_notes').insert({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
    })
    setSavingNote(false)
    if (error) return
    setNewNoteTitle('')
    setNewNoteContent('')
    await fetchNotes()
  }

  async function deleteNote(id: string) {
    const previous = notes
    setNotes(n => n.filter(x => x.id !== id))
    const { error } = await supabase.from('meal_notes').delete().eq('id', id)
    if (error) setNotes(previous)
  }

  async function addShoppingItem() {
    if (!newShoppingName.trim()) return
    setAddingItem(true)
    await supabase.from('shopping_items').insert({
      name: newShoppingName.trim(),
      store: newShoppingStore,
      category: newShoppingCategory,
      checked: false,
    })
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
    await toggleShoppingItemChecked(supabase, item)
    await fetchShopping()
  }

  async function deleteShoppingItem(id: string) {
    const previous = shopping
    setShopping(s => s.filter(x => x.id !== id))
    const { error } = await supabase.from('shopping_items').delete().eq('id', id)
    if (error) setShopping(previous)
  }

  const groupedShopping = STORES.reduce((acc, store) => {
    const items = shopping.filter(i => i.store === store)
    if (items.length > 0) acc[store] = items
    return acc
  }, {} as Partial<Record<Store, ShoppingItem[]>>)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-300 bg-[#E8E4D7]">
          {panel !== 'main' && (
            <button
              onClick={() => setPanel('main')}
              className="flex items-center gap-1.5 p-2 -ml-2 mr-1 rounded-md active:bg-stone-200/80"
            >
              <ChevronRight size={24} className="text-stone-700 rotate-180" strokeWidth={2.5} />
              <span className="font-mono text-sm tracking-[0.15em] uppercase text-stone-700">Back</span>
            </button>
          )}
          <div className="flex-1 pl-1">
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-stone-500">Our Log</p>
            <h2 className="font-mono text-base font-bold tracking-tight text-stone-900 mt-0.5">
              <span className="editorial-underline">
                {panel === 'main' ? 'Menu' : panel === 'notes' ? 'Meal Notes' : 'Shopping List'}
              </span>
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md active:bg-stone-200 border border-stone-300">
            <X size={18} className="text-stone-700" />
          </button>
        </div>

        {/* Main panel */}
        {panel === 'main' && (
          <div className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setPanel('notes')}
              className="w-full flex items-center justify-between px-4 py-4 bg-orange-50 rounded-2xl active:bg-orange-100 text-left"
            >
              <div>
                <div className="text-sm font-semibold text-slate-800">📝 Meal Notes</div>
                <div className="text-xs text-slate-500 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            <button
              onClick={() => setPanel('shopping')}
              className="w-full flex items-center justify-between px-4 py-4 bg-green-50 rounded-2xl active:bg-green-100 text-left"
            >
              <div>
                <div className="text-sm font-semibold text-slate-800">🛒 Shopping List</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {shopping.filter(i => !i.checked).length} remaining
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        )}

        {/* Notes panel */}
        {panel === 'notes' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">No meal notes yet</p>
              )}
              {notes.map(note => (
                <div key={note.id} className="bg-orange-50 rounded-2xl p-3 relative">
                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-2 right-2 p-1 text-slate-400 active:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                  <h4 className="text-sm font-semibold text-slate-800 pr-6">{note.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 shrink-0 flex justify-center">
              <div className="w-full max-w-xs space-y-2">
              <input
                type="text"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                placeholder="Title"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                placeholder="Note…"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={addNote}
                disabled={savingNote || !newNoteTitle.trim() || !newNoteContent.trim()}
                className="w-full bg-orange-500 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Add Note
              </button>
              </div>
            </div>
          </div>
        )}

        {/* Shopping panel */}
        {panel === 'shopping' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {shopping.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">Shopping list is empty</p>
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
                        <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                          <button
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
                          <button
                            type="button"
                            onClick={() => deleteShoppingItem(item.id)}
                            className="p-1 text-slate-300 active:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-4 border-t border-slate-200 shrink-0 flex justify-center">
              <div className="w-full max-w-xs space-y-2">
              <div className="flex gap-2 items-start">
                <div className="flex-1 min-w-0">
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
                    inputClassName="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={e => e.key === 'Enter' && addShoppingItem()}
                  />
                </div>
                <button
                  onClick={addShoppingItem}
                  disabled={addingItem || !newShoppingName.trim()}
                  className="p-2 bg-green-500 text-white rounded-xl disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>
              <select
                value={newShoppingStore}
                onChange={e => setNewShoppingStore(e.target.value as Store)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
              >
                {STORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={newShoppingCategory}
                onChange={e => setNewShoppingCategory(e.target.value as ShoppingCategory)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{SHOPPING_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
