import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function StreakCounter({ streak, longestStreak }) {
  return (
    <div className="card text-center space-y-3 border-gradient">
      <motion.div
        animate={{ scale: streak > 0 ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.6, repeat: streak > 0 ? Infinity : 0, repeatDelay: 2 }}
        className="flex justify-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
          <Flame className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      <div>
        <motion.p
          key={streak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold text-text-primary"
        >
          {streak}
        </motion.p>
        <p className="text-sm text-text-secondary font-medium">Day Streak 🔥</p>
      </div>

      <div className="flex justify-center gap-6 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-violet-light">{longestStreak}</p>
          <p className="text-xs text-text-muted">Best Streak</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-success">{streak > 0 ? '🟢' : '⭕'}</p>
          <p className="text-xs text-text-muted">Today</p>
        </div>
      </div>
    </div>
  )
}
