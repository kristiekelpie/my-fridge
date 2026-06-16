'use client'

import { HouseholdItem } from '@/lib/types'
import { groupItemsByStorageArea, STORAGE_AREA_LABELS } from '@/lib/storageAreas'
import ItemCard from '@/components/items/ItemCard'
import CategoryListPage from './CategoryListPage'
import CollapsibleListSection from './CollapsibleListSection'

interface Props {
  title: string
  subtitle: string
  items: HouseholdItem[]
  onBack: () => void
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ItemListByStorageArea({
  title,
  subtitle,
  items,
  onBack,
  onEdit,
  onDelete,
}: Props) {
  const groups = groupItemsByStorageArea(items)

  return (
    <CategoryListPage
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      isEmpty={groups.length === 0}
      emptyMessage="nothing expiring soon"
    >
      {groups.map(({ area, sections }) => {
        const areaCount = sections.reduce((sum, section) => sum + section.items.length, 0)

        return (
          <CollapsibleListSection
            key={area}
            label={STORAGE_AREA_LABELS[area]}
            itemCount={areaCount}
            layout="stack"
          >
            {sections.map(section => (
              <CollapsibleListSection
                key={section.key}
                label={section.label}
                emoji={section.emoji}
                itemCount={section.items.length}
                nested
              >
                {section.items.map(item => (
                  <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </CollapsibleListSection>
            ))}
          </CollapsibleListSection>
        )
      })}
    </CategoryListPage>
  )
}
