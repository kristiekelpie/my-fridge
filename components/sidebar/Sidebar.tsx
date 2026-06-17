'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MealNote, ShoppingItem, Store, ShoppingCategory, SHOPPING_CATEGORY_LABELS } from '@/lib/types'
import { toggleShoppingItemChecked } from '@/lib/shoppingActions'
import { fetchShoppingSuggestions, fetchFridgeSuggestions, upsertShoppingSuggestion, type ShoppingSuggestion } from '@/lib/suggestions'
import SuggestionNameInput from '@/components/items/SuggestionNameInput'
import PhotoUploadField from '@/components/items/PhotoUploadField'
import MealNotePhoto from '@/components/kitchen/MealNotePhoto'
import { X, Trash2, ChevronRight, Plus, Pencil } from 'lucide-react'

const STORES: Store[] = ['Costco', 'Walmart', 'Albertsons', 'Any', 'Other']
const CATEGORIES: ShoppingCategory[] = ['food', 'household', 'personal']

interface Props {
  open: boolean
  onClose: () => void
  itemCount: number
  expiringCount: number
  onOpenInventory: () => void
  onOpenExpiring: () => void
  onOpenHistory: () => void
  onOpenWeeklyPlanner: () => void
}

type Panel = 'main' | 'notes' | 'shopping'

function SidebarMenuButton({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: string
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 bg-stone-50 border border-stone-900/90 shadow-sm rounded-xl active:bg-stone-100 text-left"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" className="w-9 h-9 shrink-0 object-contain" />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm font-semibold text-slate-800">{title}</div>
        <div className="font-mono text-xs text-slate-500 mt-0.5">{subtitle}</div>
      </div>
      <ChevronRight size={18} className="text-slate-400 shrink-0" />
    </button>
  )
}

export default function Sidebar({
  open,
  onClose,
  itemCount,
  expiringCount,
  onOpenInventory,
  onOpenExpiring,
  onOpenHistory,
  onOpenWeeklyPlanner,
}: Props) {
  const supabase = createClient()
  const [panel, setPanel] = useState<Panel>('main')
  const [notes, setNotes] = useState<MealNote[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [historyCount, setHistoryCount] = useState(0)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNotePhotoUrl, setNewNotePhotoUrl] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteTitle, setEditNoteTitle] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')
  const [editNotePhotoUrl, setEditNotePhotoUrl] = useState('')
  const [uploadingNotePhoto, setUploadingNotePhoto] = useState(false)
  const [showAddNoteForm, setShowAddNoteForm] = useState(false)
  const [showAddShoppingForm, setShowAddShoppingForm] = useState(false)
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

  const fetchHistoryCount = useCallback(async () => {
    const data = await fetchFridgeSuggestions(supabase)
    setHistoryCount(data.length)
  }, [supabase])

  useEffect(() => {
    if (!open) return
    fetchNotes()
    fetchShopping()
    fetchShoppingSuggestionsList()
    fetchHistoryCount()

    const notesSub = supabase
      .channel('sidebar-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_notes' }, fetchNotes)
      .subscribe()

    const shoppingSub = supabase
      .channel('sidebar-shopping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, fetchShopping)
      .subscribe()

    const historySub = supabase
      .channel('sidebar-history-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fridge_item_suggestions' }, fetchHistoryCount)
      .subscribe()

    return () => {
      supabase.removeChannel(notesSub)
      supabase.removeChannel(shoppingSub)
      supabase.removeChannel(historySub)
    }
  }, [open, fetchNotes, fetchShopping, fetchShoppingSuggestionsList, fetchHistoryCount, supabase])

  useEffect(() => {
    if (!open || panel !== 'notes') {
      setShowAddNoteForm(false)
      setEditingNoteId(null)
    }
    if (!open || panel !== 'shopping') setShowAddShoppingForm(false)
  }, [open, panel])

  function resetNoteForm() {
    setNewNoteTitle('')
    setNewNoteContent('')
    setNewNotePhotoUrl('')
  }

  function closeAddNoteForm() {
    setShowAddNoteForm(false)
    resetNoteForm()
  }

  function startEditNote(note: MealNote) {
    setShowAddNoteForm(false)
    setEditingNoteId(note.id)
    setEditNoteTitle(note.title)
    setEditNoteContent(note.content)
    setEditNotePhotoUrl(note.photo_url ?? '')
  }

  function cancelEditNote() {
    setEditingNoteId(null)
    setEditNotePhotoUrl('')
  }

  async function saveEditNote() {
    if (!editingNoteId || !editNoteTitle.trim() || !editNoteContent.trim()) return
    setSavingNote(true)
    const { error } = await supabase
      .from('meal_notes')
      .update({
        title: editNoteTitle.trim(),
        content: editNoteContent.trim(),
        photo_url: editNotePhotoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingNoteId)
    setSavingNote(false)
    if (error) return
    setEditingNoteId(null)
    setEditNotePhotoUrl('')
    await fetchNotes()
  }

  function resetShoppingForm() {
    setNewShoppingName('')
    setNewShoppingStore('Any')
    setNewShoppingCategory('food')
  }

  function closeAddShoppingForm() {
    setShowAddShoppingForm(false)
    resetShoppingForm()
  }

  async function addNote() {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return
    setSavingNote(true)
    const { error } = await supabase.from('meal_notes').insert({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      photo_url: newNotePhotoUrl || null,
    })
    setSavingNote(false)
    if (error) return
    closeAddNoteForm()
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
    closeAddShoppingForm()
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

  const panelTitle =
    panel === 'main' ? 'Kitchen Log'
    : panel === 'notes' ? 'Meal Notes'
    : 'Shopping List'

  function openHistory() {
    onOpenHistory()
  }

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
            <h2 className="font-mono text-base font-bold tracking-tight text-stone-900">
              <span className="editorial-underline">{panelTitle}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-stone-900 active:bg-stone-800 border border-stone-900"
            aria-label="Close menu"
          >
            <X size={18} className="text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Main panel */}
        {panel === 'main' && (
          <div className="flex-1 p-4 space-y-2">
            <SidebarMenuButton
              icon="/icons/sidebar-expiring.png"
              title="Expiring Soon"
              subtitle={`${expiringCount} item${expiringCount !== 1 ? 's' : ''}`}
              onClick={onOpenExpiring}
            />
            <SidebarMenuButton
              icon="/icons/sidebar-inventory.png"
              title="Master Inventory"
              subtitle={`${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              onClick={onOpenInventory}
            />
            <SidebarMenuButton
              icon="/icons/sidebar-cart.png"
              title="Shopping List"
              subtitle={`${shopping.filter(i => !i.checked).length} remaining`}
              onClick={() => setPanel('shopping')}
            />
            <SidebarMenuButton
              icon="/icons/sidebar-meal-planner.png"
              title="Weekly Meal Planner"
              subtitle="Breakfast, lunch & dinner"
              onClick={onOpenWeeklyPlanner}
            />
            <SidebarMenuButton
              icon="/icons/sidebar-notes.png"
              title="Meal Notes"
              subtitle={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
              onClick={() => setPanel('notes')}
            />
            <SidebarMenuButton
              icon="/icons/sidebar-history.png"
              title="History"
              subtitle={`${historyCount} item${historyCount !== 1 ? 's' : ''}`}
              onClick={openHistory}
            />
          </div>
        )}

        {/* Notes panel */}
        {panel === 'notes' && (
          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
              {notes.length === 0 && (
                <p className="font-mono text-sm text-slate-400 text-center py-8 tracking-tight">No meal notes yet</p>
              )}
              {notes.map(note => (
                <div key={note.id} className="bg-stone-50 border border-stone-900/90 shadow-sm rounded-xl p-3 relative">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2 pr-1">
                      <PhotoUploadField
                        photoUrl={editNotePhotoUrl}
                        onPhotoUrlChange={setEditNotePhotoUrl}
                        onUploadingChange={setUploadingNotePhoto}
                        storageFolder="meal-notes"
                      />
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
                        <button
                          type="button"
                          onClick={saveEditNote}
                          disabled={savingNote || uploadingNotePhoto || !editNoteTitle.trim() || !editNoteContent.trim()}
                          className="flex-1 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                        >
                          {savingNote ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditNote}
                          className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEditNote(note)}
                          className="p-1 text-slate-400 active:text-slate-700"
                          aria-label="Edit note"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNote(note.id)}
                          className="p-1 text-slate-400 active:text-red-500"
                          aria-label="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 pr-12">{note.title}</h4>
                      <MealNotePhoto photoUrl={note.photo_url} className="mt-2" />
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {!showAddNoteForm && !editingNoteId && (
              <button
                type="button"
                onClick={() => {
                  cancelEditNote()
                  setShowAddNoteForm(true)
                }}
                className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg border-2 border-white"
                aria-label="Add meal note"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            )}

            {showAddNoteForm && (
              <div className="absolute inset-0 z-20 flex flex-col bg-white">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
                  <h3 className="font-mono text-sm font-bold text-stone-900">New Note</h3>
                  <button
                    type="button"
                    onClick={closeAddNoteForm}
                    className="font-mono text-[10px] uppercase tracking-wider text-stone-500 px-2 py-1 active:text-stone-900"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <PhotoUploadField
                    photoUrl={newNotePhotoUrl}
                    onPhotoUrlChange={setNewNotePhotoUrl}
                    onUploadingChange={setUploadingNotePhoto}
                    storageFolder="meal-notes"
                  />
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
                    rows={5}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="p-4 border-t border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={addNote}
                    disabled={savingNote || uploadingNotePhoto || !newNoteTitle.trim() || !newNoteContent.trim()}
                    className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {savingNote ? 'Saving…' : 'Add Note'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shopping panel */}
        {panel === 'shopping' && (
          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
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

            {!showAddShoppingForm && (
              <button
                type="button"
                onClick={() => setShowAddShoppingForm(true)}
                className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg border-2 border-white"
                aria-label="Add shopping item"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            )}

            {showAddShoppingForm && (
              <div className="absolute inset-0 z-20 flex flex-col bg-white">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
                  <h3 className="font-mono text-sm font-bold text-stone-900">New Item</h3>
                  <button
                    type="button"
                    onClick={closeAddShoppingForm}
                    className="font-mono text-[10px] uppercase tracking-wider text-stone-500 px-2 py-1 active:text-stone-900"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                    {STORES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newShoppingCategory}
                    onChange={e => setNewShoppingCategory(e.target.value as ShoppingCategory)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {SHOPPING_CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-4 border-t border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={addShoppingItem}
                    disabled={addingItem || !newShoppingName.trim()}
                    className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {addingItem ? 'Adding…' : 'Add Item'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
