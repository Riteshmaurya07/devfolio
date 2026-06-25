import { motion } from 'framer-motion'

export default function WeeklyReport({ report }) {
  const maxPct = Math.max(...report.map((d) => d.pct), 1)

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Weekly Report</h3>
      <div className="flex items-end gap-2 h-24">
        {report.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(day.pct / maxPct) * 80}px` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`w-full rounded-t-md ${
                day.pct === 100
                  ? 'bg-success'
                  : day.pct > 50
                  ? 'bg-violet'
                  : day.pct > 0
                  ? 'bg-warning'
                  : 'bg-border'
              }`}
            />
            <span className="text-2xs text-text-muted">{day.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border text-xs text-text-muted">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-success" />100%</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet" />&gt;50%</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-warning" />&gt;0%</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-border" />Missed</div>
      </div>
    </div>
  )
}
