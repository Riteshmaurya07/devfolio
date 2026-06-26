import { motion } from 'framer-motion'
import { Trophy, Star, XCircle } from 'lucide-react'

function ScoreBar({ score, max = 10 }) {
  const pct = (score / max) * 100
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`h-full rounded-full ${
            pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-danger'
          }`}
        />
      </div>
      <span className="text-xs font-medium text-text-primary w-10 text-right">{score}/{max}</span>
    </div>
  )
}

export default function ScoreCard({ answers, topic }) {
  const total = answers.reduce((sum, a) => sum + a.score, 0)
  const maxTotal = answers.length * 10
  const avgScore = answers.length > 0 ? Math.round((total / maxTotal) * 100) : 0

  const grade = avgScore >= 85 ? { label: 'Excellent', color: 'text-success', icon: Trophy }
    : avgScore >= 70 ? { label: 'Good', color: 'text-warning', icon: Star }
    : { label: 'Needs Practice', color: 'text-danger', icon: XCircle }

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="text-center card border-gradient">
        <div className={`text-5xl font-bold mb-2 ${grade.color}`}>{avgScore}%</div>
        <div className="flex items-center justify-center gap-2">
          <grade.icon className={`w-4 h-4 ${grade.color}`} />
          <span className={`font-semibold text-sm ${grade.color}`}>{grade.label}</span>
        </div>
        <p className="text-xs text-text-muted mt-1">{topic} Interview Score</p>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-4">
        {answers.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-text-primary">Q{i + 1}: {a.question}</p>
              <ScoreBar score={a.score} />
            </div>
            <div className="bg-surface rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Your answer:</p>
              <p className="text-xs text-text-secondary">{a.answer}</p>
            </div>
            <div className="bg-violet/5 border border-violet/20 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">AI Feedback:</p>
              <p className="text-xs text-text-secondary whitespace-pre-wrap">{a.feedback}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
