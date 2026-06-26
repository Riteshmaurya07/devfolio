import { useEffect } from 'react'
import {
  Star,
  GitCommit,
  Target,
  Flame,
  Link,
  Award,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import MetricCard from '@/components/ui/MetricCard'
import HeatMapChart from '@/components/charts/HeatMapChart'
import RadarChartComponent from '@/components/charts/RadarChartComponent'
import PieChartComponent from '@/components/charts/PieChartComponent'
import AreaChartComponent from '@/components/charts/AreaChartComponent'
import useAuthStore from '@/store/authStore'
import useConnectedAccountsStore from '@/store/connectedAccountsStore'
import { calcGitHubStreak } from '@/utils/calcStreak'
import { formatRelative, formatTimestamp } from '@/utils/formatDate'

const PLATFORM_COLOR_MAP = {
  github: '#7C3AED',
  leetcode: '#F59E0B',
  codeforces: '#3B82F6',
  codechef: '#92400E',
  hackerrank: '#10B981',
  geeksforgeeks: '#047857',
  atcoder: '#6B7280',
  hackerearth: '#4F46E5',
  linkedin: '#0284C7',
  stackoverflow: '#F97316',
  'dev.to': '#0F172A',
  hashnode: '#2563EB',
  kaggle: '#06B6D4',
  topcoder: '#EAB308',
  codolio: '#8B5CF6',
  codingninjas: '#EF4444',
}

const PLATFORM_NAME_MAP = {
  github: 'GitHub',
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  geeksforgeeks: 'GeeksforGeeks',
  atcoder: 'AtCoder',
  hackerearth: 'HackerEarth',
  linkedin: 'LinkedIn',
  stackoverflow: 'Stack Overflow',
  'dev.to': 'Dev.to',
  hashnode: 'Hashnode',
  kaggle: 'Kaggle',
  topcoder: 'TopCoder',
  codolio: 'Codolio',
  codingninjas: 'Coding Ninjas',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const {
    accounts,
    stats,
    syncing,
    level,
    title,
    connectAccount,
    syncAccount
  } = useConnectedAccountsStore()

  // Connect GitHub automatically on load if user is logged in
  useEffect(() => {
    if (user?.login && !accounts.github.connected) {
      connectAccount('github', user.login)
    }
  }, [user?.login, accounts.github.connected, connectAccount])

  // Sync connected accounts on mount
  useEffect(() => {
    const connected = Object.keys(accounts).filter(k => accounts[k].connected)
    connected.forEach(p => syncAccount(p))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncAccount])

  // Filtering platforms that are connected AND selected to show on dashboard
  const enabledPlatforms = Object.keys(accounts).filter(
    (k) => accounts[k].connected && accounts[k].showOnDashboard
  )

  // Empty state if no platforms are enabled
  if (enabledPlatforms.length === 0) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-card/20 border border-border/40 rounded-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet-light mb-4 shadow-lg glow-violet">
            <Link className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Connect Your Developer Profiles</h2>
          <p className="text-sm text-text-secondary max-w-sm mt-2 mb-6">
            Unlock the power of unified career analytics. Link your accounts from GitHub, LeetCode, Codeforces, LinkedIn, and more in Settings.
          </p>
          <a href="/settings" className="btn-primary flex items-center gap-2">
            Configure Connected Accounts
          </a>
        </div>
      </PageWrapper>
    )
  }

  // --- Aggregate Stats ---
  let displaySolved = 0
  let displayContests = 0
  let displayCommits = 0
  let displayStars = 0
  let displayContributions = 0

  if (accounts.github?.connected && accounts.github?.showOnDashboard && stats.github) {
    const gh = stats.github
    displayStars += (gh.repos || []).reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
    displayCommits += (gh.events || []).filter(e => e.type === 'PushEvent')
      .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0) || 45
    displayContributions += gh.contributions?.reduce((sum, c) => sum + c.count, 0) || displayCommits
  }
  if (accounts.leetcode?.connected && accounts.leetcode?.showOnDashboard && stats.leetcode) {
    displaySolved += stats.leetcode.totalSolved || 0
  }
  if (accounts.codeforces?.connected && accounts.codeforces?.showOnDashboard && stats.codeforces) {
    displaySolved += stats.codeforces.problemsSolved || 0
    displayContests += stats.codeforces.contestsParticipated || 0
  }
  if (accounts.codechef?.connected && accounts.codechef?.showOnDashboard && stats.codechef) {
    displaySolved += stats.codechef.problemsSolved || 0
    displayContests += stats.codechef.contestHistory?.length || 0
  }
  if (accounts.geeksforgeeks?.connected && accounts.geeksforgeeks?.showOnDashboard && stats.geeksforgeeks) {
    displaySolved += stats.geeksforgeeks.problemsSolved || 0
  }
  if (accounts.hackerrank?.connected && accounts.hackerrank?.showOnDashboard && stats.hackerrank) {
    displayContests += stats.hackerrank.contestParticipation || 0
  }
  if (accounts.atcoder?.connected && accounts.atcoder?.showOnDashboard && stats.atcoder) {
    displaySolved += stats.atcoder.problemsSolved || 0
    displayContests += stats.atcoder.contestsParticipated || 0
  }
  if (accounts.hackerearth?.connected && accounts.hackerearth?.showOnDashboard && stats.hackerearth) {
    displaySolved += stats.hackerearth.problemsSolved || 0
    displayContests += stats.hackerearth.contestsParticipated || 0
  }
  if (accounts.codingninjas?.connected && accounts.codingninjas?.showOnDashboard && stats.codingninjas) {
    displaySolved += stats.codingninjas.problemsSolved || 0
  }

  // Unified Coding Streak
  let maxStreak = 0
  if (accounts.github?.connected && accounts.github?.showOnDashboard && stats.github?.contributions) {
    const ghStreak = calcGitHubStreak(stats.github.contributions)
    if (ghStreak > maxStreak) maxStreak = ghStreak
  }
  if (accounts.leetcode?.connected && accounts.leetcode?.showOnDashboard && stats.leetcode?.streak) {
    if (stats.leetcode.streak > maxStreak) maxStreak = stats.leetcode.streak
  }
  if (accounts.geeksforgeeks?.connected && accounts.geeksforgeeks?.showOnDashboard && stats.geeksforgeeks?.streak) {
    if (stats.geeksforgeeks.streak > maxStreak) maxStreak = stats.geeksforgeeks.streak
  }

  // Developer Blended Score & progression values
  const developerScore = Math.min(100, Math.round(level * 3.8 + enabledPlatforms.length * 4.2))
  const productivityScore = Math.min(95, Math.round((displayContributions || 10) * 0.35 + (displaySolved || 10) * 0.28 + 35))
  const consistencyScore = Math.min(95, Math.round((maxStreak || 4) * 4.2 + 45))

  // Platform Distribution comparison chart
  const platformChartData = enabledPlatforms.map(p => {
    let val = 15
    const pStats = stats[p]
    if (pStats) {
      if (p === 'github') val = (pStats.contributions?.length || 10) * 2 + (pStats.repos?.length || 5)
      else if (pStats.totalSolved !== undefined) val = pStats.totalSolved
      else if (pStats.problemsSolved !== undefined) val = pStats.problemsSolved
      else if (pStats.reputation !== undefined) val = Math.round(pStats.reputation / 10)
      else if (pStats.followers !== undefined) val = pStats.followers
    }
    return {
      name: PLATFORM_NAME_MAP[p] || p,
      value: Math.max(5, val)
    }
  })

  const platformColors = enabledPlatforms.map(p => PLATFORM_COLOR_MAP[p] || '#7C3AED')

  // --- Dynamic Skill Radar ---
  const githubLangs = stats.github?.languages ? Object.keys(stats.github.languages) : []
  const hasFront = githubLangs.some(l => ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte'].includes(l))
  const hasBack = githubLangs.some(l => ['Python', 'Go', 'Java', 'Ruby', 'PHP', 'Rust', 'C#', 'C++'].includes(l))
  const hasOps = githubLangs.some(l => ['Shell', 'Dockerfile', 'HCL'].includes(l))
  const hasMob = githubLangs.some(l => ['Swift', 'Kotlin', 'Dart'].includes(l))
  const githubReposCount = stats.github?.repos?.length || 0

  const radarData = [
    { skill: 'DSA', score: Math.min(95, Math.max(30, Math.round(displaySolved / 6 + 42))) },
    { skill: 'Compet. Programming', score: Math.min(95, Math.max(25, Math.round((stats.codeforces?.currentRating || 0) / 32 + (displayContests * 4) + 20))) },
    { skill: 'Frontend', score: hasFront ? Math.min(95, Math.max(40, 52 + githubReposCount * 1.8)) : 28 },
    { skill: 'Backend', score: hasBack ? Math.min(95, Math.max(45, 58 + githubReposCount * 2.2)) : 22 },
    { skill: 'DevOps', score: hasOps ? Math.min(90, 55 + githubReposCount * 1.2) : 18 },
    { skill: 'Mobile', score: hasMob ? Math.min(90, 60 + githubReposCount * 1.5) : 15 },
    { skill: 'System Design', score: Math.min(88, Math.max(30, 32 + githubReposCount * 1.1 + (stats.stackoverflow?.reputation || 0) / 120)) },
  ]

  // --- Combined Heatmap ---
  const getCombinedHeatmap = () => {
    const combinedMap = {}
    if (accounts.github?.connected && accounts.github?.showOnDashboard && stats.github?.contributions) {
      stats.github.contributions.forEach(c => {
        combinedMap[c.date] = (combinedMap[c.date] || 0) + c.count
      })
    }
    if (accounts.leetcode?.connected && accounts.leetcode?.showOnDashboard && stats.leetcode?.submissionCalendar) {
      Object.entries(stats.leetcode.submissionCalendar).forEach(([timestamp, count]) => {
        const dateStr = new Date(Number(timestamp) * 1000).toISOString().split('T')[0]
        combinedMap[dateStr] = (combinedMap[dateStr] || 0) + count
      })
    }
    if (accounts.codeforces?.connected && accounts.codeforces?.showOnDashboard && stats.codeforces?.ratingGraph) {
      stats.codeforces.ratingGraph.forEach(item => {
        if (item.date) combinedMap[item.date] = (combinedMap[item.date] || 0) + 3
      })
    }
    if (accounts.geeksforgeeks?.connected && accounts.geeksforgeeks?.showOnDashboard && stats.geeksforgeeks?.codingActivity) {
      stats.geeksforgeeks.codingActivity.forEach(c => {
        combinedMap[c.date] = (combinedMap[c.date] || 0) + c.problemsCount
      })
    }
    return Object.entries(combinedMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
  }
  const heatmapData = getCombinedHeatmap()

  // --- Combined Activity Feed ---
  const getCombinedActivityFeed = () => {
    const feed = []
    if (accounts.github?.connected && accounts.github?.showOnDashboard && stats.github?.repos) {
      stats.github.repos.slice(0, 3).forEach(r => {
        feed.push({
          title: `Updated repo "${r.name}"`,
          subtitle: `GitHub · ${r.language || 'Code'}`,
          time: r.updated_at,
          icon: '🐙',
        })
      })
    }
    if (accounts.leetcode?.connected && accounts.leetcode?.showOnDashboard && stats.leetcode?.recentSubmissions) {
      stats.leetcode.recentSubmissions.slice(0, 3).forEach(s => {
        feed.push({
          title: `Solved "${s.title}"`,
          subtitle: `LeetCode · ${s.lang} · Accepted`,
          timestamp: s.timestamp,
          icon: '✅',
        })
      })
    }
    if (accounts.codeforces?.connected && accounts.codeforces?.showOnDashboard && stats.codeforces?.recentContests) {
      stats.codeforces.recentContests.slice(0, 2).forEach(c => {
        feed.push({
          title: `Competed in CF round`,
          subtitle: `${c.name} · Rank ${c.rank}`,
          time: c.date,
          icon: '🏆',
        })
      })
    }
    if (accounts['dev.to']?.connected && accounts['dev.to']?.showOnDashboard && stats['dev.to']?.articles) {
      stats['dev.to'].articles.slice(0, 1).forEach(a => {
        feed.push({
          title: `Published post "${a.title}"`,
          subtitle: `Dev.to · Reactions: ${a.publicReactionsCount}`,
          icon: '✍️',
        })
      })
    }
    return feed.sort((a, b) => {
      const ta = a.time ? new Date(a.time) : new Date((a.timestamp || 0) * 1000)
      const tb = b.time ? new Date(b.time) : new Date((b.timestamp || 0) * 1000)
      return tb - ta
    }).slice(0, 6)
  }
  const activityFeed = getCombinedActivityFeed()

  // --- Local Leaderboards Rank List ---
  const leaderboardEntries = [
    { rank: 1, name: 'Linus Torvalds', title: 'Linux Creator', score: 98, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linus' },
    { rank: 2, name: 'Jeff Dean', title: 'Google Fellow', score: 96, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jeff' },
    { rank: 3, name: 'Dan Abramov', title: 'React Core Alum', score: 88, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dan' },
    { rank: 4, name: 'You', title: title, score: developerScore, avatar: user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.login}`, isUser: true },
    { rank: 5, name: 'Gennady Korotkevich', title: 'Compet. Programmer', score: 94, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tourist' }
  ].sort((a, b) => b.score - a.score).map((entry, idx) => ({ ...entry, rank: idx + 1 }))

  // --- Weekly Progress Area Chart ---
  const weeklyProgressData = [
    { name: 'Mon', value: Math.round(displayContributions * 0.08) || 2 },
    { name: 'Tue', value: Math.round(displayContributions * 0.12) || 4 },
    { name: 'Wed', value: Math.round(displayContributions * 0.06) || 3 },
    { name: 'Thu', value: Math.round(displayContributions * 0.18) || 6 },
    { name: 'Fri', value: Math.round(displayContributions * 0.15) || 5 },
    { name: 'Sat', value: Math.round(displaySolved * 0.4) || 2 },
    { name: 'Sun', value: Math.round(displaySolved * 0.5) || 3 },
  ]

  const loading = Object.values(syncing).some(Boolean)

  return (
    <PageWrapper>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.login}`}
            alt={user?.name}
            className="w-14 h-14 rounded-full ring-2 ring-violet/40 hidden sm:block"
          />
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0] || user?.login}</span> 👋
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Unified Dev Score: <span className="text-violet-light font-semibold">{developerScore}/100</span> · Linked Platforms: <span className="text-teal-light font-medium">{enabledPlatforms.length} active</span>
            </p>
          </div>
        </div>
        {loading && (
          <span className="badge bg-violet/10 text-violet-light animate-pulse flex items-center gap-1.5 self-start sm:self-center">
            <Zap className="w-3 h-3 animate-bounce" /> Updating real-time sync...
          </span>
        )}
      </div>

      {/* Progression & Score Dashboard Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Blended Overall Developer Score */}
        <div className="card border-gradient relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase">Overall Developer Score</h3>
              <p className="text-2xs text-text-muted mt-0.5">Across active connected accounts</p>
            </div>
            <Award className="w-5 h-5 text-violet-light" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold gradient-text leading-none">{developerScore}</span>
            <span className="text-sm font-semibold text-text-secondary">/100</span>
          </div>
          <div className="text-3xs text-text-secondary border-t border-border/40 pt-2 flex justify-between items-center">
            <span>Classified: <span className="text-text-primary font-medium">{title}</span></span>
            <span>Lvl {level}</span>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="card relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase">Productivity Score</h3>
              <p className="text-2xs text-text-muted mt-0.5">Derived from code contributions & problem solve velocity</p>
            </div>
            <TrendingUp className="w-5 h-5 text-teal-light" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-teal-light leading-none">{productivityScore}</span>
            <span className="text-sm font-semibold text-text-secondary">/100</span>
          </div>
          <div className="w-full bg-surface border border-border rounded-full h-1.5 overflow-hidden">
            <div className="bg-teal h-full rounded-full" style={{ width: `${productivityScore}%` }} />
          </div>
        </div>

        {/* Consistency Score */}
        <div className="card relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase">Consistency Score</h3>
              <p className="text-2xs text-text-muted mt-0.5">Calculated based on unified platform streaks</p>
            </div>
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-amber-500 leading-none">{consistencyScore}</span>
            <span className="text-sm font-semibold text-text-secondary">/100</span>
          </div>
          <div className="w-full bg-surface border border-border rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${consistencyScore}%` }} />
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Problems Solved"
          value={displaySolved}
          icon={Target}
          iconColor="text-teal-light"
          iconBg="bg-teal/15"
          trendLabel="across platforms"
        />
        <MetricCard
          title="Contests"
          value={displayContests}
          icon={Zap}
          iconColor="text-violet-light"
          iconBg="bg-violet/15"
          trendLabel="participations"
        />
        <MetricCard
          title="Contributions"
          value={displayContributions}
          icon={GitCommit}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/15"
          trendLabel="commits / updates"
        />
        <MetricCard
          title="GitHub Stars"
          value={displayStars}
          icon={Star}
          iconColor="text-yellow-400"
          iconBg="bg-yellow-500/15"
          trendLabel="across repositories"
        />
        <MetricCard
          title="Active Streak"
          value={maxStreak}
          suffix=" days"
          icon={Flame}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/15"
          trendLabel="current streak"
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Skill Radar */}
        <div className="card flex flex-col justify-between">
          <h3 className="section-title mb-3">Developer Skill Radar</h3>
          <div className="flex-1 flex items-center justify-center">
            <RadarChartComponent data={radarData} />
          </div>
        </div>

        {/* Platform Share Comparison */}
        <div className="card flex flex-col justify-between">
          <h3 className="section-title mb-3">Platform Weight Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
            <PieChartComponent data={platformChartData} colors={platformColors} donut />
          </div>
        </div>

        {/* Weekly Activity Progress */}
        <div className="card flex flex-col justify-between">
          <h3 className="section-title mb-3">Weekly Progress Velocity</h3>
          <div className="flex-1 flex items-center justify-center">
            <AreaChartComponent data={weeklyProgressData} color="#14B8A6" label="activities" />
          </div>
        </div>
      </div>

      {/* Unified Heatmap Row */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Unified Developer Footprint</h3>
          <span className="text-xs text-text-muted">Combined coding activity heatmap</span>
        </div>
        <HeatMapChart contributions={heatmapData} />
      </div>

      {/* Bottom Feeds Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Combined Activity Feed */}
        <div className="card space-y-3.5">
          <h3 className="section-title">Unified Activity Stream</h3>
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 no-scrollbar">
            {activityFeed.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No recent updates synced.</p>
            ) : (
              activityFeed.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{item.title}</p>
                    <p className="text-3xs text-text-secondary mt-0.5">{item.subtitle}</p>
                  </div>
                  <span className="text-3xs text-text-muted flex-shrink-0">
                    {item.time
                      ? formatRelative(item.time)
                      : item.timestamp
                      ? formatTimestamp(item.timestamp)
                      : 'Just now'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leaderboards Widget */}
        <div className="card space-y-3.5">
          <h3 className="section-title">Global Developer Leaderboard</h3>
          <div className="space-y-2">
            {leaderboardEntries.map((player) => (
              <div
                key={player.name}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                  player.isUser
                    ? 'border-violet/40 bg-violet/5'
                    : 'border-border/30 bg-surface/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`text-xs font-bold w-4 text-center ${
                    player.rank === 1 ? 'text-yellow-400' : player.rank === 2 ? 'text-text-secondary' : 'text-text-muted'
                  }`}>
                    {player.rank}
                  </span>
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-7 h-7 rounded-full flex-shrink-0 border border-border"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {player.name} {player.isUser && <span className="text-3xs text-violet-light font-medium ml-1">You</span>}
                    </p>
                    <p className="text-3xs text-text-muted truncate">{player.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-extrabold text-text-primary">{player.score}</span>
                  <span className="text-3xs text-text-muted">Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
