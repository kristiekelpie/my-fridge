'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, Trash2, X } from 'lucide-react'
import ConstrainedPageShell from '@/components/layout/ConstrainedPageShell'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const
const MEALS = ['breakfast', 'lunch', 'dinner'] as const
const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

const MEAL_LABELS_UPPER: Record<MealKey, string> = {
  breakfast: 'BREAKFAST',
  lunch: 'LUNCH',
  dinner: 'DINNER',
}
const LOCAL_STORAGE_KEY = 'weekly-meal-plan:v1'

type DayKey = (typeof DAYS)[number]
type MealKey = (typeof MEALS)[number]
type WeeklyMealPlan = Record<DayKey, Record<MealKey, string>>
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function createEmptyPlan(): WeeklyMealPlan {
  return DAYS.reduce((plan, day) => {
    plan[day] = { breakfast: '', lunch: '', dinner: '' }
    return plan
  }, {} as WeeklyMealPlan)
}

function normalizePlan(raw: unknown): WeeklyMealPlan {
  const empty = createEmptyPlan()
  if (!raw || typeof raw !== 'object') return empty
  const source = raw as Partial<Record<DayKey, Partial<Record<MealKey, unknown>>>>

  return DAYS.reduce((plan, day) => {
    const dayPlan = source[day]
    plan[day] = MEALS.reduce((meals, meal) => {
      const value = dayPlan?.[meal]
      meals[meal] = typeof value === 'string' ? value : ''
      return meals
    }, {} as Record<MealKey, string>)
    return plan
  }, {} as WeeklyMealPlan)
}

function loadLocalPlan(): WeeklyMealPlan {
  if (typeof window === 'undefined') return createEmptyPlan()
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? normalizePlan(JSON.parse(stored)) : createEmptyPlan()
  } catch {
    return createEmptyPlan()
  }
}

function persistLocalPlan(plan: WeeklyMealPlan) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan))
  } catch {
    // Supabase sync still handles persistence when available.
  }
}

interface Props {
  onBack: () => void
}

interface MealEditableFieldProps {
  id: string
  value: string
  ariaLabel: string
  onChange: (value: string) => void
}

function resizeMealField(field: HTMLElement) {
  field.style.height = 'auto'
  field.style.height = `${field.scrollHeight}px`
}

function MealEditableField({ id, value, ariaLabel, onChange }: MealEditableFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const field = fieldRef.current
    if (!field || document.activeElement === field) return
    if (field.innerText !== value) {
      field.innerText = value
      resizeMealField(field)
    }
  }, [value])

  return (
    <div
      ref={fieldRef}
      id={id}
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline="true"
      contentEditable
      suppressContentEditableWarning
      tabIndex={0}
      onInput={e => {
        const el = e.currentTarget
        onChange(el.innerText)
        resizeMealField(el)
      }}
      onPaste={e => {
        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return
        selection.deleteFromDocument()
        selection.getRangeAt(0).insertNode(document.createTextNode(text))
        selection.collapseToEnd()
        const el = fieldRef.current
        if (!el) return
        onChange(el.innerText)
        resizeMealField(el)
      }}
      className="min-h-[2.25rem] w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none [-webkit-user-modify:read-write-plaintext-only] focus:ring-2 focus:ring-blue-500 empty:before:text-slate-400 empty:before:content-['meal…']"
    />
  )
}

export default function WeeklyMealPlannerView({ onBack }: Props) {
  const supabase = createClient()
  const [plan, setPlan] = useState<WeeklyMealPlan>(() => createEmptyPlan())
  const [editingDay, setEditingDay] = useState<DayKey | null>(null)
  const [dayDraft, setDayDraft] = useState<Record<MealKey, string>>({
    breakfast: '',
    lunch: '',
    dinner: '',
  })
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const focusMealRef = useRef<MealKey | null>(null)
  const planRef = useRef(plan)
  const dayDraftRef = useRef(dayDraft)
  const editingDayRef = useRef(editingDay)

  useEffect(() => {
    planRef.current = plan
  }, [plan])

  useEffect(() => {
    dayDraftRef.current = dayDraft
  }, [dayDraft])

  useEffect(() => {
    editingDayRef.current = editingDay
  }, [editingDay])

  const fetchPlan = useCallback(async () => {
    const localPlan = loadLocalPlan()
    setPlan(localPlan)

    if (!isSupabaseConfigured()) return

    const { data, error } = await supabase
      .from('weekly_meal_plan')
      .select('plan')
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      setSyncMessage('Saved on this device. Run supabase-weekly-meal-plan.sql to sync across devices.')
      return
    }

    if (data?.plan) {
      const remotePlan = normalizePlan(data.plan)
      setPlan(remotePlan)
      persistLocalPlan(remotePlan)
    }
  }, [supabase])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const syncPlanRemote = useCallback(
    async (nextPlan: WeeklyMealPlan) => {
      if (!isSupabaseConfigured()) {
        setSaveState('saved')
        setSyncMessage('Saved on this device.')
        return
      }

      setSaveState('saving')
      setSyncMessage(null)
      const { error } = await supabase
        .from('weekly_meal_plan')
        .upsert({ id: 1, plan: nextPlan, updated_at: new Date().toISOString() })

      if (error) {
        setSaveState('error')
        setSyncMessage('Saved on this device. Run supabase-weekly-meal-plan.sql to sync across devices.')
        return
      }

      setSaveState('saved')
    },
    [supabase]
  )

  const saveDay = useCallback(() => {
    const day = editingDayRef.current
    if (!day) return

    const draft = dayDraftRef.current
    const nextPlan: WeeklyMealPlan = {
      ...planRef.current,
      [day]: {
        breakfast: draft.breakfast.trim(),
        lunch: draft.lunch.trim(),
        dinner: draft.dinner.trim(),
      },
    }

    planRef.current = nextPlan
    persistLocalPlan(nextPlan)
    setPlan(nextPlan)
    setEditingDay(null)
    void syncPlanRemote(nextPlan)
  }, [syncPlanRemote])

  function startEditDay(day: DayKey, meal?: MealKey) {
    setEditingDay(day)
    setDayDraft({ ...planRef.current[day] })
    setSaveState('idle')
    focusMealRef.current = meal ?? null
  }

  useEffect(() => {
    if (!editingDay || !focusMealRef.current) return
    const meal = focusMealRef.current
    focusMealRef.current = null
    requestAnimationFrame(() => {
      const field = document.getElementById(`mp-${editingDay.toLowerCase()}-${meal}`)
      field?.focus()
    })
  }, [editingDay])

  function cancelEditDay() {
    setEditingDay(null)
    setSaveState('idle')
  }

  function updateDayDraftMeal(meal: MealKey, value: string) {
    setDayDraft(current => ({ ...current, [meal]: value }))
    if (saveState === 'saved') setSaveState('idle')
  }

  async function clearDay(day: DayKey) {
    const nextPlan = {
      ...planRef.current,
      [day]: { breakfast: '', lunch: '', dinner: '' },
    }
    planRef.current = nextPlan
    persistLocalPlan(nextPlan)
    setPlan(nextPlan)
    if (editingDay === day) setEditingDay(null)
    await syncPlanRemote(nextPlan)
  }

  return (
    <ConstrainedPageShell>
      <div className="flex flex-1 flex-col min-h-0">
        <div className="px-5 pt-5 pb-4 border-b border-stone-400/40 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 -ml-2 py-2 pr-3 rounded-md active:bg-stone-200/80 font-mono text-sm tracking-[0.15em] uppercase text-stone-700"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
            Back
          </button>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500 mt-1">
            Nic + Kris
          </p>
          <h2 className="font-mono text-2xl tracking-tight text-stone-900 mt-0.5">
            <span className="editorial-underline font-bold">Weekly Meal Planner</span>
          </h2>
          <p className="font-mono text-sm text-stone-600 mt-1 tracking-tight">
            Plan breakfast, lunch, and dinner for the week.
          </p>
          {syncMessage && (
            <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-mono text-[10px] leading-snug text-amber-900">
              {syncMessage}
            </p>
          )}
          {saveState === 'saved' && !syncMessage && (
            <p className="mt-2 font-mono text-[10px] text-stone-500">Saved</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4 pb-8 space-y-3 sm:p-4">
          {DAYS.map(day => (
            <div
              key={day}
              className="relative overflow-hidden rounded-xl border border-stone-900/90 bg-stone-50 shadow-sm"
            >
              <div
                className={`grid grid-cols-[2.875rem_1fr] sm:grid-cols-[3.25rem_1fr] ${
                  editingDay === day ? 'pb-9' : ''
                }`}
              >
                <div className="row-span-3 flex items-center justify-center border-r border-stone-900/20 px-0.5 font-mono text-sm font-bold tracking-[0.08em] text-stone-800 sm:px-0 sm:text-base sm:tracking-[0.12em]">
                  {day}
                </div>

                {MEALS.map((meal, mealIndex) => (
                  <div
                    key={meal}
                    className={`col-start-2 grid grid-cols-[3.5rem_1fr] items-start gap-x-0.5 py-2.5 pl-1 pr-8 sm:grid-cols-[5.5rem_1fr] sm:gap-x-2 sm:px-3 sm:pr-10 ${
                      mealIndex < MEALS.length - 1 ? 'border-b border-stone-900/20' : ''
                    }`}
                  >
                    <span className="pt-2 font-mono text-[8px] font-bold uppercase tracking-[0.04em] text-stone-700 sm:text-[9px] sm:tracking-[0.08em]">
                      {MEAL_LABELS_UPPER[meal]}
                    </span>
                    <div className="min-w-0">
                      {editingDay === day ? (
                        <MealEditableField
                          id={`mp-${day.toLowerCase()}-${meal}`}
                          value={dayDraft[meal]}
                          ariaLabel={`${day} ${MEAL_LABELS[meal]}`}
                          onChange={value => updateDayDraftMeal(meal, value)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditDay(day, meal)}
                          className="block w-full rounded-xl pt-0.5 text-left active:bg-stone-200/60"
                          aria-label={`Edit ${day} ${MEAL_LABELS[meal]}`}
                        >
                          <span className="whitespace-pre-wrap text-xs text-slate-600">
                            {plan[day][meal] || '—'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {editingDay === day ? (
                <>
                  <div className="absolute right-2 top-2">
                    <button
                      type="button"
                      onClick={cancelEditDay}
                      disabled={saveState === 'saving'}
                      className="p-1 text-slate-400 active:text-slate-700 disabled:opacity-40"
                      aria-label="Cancel editing"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="absolute right-2 bottom-2">
                    <button
                      type="button"
                      onClick={saveDay}
                      disabled={saveState === 'saving'}
                      className="p-1 text-slate-400 active:text-green-600 disabled:opacity-40"
                      aria-label={`Save ${day} meals`}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute right-2 top-2">
                  <button
                    type="button"
                    onClick={() => clearDay(day)}
                    className="p-1 text-slate-400 active:text-red-500"
                    aria-label={`Clear ${day} meals`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ConstrainedPageShell>
  )
}
