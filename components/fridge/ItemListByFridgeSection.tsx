'use client'

import { HouseholdItem, groupItemsByCategory } from '@/lib/types'
import { groupFridgeItemsBySection } from '@/lib/storageAreas'
import ItemCard from '@/components/items/ItemCard'
import CategoryListPage from './CategoryListPage'
import CollapsibleListSection from './CollapsibleListSection'
import CollapsibleCategorySection from './CollapsibleCategorySection'

interface Props {
  title: string
  subtitle: string
  items: HouseholdItem[]
  onBack: () => void
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ItemListByFridgeSection({
  title,
  subtitle,
  items,
  onBack,
  onEdit,
  onDelete,
}: Props) {
  const sections = groupFridgeItemsBySection(items)

  return (
    <CategoryListPage
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      isEmpty={sections.length === 0}
    >
      {sections.map(section => {
        const groups = groupItemsByCategory(section.items)

        return (
          <CollapsibleListSection
            key={section.key}
            label={section.label}
            itemCount={section.items.length}
            layout="stack"
          >
            {groups.map(({ category, items: groupItems }) => (
              <CollapsibleCategorySection key={category} category={category} itemCount={groupItems.length}>
                {groupItems.map(item => (
                  <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </CollapsibleCategorySection>
            ))}
          </CollapsibleListSection>
        )
      })}
    </CategoryListPage>
  )
}
