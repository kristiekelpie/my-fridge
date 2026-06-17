'use client'

import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  HouseholdItem,
  Category,
  StorageArea,
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  groupItemsByCategory,
  sortItemsByExpiryDate,
  normalizeCategory,
} from '@/lib/types'
import {
  STORAGE_AREAS,
  STORAGE_AREA_LABELS,
  STORAGE_AREA_HEADING,
  FRIDGE_SECTION_LABELS,
  normalizeStorageArea,
} from '@/lib/storageAreas'
import ItemCard from '@/components/items/ItemCard'
import CategoryListPage from './CategoryListPage'
import CollapsibleCategorySection from './CollapsibleCategorySection'

interface Props {
  items: HouseholdItem[]
  onBack: () => void
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
  title?: string
  subtitle?: string
  emptyMessage?: string
  /** Section / type filter dropdowns in the header. */
  showFilters?: boolean
  /** When set, limits view to one storage area and hides the section filter. */
  scopeArea?: StorageArea
  /** When false, items are grouped by storage area and sorted by expiry (no category headers). */
  groupByCategory?: boolean
}

function areaItemGroups(area: StorageArea, sectionItems: HouseholdItem[]) {
  if (area === 'fridge') {
    return [
      {
        label: FRIDGE_SECTION_LABELS.freezer,
        items: sectionItems.filter(item => item.location === 'freezer'),
      },
      {
        label: FRIDGE_SECTION_LABELS.fridge,
        items: sectionItems.filter(item => item.location !== 'freezer'),
      },
    ].filter(group => group.items.length > 0)
  }
  return [{ label: STORAGE_AREA_HEADING[area], items: sectionItems }]
}

function StorageAreaGroups({
  items,
  scopeArea,
  onEdit,
  onDelete,
}: {
  items: HouseholdItem[]
  scopeArea?: StorageArea
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}) {
  const areas = scopeArea ? [scopeArea] : STORAGE_AREAS

  return (
    <>
      {areas.map(area => {
        const sectionItems = sortItemsByExpiryDate(
          items.filter(item => normalizeStorageArea(item.storage_area) === area)
        )
        if (sectionItems.length === 0) return null

        return areaItemGroups(area, sectionItems).map(group => (
          <div key={`${area}-${group.label}`} className="col-span-3 mb-3 last:mb-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 mb-2 px-0.5">
              {group.label}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {group.items.map(item => (
                <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </div>
        ))
      })}
    </>
  )
}

function CategoryAreaGroups({
  categoryItems,
  scopeArea,
  onEdit,
  onDelete,
}: {
  categoryItems: HouseholdItem[]
  scopeArea?: StorageArea
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}) {
  return (
    <StorageAreaGroups
      items={categoryItems}
      scopeArea={scopeArea}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}

type OpenFilter = 'section' | 'type' | null

function toggleSetValue<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function FilterTrigger({
  title,
  activeCount,
  open,
  onClick,
}: {
  title: string
  activeCount: number
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 border border-stone-300 rounded-lg bg-stone-50/90 active:bg-stone-100 text-left"
      aria-expanded={open}
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-stone-600">
        {title}
        {activeCount > 0 && (
          <span className="ml-1.5 text-stone-400 normal-case tracking-normal">
            ({activeCount} selected)
          </span>
        )}
      </span>
      <ChevronDown
        size={14}
        className={`shrink-0 text-stone-500 transition-transform ${open ? '' : '-rotate-90'}`}
      />
    </button>
  )
}

function FilterChecklist<T extends string>({
  options,
  selected,
  onChange,
  getLabel,
  getEmoji,
}: {
  options: readonly T[]
  selected: Set<T>
  onChange: (next: Set<T>) => void
  getLabel: (value: T) => string
  getEmoji?: (value: T) => string
}) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-40 rounded-lg border border-stone-300 bg-white shadow-md p-2 max-h-40 overflow-y-auto space-y-0.5">
      {options.map(option => {
        const checked = selected.has(option)
        return (
          <button
            key={option}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => onChange(toggleSetValue(selected, option))}
            className="flex items-center gap-2 py-1.5 px-1 rounded-md active:bg-stone-100 text-left min-w-0"
          >
            <span
              className={`shrink-0 w-3.5 h-3.5 border rounded-[3px] flex items-center justify-center ${
                checked ? 'border-stone-900 bg-stone-900' : 'border-stone-400 bg-white'
              }`}
              aria-hidden
            >
              {checked && (
                <svg viewBox="0 0 10 8" className="w-2 h-2 text-white" fill="none">
                  <path
                    d="M1 4 L3.5 6.5 L9 1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {getEmoji && <span className="text-sm leading-none shrink-0">{getEmoji(option)}</span>}
            <span className="font-mono text-[10px] uppercase tracking-wide text-stone-700 truncate">
              {getLabel(option)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function MasterInventoryView({
  items,
  onBack,
  onEdit,
  onDelete,
  title = 'Master Inventory',
  subtitle,
  emptyMessage = 'nothing here yet',
  showFilters = true,
  scopeArea,
  groupByCategory = true,
}: Props) {
  const [selectedSections, setSelectedSections] = useState<Set<StorageArea>>(new Set())
  const [selectedTypes, setSelectedTypes] = useState<Set<Category>>(new Set())
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null)

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const area = normalizeStorageArea(item.storage_area)
      const category = normalizeCategory(item.category)
      if (scopeArea && area !== scopeArea) return false
      if (showFilters && selectedSections.size > 0 && !selectedSections.has(area)) return false
      if (showFilters && selectedTypes.size > 0 && !selectedTypes.has(category)) return false
      return true
    })
  }, [items, scopeArea, showFilters, selectedSections, selectedTypes])

  const groups = useMemo(() => groupItemsByCategory(filteredItems), [filteredItems])

  const filtersActive = selectedSections.size > 0 || selectedTypes.size > 0
  const showSectionFilter = showFilters && !scopeArea
  const resolvedSubtitle =
    subtitle ??
    (groupByCategory
      ? `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} — grouped by type`
      : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} — earliest expiry first`)
  const isEmpty = groupByCategory ? groups.length === 0 : filteredItems.length === 0

  function toggleFilter(panel: Exclude<OpenFilter, null>) {
    setOpenFilter(current => (current === panel ? null : panel))
  }

  function clearFilters() {
    setSelectedSections(new Set())
    setSelectedTypes(new Set())
  }

  return (
    <CategoryListPage
      title={title}
      subtitle={resolvedSubtitle}
      onBack={onBack}
      isEmpty={isEmpty}
      emptyMessage={filtersActive ? 'no items match these filters' : emptyMessage}
      headerExtra={
        showFilters ? (
        <div className="mt-3 space-y-2 overflow-visible">
          <div className="flex flex-col sm:flex-row gap-2 items-start overflow-visible">
            {showSectionFilter && (
              <div
                className={`relative flex-1 min-w-0 w-full sm:w-auto ${openFilter === 'section' ? 'z-50' : 'z-30'}`}
              >
                <FilterTrigger
                  title="Section"
                  activeCount={selectedSections.size}
                  open={openFilter === 'section'}
                  onClick={() => toggleFilter('section')}
                />
                {openFilter === 'section' && (
                  <FilterChecklist
                    options={STORAGE_AREAS}
                    selected={selectedSections}
                    onChange={setSelectedSections}
                    getLabel={area => STORAGE_AREA_LABELS[area]}
                  />
                )}
              </div>
            )}
            <div
              className={`relative flex-1 min-w-0 w-full sm:w-auto ${openFilter === 'type' ? 'z-50' : 'z-30'}`}
            >
              <FilterTrigger
                title="Type"
                activeCount={selectedTypes.size}
                open={openFilter === 'type'}
                onClick={() => toggleFilter('type')}
              />
              {openFilter === 'type' && (
                <FilterChecklist
                  options={CATEGORIES}
                  selected={selectedTypes}
                  onChange={setSelectedTypes}
                  getLabel={category => CATEGORY_LABELS[category]}
                  getEmoji={category => CATEGORY_EMOJI[category]}
                />
              )}
            </div>
          </div>

          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-mono text-[9px] uppercase tracking-wider text-stone-500 active:text-stone-800"
            >
              Clear filters
            </button>
          )}
        </div>
        ) : undefined
      }
    >
      {groupByCategory ? (
        groups.map(({ category, items: categoryItems }) => (
          <CollapsibleCategorySection key={category} category={category} itemCount={categoryItems.length}>
            <CategoryAreaGroups
              categoryItems={categoryItems}
              scopeArea={scopeArea}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </CollapsibleCategorySection>
        ))
      ) : (
        <section>
          <div className="pt-3 pb-4">
            <div className="grid grid-cols-3 gap-2">
              <StorageAreaGroups
                items={filteredItems}
                scopeArea={scopeArea}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        </section>
      )}
    </CategoryListPage>
  )
}
