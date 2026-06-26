import { motion } from 'framer-motion'
import PageWrapper from '@/components/layout/PageWrapper'
import GoalCheckbox from '@/components/streak/GoalCheckbox'
import StreakCounter from '@/components/streak/StreakCounter'
import WeeklyReport from '@/components/streak/WeeklyReport'
import { useStreak } from '@/hooks/useStreak'
import ProgressRing from '@/components/ui/ProgressRing'

export default function Streak() {
  const {
    streak,
    longestStreak,
    dailyGoals,
    checkGoal,
    getTodayStatus,
    getWeeklyReport,
    getTodayCompletion,
  } = useStreak()

  const todayStatus = getTodayStatus()
  const weeklyReport = getWeeklyReport()
  const { completed, total } = getTodayCompletion()
  const todayPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <PageWrapper>
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Habit Tracker</h2>
        <p className="text-sm text-text-muted">Complete all 3 daily goals to maintain your streak</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak counter */}
        <div className="space-y-4">
          <StreakCounter streak={streak} longestStreak={longestStreak} />

          {/* Today's progress ring */}
          <div className="card flex flex-col items-center gap-3 py-5">
            <ProgressRing
              percentage={todayPct}
              size={100}
              strokeWidth={8}
              color={todayPct === 100 ? '#22C55E' : '#7C3AED'}
              label="Today's Progress"
              sublabel={`${completed}/${total} goals done`}
            />
            {todayPct === 100 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-semibold text-success"
              >
                🎉 All goals complete!
              </motion.p>
            )}
          </div>
        </div>

        {/* Daily goals */}
        <div className="space-y-3">
          <h3 className="section-title">Today&apos;s Goals</h3>
          <div className="space-y-2">
            {dailyGoals.map((goal) => (
              <GoalCheckbox
                key={goal.id}
                goal={goal}
                checked={!!todayStatus[goal.id]}
                onChange={checkGoal}
              />
            ))}
          </div>

          <div className="card bg-violet/5 border-violet/20 mt-4">
            <p className="text-xs text-text-secondary">
              💡 <strong className="text-text-primary">Tip:</strong> Complete all goals every day to maintain your streak. 
              Missing a day resets it to 0!
            </p>
          </div>
        </div>

        {/* Weekly report */}
        <div className="space-y-3">
          <h3 className="section-title">This Week</h3>
          <WeeklyReport report={weeklyReport} />

          {/* Weekly stats */}
          <div className="card space-y-2">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Week Summary</h4>
            {weeklyReport.map((day, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-text-muted w-8">{day.label}</span>
                <div className="flex-1 mx-2 h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${day.pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`h-full rounded-full ${day.pct === 100 ? 'bg-success' : day.pct > 0 ? 'bg-violet' : 'bg-border'}`}
                  />
                </div>
                <span className={`text-xs font-medium w-8 text-right ${
                  day.pct === 100 ? 'text-success' : day.pct > 0 ? 'text-violet-light' : 'text-text-muted'
                }`}>
                  {day.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
