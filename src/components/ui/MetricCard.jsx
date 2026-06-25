import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!target || isNaN(target)) return
    const numTarget = typeof target === 'string' ? parseFloat(target.replace(/,/g, '')) : target
    if (isNaN(numTarget)) return

    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * numTarget))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

export default function MetricCard({
  title,
  value,
  suffix = '',
  prefix = '',
  icon: Icon,
  iconColor = 'text-violet-light',
  iconBg = 'bg-violet/15',
  trend,
  trendLabel,
  description,
  loading = false,
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''))
  const displayCount = useCountUp(isNaN(numericValue) ? 0 : numericValue)

  if (loading) {
    return (
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton w-24 h-4 rounded" />
          <div className="skeleton w-10 h-10 rounded-lg" />
        </div>
        <div className="skeleton w-16 h-8 rounded" />
        <div className="skeleton w-32 h-3 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="card hover:border-border-light transition-all duration-200 hover:shadow-card-hover cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-text-secondary font-medium">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-1 mb-2">
        <span className="metric-number">
          {prefix}
          {isNaN(numericValue) ? value : displayCount.toLocaleString()}
          {suffix}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-text-muted'
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
        {(trendLabel || description) && (
          <p className="text-xs text-text-muted">{trendLabel || description}</p>
        )}
      </div>
    </motion.div>
  )
}
