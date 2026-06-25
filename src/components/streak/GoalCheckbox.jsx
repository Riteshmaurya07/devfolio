import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

export default function GoalCheckbox({ goal, checked, onChange }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onChange(goal.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
        checked
          ? 'bg-success/10 border-success/30 text-success'
          : 'bg-surface border-border text-text-secondary hover:border-border-light hover:text-text-primary'
      }`}
    >
      <motion.div
        initial={false}
        animate={{ scale: checked ? [1.2, 1] : 1 }}
        transition={{ duration: 0.2 }}
      >
        {checked ? (
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 flex-shrink-0" />
        )}
      </motion.div>
      <div>
        <span className="text-sm">{goal.icon} {goal.label}</span>
      </div>
      {checked && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-auto text-xs font-medium text-success"
        >
          Done!
        </motion.span>
      )}
    </motion.button>
  )
}
