import ActivityCalendar from 'react-activity-calendar'

// Build a full-year dataset from the contributions array.
// GraphQL data already contains every day; this fills any remaining gaps.
function buildHeatmapData(contributions = []) {
  const map = {}
  contributions.forEach(({ date, count }) => {
    map[date] = count
  })

  const data = []
  const today = new Date()
  const start = new Date(today)
  start.setFullYear(today.getFullYear() - 1)
  start.setDate(start.getDate() + 1) // ActivityCalendar: first day = exactly 1 year ago

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const count = map[dateStr] || 0
    const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4
    data.push({ date: dateStr, count, level })
  }

  return data
}

// GraphQL returns ~365 days (all zeros included).
// The Events API fallback only returns dates with PushEvents (~5-60 dates).
function isRealData(contributions) {
  return contributions.length >= 200
}

export default function HeatMapChart({ contributions = [], loading = false }) {
  if (loading) {
    return <div className="skeleton w-full h-32 rounded-lg" />
  }

  const data = buildHeatmapData(contributions)
  const real = isRealData(contributions)
  const totalContributions = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="w-full space-y-2">
      {!real && contributions.length > 0 && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
          ⚠️ Showing partial data only. Add a valid{' '}
          <span className="font-mono">VITE_GITHUB_TOKEN</span> in{' '}
          <span className="font-mono">.env</span> for the full contribution graph.
        </p>
      )}
      <div className="w-full overflow-x-auto">
        <ActivityCalendar
          data={data}
          colorScheme="dark"
          theme={{
            dark: ['#1E1E22', '#3D1A78', '#5B21B6', '#7C3AED', '#A78BFA'],
          }}
          labels={{
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            totalCount: `${totalContributions.toLocaleString()} contributions in the last year`,
            legend: { less: 'Less', more: 'More' },
          }}
          fontSize={12}
          blockSize={12}
          blockMargin={3}
          style={{ color: '#8B8B9A' }}
          showWeekdayLabels
        />
      </div>
    </div>
  )
}
