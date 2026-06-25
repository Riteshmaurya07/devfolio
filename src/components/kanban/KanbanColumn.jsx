import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'

const COLUMN_COLORS = {
  Applied: 'border-blue-500/40 bg-blue-500/5',
  OA: 'border-yellow-500/40 bg-yellow-500/5',
  Interview: 'border-violet/40 bg-violet/5',
  Offer: 'border-success/40 bg-success/5',
  Rejected: 'border-danger/40 bg-danger/5',
  Idea: 'border-teal/40 bg-teal/5',
  Building: 'border-warning/40 bg-warning/5',
  Deployed: 'border-success/40 bg-success/5',
}

const COLUMN_HEADER_COLORS = {
  Applied: 'text-blue-400',
  OA: 'text-yellow-400',
  Interview: 'text-violet-light',
  Offer: 'text-success',
  Rejected: 'text-danger',
  Idea: 'text-teal-light',
  Building: 'text-warning',
  Deployed: 'text-success',
}

export default function KanbanColumn({ id, title, items = [], renderCard, onAddItem }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const colorClass = COLUMN_COLORS[title] || 'border-border bg-surface'
  const headerColor = COLUMN_HEADER_COLORS[title] || 'text-text-primary'

  return (
    <div
      className={`flex-shrink-0 w-72 flex flex-col rounded-xl border transition-all duration-200 ${colorClass} ${
        isOver ? 'ring-1 ring-violet/50 scale-[1.01]' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${headerColor}`}>{title}</span>
          <span className="w-5 h-5 rounded-full bg-border flex items-center justify-center text-2xs text-text-secondary font-medium">
            {items.length}
          </span>
        </div>
        {onAddItem && (
          <button
            onClick={onAddItem}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
            aria-label={`Add to ${title}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="flex-1 px-2 py-2 space-y-2 min-h-[200px] overflow-y-auto no-scrollbar"
        >
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-text-muted border border-dashed border-border rounded-lg">
              Drop here
            </div>
          ) : (
            items.map((item) => renderCard ? renderCard(item) : null)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
