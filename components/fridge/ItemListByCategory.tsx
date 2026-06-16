'use client'

import { HouseholdItem, groupItemsByCategory } from '@/lib/types'
import ItemCard from '@/components/items/ItemCard'
import CategoryListPage from './CategoryListPage'
import CollapsibleCategorySection from './CollapsibleCategorySection'

interface Props {
  title: string
  subtitle: string
  items: HouseholdItem[]
  onBack: () => void
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ItemListByCategory({ title, subtitle, items, onBack, onEdit, onDelete }: Props) {
  const groups = groupItemsByCategory(items)

  return (
    <CategoryListPage
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      isEmpty={groups.length === 0}
    >
      {groups.map(({ category, items: groupItems }) => (
        <CollapsibleCategorySection key={category} category={category} itemCount={groupItems.length}>
          {groupItems.map(item => (
            <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </CollapsibleCategorySection>
      ))}
    </CategoryListPage>
  )
}
