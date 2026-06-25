export default function StatRow({ label, value1, value2 }) {
  const n1 = typeof value1 === 'number' ? value1 : parseFloat(value1) || 0
  const n2 = typeof value2 === 'number' ? value2 : parseFloat(value2) || 0
  const winner = n1 > n2 ? 'left' : n2 > n1 ? 'right' : 'tie'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      {/* User 1 value */}
      <div className="flex-1 text-right">
        <span className={`text-sm font-semibold ${winner === 'left' ? 'text-violet-light' : 'text-text-secondary'}`}>
          {typeof value1 === 'number' ? value1.toLocaleString() : value1}
        </span>
        {winner === 'left' && <WinnerBadge />}
      </div>

      {/* Label */}
      <div className="w-28 text-center">
        <span className="text-xs text-text-muted font-medium">{label}</span>
      </div>

      {/* User 2 value */}
      <div className="flex-1 text-left">
        {winner === 'right' && <WinnerBadge side="right" />}
        <span className={`text-sm font-semibold ${winner === 'right' ? 'text-teal-light' : 'text-text-secondary'}`}>
          {typeof value2 === 'number' ? value2.toLocaleString() : value2}
        </span>
      </div>
    </div>
  )
}

function WinnerBadge({ side = 'left' }) {
  return (
    <span className={`inline-block text-2xs font-bold px-1.5 py-0.5 rounded ${
      side === 'left'
        ? 'bg-violet/20 text-violet-light ml-1.5'
        : 'bg-teal/20 text-teal-light mr-1.5'
    }`}>
      WIN
    </span>
  )
}

export { WinnerBadge }
