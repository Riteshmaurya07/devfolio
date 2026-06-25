const LANG_COLORS = {
  JavaScript: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  TypeScript: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  Python: { bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-400' },
  Rust: { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  Go: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  Java: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  'C++': { bg: 'bg-blue-600/15', text: 'text-blue-300', dot: 'bg-blue-300' },
  C: { bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-400' },
  Ruby: { bg: 'bg-red-400/15', text: 'text-red-300', dot: 'bg-red-300' },
  Swift: { bg: 'bg-orange-400/15', text: 'text-orange-300', dot: 'bg-orange-300' },
  Kotlin: { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  PHP: { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
  HTML: { bg: 'bg-orange-600/15', text: 'text-orange-500', dot: 'bg-orange-500' },
  CSS: { bg: 'bg-blue-400/15', text: 'text-blue-300', dot: 'bg-blue-300' },
  Shell: { bg: 'bg-green-600/15', text: 'text-green-300', dot: 'bg-green-300' },
  default: { bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-400' },
}

const VERDICT_STYLES = {
  Accepted: 'bg-success/15 text-success',
  'Wrong Answer': 'bg-danger/15 text-danger',
  'Time Limit Exceeded': 'bg-warning/15 text-warning',
  'Runtime Error': 'bg-orange-500/15 text-orange-400',
  'Memory Limit Exceeded': 'bg-purple-500/15 text-purple-400',
  default: 'bg-surface text-text-secondary',
}

const DIFFICULTY_STYLES = {
  Easy: 'bg-success/15 text-success',
  Medium: 'bg-warning/15 text-warning',
  Hard: 'bg-danger/15 text-danger',
}

const STATUS_STYLES = {
  Applied: 'bg-blue-500/15 text-blue-400',
  OA: 'bg-yellow-500/15 text-yellow-400',
  Interview: 'bg-violet/15 text-violet-light',
  Offer: 'bg-success/15 text-success',
  Rejected: 'bg-danger/15 text-danger',
  Idea: 'bg-teal/15 text-teal-light',
  Building: 'bg-warning/15 text-warning',
  Deployed: 'bg-success/15 text-success',
}

export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const style = STATUS_STYLES[children] || STATUS_STYLES[variant] || 'bg-surface text-text-secondary'
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span className={`inline-flex items-center rounded-md font-medium ${style} ${sizeClass}`}>
      {children}
    </span>
  )
}

export function LangBadge({ lang }) {
  const style = LANG_COLORS[lang] || LANG_COLORS.default
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {lang}
    </span>
  )
}

export function VerdictBadge({ verdict }) {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.default
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${style}`}>
      {verdict}
    </span>
  )
}

export function DifficultyBadge({ difficulty }) {
  const style = DIFFICULTY_STYLES[difficulty] || 'bg-surface text-text-secondary'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${style}`}>
      {difficulty}
    </span>
  )
}
