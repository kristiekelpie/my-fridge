'use client'

import { HouseholdItem, Location, LOCATION_LABELS } from '@/lib/types'
import ItemListByCategory from './ItemListByCategory'

interface Props {
  zone: Location
  items: HouseholdItem[]
  onBack: () => void
  onEdit: (item: HouseholdItem) => void
  onDelete: (id: string) => void
}

export default function ZoneInterior({ zone, items, onBack, onEdit, onDelete }: Props) {
  const title = LOCATION_LABELS[zone]
  const subtitle =
    items.length === 0
      ? 'nothing here yet'
      : `${items.length} item${items.length !== 1 ? 's' : ''} — grouped by category`

  return (
    <ItemListByCategory
      title={title}
      subtitle={subtitle}
      items={items}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
