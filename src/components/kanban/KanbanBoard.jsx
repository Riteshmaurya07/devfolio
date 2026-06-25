import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'

export default function KanbanBoard({
  columns,
  items,
  onMove,
  onReorder,
  renderCard,
  onAddItem,
  columnColors = {},
}) {
  const [activeItem, setActiveItem] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const findColumnOfItem = (itemId) => {
    for (const col of columns) {
      const found = items[col]?.find((item) => item.id === itemId)
      if (found) return col
    }
    return null
  }

  const handleDragStart = ({ active }) => {
    const col = findColumnOfItem(active.id)
    const item = items[col]?.find((i) => i.id === active.id)
    setActiveItem(item)
    setActiveColumn(col)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveItem(null)
    setActiveColumn(null)

    if (!over) return

    const fromColumn = findColumnOfItem(active.id)
    // over.id could be a column id or an item id
    const toColumn = columns.includes(over.id)
      ? over.id
      : findColumnOfItem(over.id)

    if (!fromColumn || !toColumn) return

    if (fromColumn === toColumn) {
      // Reorder within column
      const colItems = items[fromColumn]
      const oldIndex = colItems.findIndex((i) => i.id === active.id)
      const newIndex = colItems.findIndex((i) => i.id === over.id)
      if (oldIndex !== newIndex && onReorder) {
        onReorder(fromColumn, arrayMove(colItems, oldIndex, newIndex))
      }
    } else {
      // Move to different column
      if (onMove) {
        onMove(active.id, fromColumn, toColumn)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {columns.map((col) => (
          <KanbanColumn
            key={col}
            id={col}
            title={col}
            items={items[col] || []}
            color={columnColors[col]}
            renderCard={renderCard}
            onAddItem={onAddItem ? () => onAddItem(col) : null}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && renderCard
          ? renderCard(activeItem, true)
          : activeItem
          ? <TaskCard item={activeItem} isDragging />
          : null}
      </DragOverlay>
    </DndContext>
  )
}
