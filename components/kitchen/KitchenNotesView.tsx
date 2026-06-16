'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MealNote, ShoppingItem, Store } from '@/lib/types'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'

const STORES: Store[] = ['Costco', 'Walmart', 'Albertsons', 'Any']
const STORE_EMOJI: Record<Store, string> = {
  Costco: '🏬',
  Walmart: '🛒',
  Albertsons: '🛍️',
  Any: '📋',
}

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
  const [newShoppingName, setNewShoppingName] = useState('')
  const [newShoppingStore, setNewShoppingStore] = useState<Store>('Any')
  const [savingNote, setSavingNote] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
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
    const { data, error: fetchError } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
      return
    }
    setShopping(data ?? [])
  }, [supabase])

  useEffect(() => {
    fetchNotes()
    fetchShopping()

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
  }, [fetchNotes, fetchShopping, supabase])

  async function addNote() {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return
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

  async function deleteNote(id: string) {
    const { error: deleteError } = await supabase.from('meal_notes').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    else await fetchNotes()
  }

  async function addShoppingItem() {
    if (!newShoppingName.trim()) return
    setAddingItem(true)
    setError(null)
    const { error: insertError } = await supabase.from('shopping_items').insert({
      name: newShoppingName.trim(),
      store: newShoppingStore,
      checked: false,
    })
    if (insertError) {
      setError(insertError.message)
      setAddingItem(false)
      return
    }
    setNewShoppingName('')
    await fetchShopping()
    setAddingItem(false)
  }

  async function toggleShoppingItem(item: ShoppingItem) {
    const { error: updateError } = await supabase
      .from('shopping_items')
      .update({ checked: !item.checked })
      .eq('id', item.id)
    if (updateError) setError(updateError.message)
    else await fetchShopping()
  }

  async function deleteShoppingItem(id: string) {
    const { error: deleteError } = await supabase.from('shopping_items').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    else await fetchShopping()
  }

  const groupedShopping = STORES.reduce((acc, store) => {
    const items = shopping.filter(i => i.store === store)
    if (items.length > 0) acc[store] = items
    return acc
  }, {} as Partial<Record<Store, ShoppingItem[]>>)

  return (
    <div className="flex-1 flex flex-col min-h-0 paper">
      <div className="px-5 pt-5 pb-3 border-b border-stone-400/40 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 -ml-2 mb-3 py-2 pr-3 rounded-md active:bg-stone-200/80 font-mono text-sm tracking-[0.15em] uppercase text-stone-700"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          Back
        </button>
        <h2 className="font-mono text-2xl tracking-tight text-stone-900">
          <span className="editorial-underline font-bold">Notes</span>
        </h2>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500 mt-1">meal plans & shopping</p>
      </div>

      {error && (
        <p className="mx-5 mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex border-b border-stone-300 shrink-0">
        {(['notes', 'shopping'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 font-mono text-[10px] tracking-[0.2em] uppercase border-b-2 transition-colors ${
              tab === t ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
            }`}
          >
            {t === 'notes' ? '📝 Meal Notes' : '🛒 Shopping'}
          </button>
        ))}
      </div>

      {tab === 'notes' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {notes.length === 0 && (
              <p className="font-mono text-[10px] tracking-wider uppercase text-stone-400 text-center py-12">no notes yet</p>
            )}
            {notes.map(note => (
              <div key={note.id} className="bg-orange-50/80 border border-orange-200/60 rounded-xl p-3 relative">
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-2 right-2 p-1.5 text-stone-400 active:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
                <h4 className="font-mono text-sm font-semibold text-stone-800 pr-8">{note.title}</h4>
                <p className="font-mono text-sm text-stone-600 mt-1 whitespace-pre-wrap">{note.content}</p>
                <p className="font-mono text-[9px] text-stone-400 mt-2 tracking-wider">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-stone-300 space-y-2 shrink-0">
            <input
              type="text"
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              placeholder="Title"
              className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <textarea
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              placeholder="Note…"
              rows={3}
              className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
            <button
              onClick={addNote}
              disabled={savingNote || !newNoteTitle.trim() || !newNoteContent.trim()}
              className="w-full bg-stone-900 text-stone-50 rounded-xl py-3 text-sm font-mono tracking-wider uppercase disabled:opacity-50"
            >
              Add Note
            </button>
          </div>
        </div>
      )}

      {tab === 'shopping' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {shopping.length === 0 && (
              <p className="font-mono text-[10px] tracking-wider uppercase text-stone-400 text-center py-12">list is empty</p>
            )}
            {STORES.map(store => {
              const items = groupedShopping[store]
              if (!items) return null
              return (
                <div key={store}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span>{STORE_EMOJI[store]}</span>
                    <span className="font-mono text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{store}</span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-3 py-2.5">
                        <button
                          onClick={() => toggleShoppingItem(item)}
                          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            item.checked ? 'bg-green-600 border-green-600' : 'border-stone-300'
                          }`}
                        >
                          {item.checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                          {item.name}
                        </span>
                        <button onClick={() => deleteShoppingItem(item.id)} className="p-1 text-stone-300 active:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-4 border-t border-stone-300 space-y-2 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={newShoppingName}
                onChange={e => setNewShoppingName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addShoppingItem()}
                placeholder="Add item…"
                className="flex-1 border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                onClick={addShoppingItem}
                disabled={addingItem || !newShoppingName.trim()}
                className="p-2.5 bg-stone-900 text-white rounded-xl disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>
            <select
              value={newShoppingStore}
              onChange={e => setNewShoppingStore(e.target.value as Store)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white"
            >
              {STORES.map(s => <option key={s} value={s}>{STORE_EMOJI[s]} {s}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
