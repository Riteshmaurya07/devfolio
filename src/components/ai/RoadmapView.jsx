import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'

export default function RoadmapView({ weeks, onToggleTask }) {
  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0)
  const completedTasks = weeks.reduce((sum, w) => sum + w.tasks.filter((t) => t.done).length, 0)
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="card flex items-center gap-6">
        <ProgressRing
          percentage={overallPct}
          size={80}
          strokeWidth={7}
          color="#7C3AED"
        />
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Overall Progress</h3>
          <p className="text-xs text-text-secondary">
            {completedTasks} / {totalTasks} tasks completed
          </p>
          <p className="text-xs text-text-muted mt-1">
            {overallPct < 25 ? 'Just getting started! 🚀'
              : overallPct < 50 ? 'Making good progress! 💪'
              : overallPct < 75 ? 'Over halfway there! 🔥'
              : overallPct < 100 ? 'Almost done! 🎯'
              : 'Goal achieved! 🏆'}
          </p>
        </div>
      </div>

      {/* Week-by-week */}
      {weeks.map((week, wi) => {
        const weekPct = week.tasks.length > 0
          ? Math.round((week.tasks.filter((t) => t.done).length / week.tasks.length) * 100)
          : 0

        return (
          <motion.div
            key={wi}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wi * 0.05 }}
            className="card space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">{week.title}</h4>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weekPct}%` }}
                    transition={{ duration: 0.5, delay: wi * 0.05 }}
                    className="h-full bg-violet rounded-full"
                  />
                </div>
                <span className="text-xs text-text-muted">{weekPct}%</span>
              </div>
            </div>

            <div className="space-y-2">
              {week.tasks.map((task, ti) => (
                <button
                  key={ti}
                  onClick={() => onToggleTask(wi, ti)}
                  className="w-full flex items-start gap-2.5 text-left group"
                >
                  {task.done ? (
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5 group-hover:text-violet transition-colors" />
                  )}
                  <span className={`text-xs ${task.done ? 'text-text-muted line-through' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`}>
                    {task.text}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
