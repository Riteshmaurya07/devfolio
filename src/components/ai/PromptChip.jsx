import { motion } from 'framer-motion'

export default function PromptChip({ label, icon, onClick, disabled = false }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => !disabled && onClick(label)}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-text-secondary hover:text-text-primary hover:border-violet/40 hover:bg-violet/5 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {icon && <span className="text-sm">{icon}</span>}
      {label}
    </motion.button>
  )
}
