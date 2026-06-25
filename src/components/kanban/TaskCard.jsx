import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

export default function TaskCard({ item, children, isDragging = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative group bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragging ? 'shadow-modal scale-105 border-violet/40' : 'hover:border-border-light hover:shadow-card-hover'
      }`}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-secondary cursor-grab"
        aria-label="Drag handle"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {children || (
        <div className="text-sm text-text-primary">{item.name || item.company || item.id}</div>
      )}
    </div>
  )
}
