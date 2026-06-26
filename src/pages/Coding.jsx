import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@/components/layout/PageWrapper'
import PieChartComponent from '@/components/charts/PieChartComponent'
import BarChartComponent from '@/components/charts/BarChartComponent'
import AreaChartComponent from '@/components/charts/AreaChartComponent'
import { VerdictBadge, DifficultyBadge } from '@/components/ui/Badge'
import useConnectedAccountsStore from '@/store/connectedAccountsStore'
import { formatTimestamp } from '@/utils/formatDate'
import {
  ExternalLink,
  Trophy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Award,
  Shield,
  BookOpen,
  Target,
  CheckCircle2,
  Activity,
  Zap,
  TrendingUp,
  Star,
  Flame,
  Globe,
} from 'lucide-react'

const CODING_PLATFORMS = [
  { id: 'leetcode', name: 'LeetCode', color: '#F59E0B', iconLabel: 'LC', profilePrefix: 'https://leetcode.com/u/' },
  { id: 'codeforces', name: 'Codeforces', color: '#3B82F6', iconLabel: 'CF', profilePrefix: 'https://codeforces.com/profile/' },
  { id: 'codechef', name: 'CodeChef', color: '#92400E', iconLabel: 'CC', profilePrefix: 'https://www.codechef.com/users/' },
  { id: 'hackerrank', name: 'HackerRank', color: '#10B981', iconLabel: 'HR', profilePrefix: 'https://www.hackerrank.com/' },
  { id: 'geeksforgeeks', name: 'GeeksforGeeks', color: '#047857', iconLabel: 'GfG', profilePrefix: 'https://auth.geeksforgeeks.org/user/' },
  { id: 'atcoder', name: 'AtCoder', color: '#6B7280', iconLabel: 'AC', profilePrefix: 'https://atcoder.jp/users/' },
  { id: 'hackerearth', name: 'HackerEarth', color: '#4F46E5', iconLabel: 'HE', profilePrefix: 'https://www.hackerearth.com/@' },
  { id: 'topcoder', name: 'TopCoder', color: '#EAB308', iconLabel: 'TC', profilePrefix: 'https://www.topcoder.com/members/' },
  { id: 'codingninjas', name: 'Coding Ninjas', color: '#EF4444', iconLabel: 'CN', profilePrefix: 'https://www.codingninjas.com/codestudio/profile/' },
]

const getPlatformMetrics = (platformId, platformStats) => {
  if (!platformStats) return []

  switch (platformId) {
    case 'leetcode':
      return [
        { label: 'Total Solved', value: platformStats.totalSolved ?? 0, color: 'text-text-primary', icon: Target },
        { label: 'Easy Solved', value: platformStats.easySolved ?? 0, color: 'text-success', icon: CheckCircle2 },
        { label: 'Medium Solved', value: platformStats.mediumSolved ?? 0, color: 'text-warning', icon: Activity },
        { label: 'Hard Solved', value: platformStats.hardSolved ?? 0, color: 'text-danger', icon: Zap },
      ]
    case 'codeforces':
      return [
        { label: 'Current Rating', value: platformStats.currentRating ?? 0, color: 'text-violet-light', icon: TrendingUp },
        { label: 'Max Rating', value: platformStats.maxRating ?? 0, color: 'text-text-primary', icon: Trophy },
        { label: 'Problems Solved', value: platformStats.problemsSolved ?? 0, color: 'text-success', icon: Target },
        { label: 'Contests', value: platformStats.contestsParticipated ?? 0, color: 'text-teal-light', icon: Zap },
      ]
    case 'codechef':
      return [
        { label: 'Current Rating', value: platformStats.currentRating ?? 0, color: 'text-violet-light', icon: TrendingUp },
        { label: 'Highest Rating', value: platformStats.highestRating ?? 0, color: 'text-text-primary', icon: Trophy },
        { label: 'Star Rating', value: platformStats.stars || '1★', color: 'text-warning', icon: Star },
        { label: 'Problems Solved', value: platformStats.problemsSolved ?? 0, color: 'text-success', icon: Target },
      ]
    case 'hackerrank':
      return [
        { label: 'HR Stars', value: `${platformStats.stars ?? 0}★`, color: 'text-warning', icon: Star },
        { label: 'Certs Earned', value: platformStats.certifications?.length ?? 0, color: 'text-violet-light', icon: BookOpen },
        { label: 'Badges Unlocked', value: platformStats.skillBadges?.length ?? 0, color: 'text-teal-light', icon: Award },
        { label: 'Contests Played', value: platformStats.contestParticipation ?? 0, color: 'text-success', icon: Zap },
      ]
    case 'geeksforgeeks':
      return [
        { label: 'Coding Score', value: platformStats.codingScore ?? 0, color: 'text-violet-light', icon: Award },
        { label: 'Problems Solved', value: platformStats.problemsSolved ?? 0, color: 'text-success', icon: Target },
        { label: 'Active Streak', value: `${platformStats.streak ?? 0} days`, color: 'text-orange-400', icon: Flame },
        { label: 'Overall Rank', value: platformStats.overallRank ?? 'N/A', color: 'text-text-primary', icon: Globe },
      ]
    case 'atcoder':
      return [
        { label: 'Current Rating', value: platformStats.currentRating ?? 0, color: 'text-violet-light', icon: TrendingUp },
        { label: 'Max Rating', value: platformStats.maxRating ?? 0, color: 'text-text-primary', icon: Trophy },
        { label: 'Problems Solved', value: platformStats.problemsSolved ?? 0, color: 'text-success', icon: Target },
        { label: 'Contests Played', value: platformStats.contestsParticipated ?? 0, color: 'text-teal-light', icon: Zap },
      ]
    case 'hackerearth':
      return [
        { label: 'Current Rating', value: platformStats.currentRating ?? 0, color: 'text-violet-light', icon: TrendingUp },
        { label: 'Max Rating', value: platformStats.maxRating ?? 0, color: 'text-text-primary', icon: Trophy },
        { label: 'Problems Solved', value: platformStats.problemsSolved ?? 0, color: 'text-success', icon: Target },
        { label: 'Skill Score', value: `${platformStats.skillScore ?? 0}%`, color: 'text-teal-light', icon: Activity },
      ]
    case 'topcoder':
      return [
        { label: 'Rating', value: platformStats.rating ?? 0, color: 'text-violet-light', icon: TrendingUp },
        { label: 'Max Rating', value: platformStats.maxRating ?? 0, color: 'text-text-primary', icon: Trophy },
        { label: 'Rank Class', value: platformStats.rank || 'N/A', color: 'text-teal-light', icon: Shield },
        { label: 'Volatility', value: platformStats.volatility ?? 0, color: 'text-success', icon: Activity },
      ]
    case 'codingninjas':
      return [
        { label: 'Ninja Points', value: platformStats.ninjaPoints ?? 0, color: 'text-violet-light', icon: Award },
        { label: 'Ninja Level', value: `Lvl ${platformStats.ninjaLevel ?? 0}`, color: 'text-text-primary', icon: TrendingUp },
        { label: 'Belt Color', value: platformStats.belt || 'White', color: 'text-teal-light', icon: Shield },
        { label: 'Problems Solved', value: platformStats.problemsSolved ?? 0, color: 'text-success', icon: Target },
      ]
    default:
      return []
  }
}

const getRatingChartData = (platformId, platformStats) => {
  if (!platformStats) return []

  switch (platformId) {
    case 'codeforces':
      return (platformStats.ratingGraph || []).map(r => ({
        name: r.contestName ? r.contestName.substring(0, 12) + '...' : r.date,
        Rating: r.newRating || 0,
      }))
    case 'atcoder':
      return (platformStats.ratingHistory || []).map(r => ({
        name: r.contest || '',
        Rating: r.rating || 0,
      }))
    case 'codechef':
      return [...(platformStats.contestHistory || [])].reverse().map(r => ({
        name: r.name ? r.name.substring(0, 12) + '...' : r.date,
        Rating: r.rating || 0,
      }))
    case 'topcoder':
      return [...(platformStats.recentContests || [])].reverse().map((r) => ({
        name: r.name || '',
        Rating: (platformStats.rating || 1200) + (r.ratingChange || 0),
      }))
    default:
      return []
  }
}

export default function Coding() {
  const { accounts, stats, syncing, syncAccount } = useConnectedAccountsStore()
  const [selectedPlatform, setSelectedPlatform] = useState('leetcode')
  const [expanded, setExpanded] = useState(false)

  const codingPlatforms = CODING_PLATFORMS.filter(p => accounts[p.id]?.connected)

  // Auto-select first connected platform if leetcode is not connected
  useEffect(() => {
    if (codingPlatforms.length > 0) {
      const hasLeetCode = codingPlatforms.some(p => p.id === 'leetcode')
      if (!hasLeetCode && !accounts[selectedPlatform]?.connected) {
        setSelectedPlatform(codingPlatforms[0].id)
      }
    }
  }, [accounts, codingPlatforms, selectedPlatform])

  // Sync selected platform on change/mount
  const isConnected = accounts[selectedPlatform]?.connected
  useEffect(() => {
    if (selectedPlatform && isConnected) {
      syncAccount(selectedPlatform)
    }
  }, [selectedPlatform, syncAccount, isConnected])

  if (codingPlatforms.length === 0) {
    return (
      <PageWrapper>
        <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 bg-card/20 border border-border/40 rounded-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet-light mb-4 shadow-lg glow-violet">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">No Coding Profiles Connected</h2>
          <p className="text-sm text-text-secondary max-w-sm mt-2 mb-6">
            Unlock unified algorithmic statistics. Connect your accounts for LeetCode, Codeforces, HackerRank, GeeksforGeeks, and others in Settings.
          </p>
          <a href="/settings" className="btn-primary flex items-center gap-2">
            Configure Connected Accounts
          </a>
        </div>
      </PageWrapper>
    )
  }

  const activePlatformObj = CODING_PLATFORMS.find(p => p.id === selectedPlatform) || CODING_PLATFORMS[0]
  const account = accounts[selectedPlatform] || { connected: false }
  const platformStats = stats[selectedPlatform]
  const isSyncing = syncing[selectedPlatform]
  const error = account.error
  const metrics = getPlatformMetrics(selectedPlatform, platformStats)

  const handleSync = async () => {
    if (isSyncing) return
    await syncAccount(selectedPlatform, true)
  }

  const renderExpandedDetails = () => {
    if (!platformStats) return null

    switch (selectedPlatform) {
      case 'leetcode': {
        const donutData = [
          { name: 'Easy', value: platformStats.easySolved || 0 },
          { name: 'Medium', value: platformStats.mediumSolved || 0 },
          { name: 'Hard', value: platformStats.hardSolved || 0 },
        ]
        const topicData = (platformStats.topicStats || [])
          .sort((a, b) => b.solved - a.solved)
          .slice(0, 8)
          .map((t) => ({
            name: t.topic,
            value: t.solved,
          }))

        return (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Donut chart difficulty */}
              <div className="card space-y-3 bg-card/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="section-title text-sm">Problems by Difficulty</h3>
                  {platformStats.totalEasy && (
                    <span className="text-xs text-text-muted">
                      {Math.round((platformStats.totalSolved / (platformStats.totalEasy + platformStats.totalMedium + platformStats.totalHard)) * 100)}% solved
                    </span>
                  )}
                </div>
                <PieChartComponent
                  data={donutData}
                  colors={['#22C55E', '#F59E0B', '#EF4444']}
                  donut
                />
                <div className="grid grid-cols-3 gap-2 text-center border-t border-border/40 pt-3">
                  <div><p className="text-sm font-bold text-success">{platformStats.easySolved}</p><p className="text-2xs text-text-muted">Easy</p></div>
                  <div><p className="text-sm font-bold text-warning">{platformStats.mediumSolved}</p><p className="text-2xs text-text-muted">Medium</p></div>
                  <div><p className="text-sm font-bold text-danger">{platformStats.hardSolved}</p><p className="text-2xs text-text-muted">Hard</p></div>
                </div>
              </div>

              {/* Topic coverage */}
              <div className="card space-y-3 bg-card/30 border border-border/50">
                <h3 className="section-title text-sm">Topic Coverage</h3>
                <BarChartComponent
                  data={topicData}
                  dataKey="value"
                  xKey="name"
                  label="solved"
                  horizontal={true}
                />
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="card space-y-3 bg-card/30 border border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="section-title text-sm">Recent Submissions</h3>
                {platformStats.acceptanceRate && (
                  <span className="text-xs text-text-muted">{platformStats.acceptanceRate}% acceptance rate</span>
                )}
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {!platformStats.recentSubmissions || platformStats.recentSubmissions.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No recent submissions found.</p>
                ) : (
                  platformStats.recentSubmissions.map((sub, i) => (
                    <motion.div
                      key={sub.id || i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="flex items-center gap-3 py-2 px-3 bg-surface/40 hover:bg-surface/75 rounded-lg border border-border/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://leetcode.com/problems/${sub.titleSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-text-primary hover:text-violet-light transition-colors truncate block"
                        >
                          {sub.title}
                        </a>
                        <p className="text-2xs text-text-muted mt-0.5">{sub.lang} · {formatTimestamp(sub.timestamp)}</p>
                      </div>
                      <DifficultyBadge difficulty={sub.difficulty || 'Medium'} />
                      <VerdictBadge verdict={sub.statusDisplay || 'Accepted'} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      }

      case 'codeforces':
      case 'atcoder':
      case 'codechef':
      case 'topcoder': {
        const ratingData = getRatingChartData(selectedPlatform, platformStats)
        const color = activePlatformObj.color
        const contestsList = platformStats.contestHistory || platformStats.recentContests || []

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {/* Rating history chart & breakdown */}
            <div className="space-y-4">
              <div className="card space-y-3 bg-card/30 border border-border/50">
                <h3 className="section-title text-sm">Rating History Chart</h3>
                {ratingData.length > 0 ? (
                  <div className="pt-2">
                    <AreaChartComponent
                      data={ratingData}
                      dataKey="Rating"
                      xKey="name"
                      color={color}
                      label="Rating"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-8">No rating history available.</p>
                )}
              </div>

              {/* Detail Profile Specs */}
              <div className="card bg-card/30 border border-border/50 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Profile Specifications</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-3xs">Platform Rank</p>
                    <p className="text-sm font-bold text-text-primary mt-0.5 capitalize">{platformStats.rank || 'N/A'}</p>
                  </div>
                  {platformStats.maxRank && (
                    <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                      <p className="text-text-secondary text-3xs">Peak Rank</p>
                      <p className="text-sm font-bold text-text-primary mt-0.5 capitalize">{platformStats.maxRank}</p>
                    </div>
                  )}
                  {platformStats.globalRank !== undefined && (
                    <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                      <p className="text-text-secondary text-3xs">Global Rank</p>
                      <p className="text-sm font-bold text-text-primary mt-0.5">#{platformStats.globalRank.toLocaleString()}</p>
                    </div>
                  )}
                  {platformStats.countryRank !== undefined && (
                    <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                      <p className="text-text-secondary text-3xs">Country Rank</p>
                      <p className="text-sm font-bold text-text-primary mt-0.5">#{platformStats.countryRank.toLocaleString()}</p>
                    </div>
                  )}
                  {platformStats.volatility !== undefined && (
                    <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                      <p className="text-text-secondary text-3xs">Volatility</p>
                      <p className="text-sm font-bold text-text-primary mt-0.5">{platformStats.volatility}</p>
                    </div>
                  )}
                  <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-3xs">Contests Played</p>
                    <p className="text-sm font-bold text-text-primary mt-0.5">{platformStats.contestsParticipated || contestsList.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Contests list */}
            <div className="card space-y-3 bg-card/30 border border-border/50">
              <h3 className="section-title text-sm">Contest Placements</h3>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {contestsList.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No recent contests found.</p>
                ) : (
                  contestsList.map((contest, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="flex items-center justify-between p-3 bg-surface/40 hover:bg-surface/75 border border-border/20 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 mr-3">
                        <p className="text-sm font-medium text-text-primary truncate">{contest.name || contest.contestName || `Round #${contest.contestId}`}</p>
                        <p className="text-3xs text-text-secondary mt-0.5">
                          {contest.date || 'Contest Date'} · Rank: <span className="font-semibold text-text-primary">{contest.rank || contest.placement || 'N/A'}</span>
                        </p>
                      </div>
                      {contest.ratingChange !== undefined && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          contest.ratingChange >= 0
                            ? 'bg-success/15 text-success'
                            : 'bg-danger/15 text-danger'
                        }`}>
                          {contest.ratingChange >= 0 ? `+${contest.ratingChange}` : contest.ratingChange}
                        </span>
                      )}
                      {contest.rating !== undefined && contest.ratingChange === undefined && (
                        <span className="text-xs font-bold text-violet-light bg-violet/10 px-2 py-0.5 rounded-md">
                          Rating: {contest.rating}
                        </span>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      }

      case 'hackerrank': {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {/* Skill Badges */}
            <div className="card space-y-3 bg-card/30 border border-border/50">
              <h3 className="section-title text-sm">Skill Badges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {!platformStats.skillBadges || platformStats.skillBadges.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No skill badges found.</p>
                ) : (
                  platformStats.skillBadges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-surface/50 p-2.5 border border-border/30 rounded-lg">
                      <span className="text-2xl">{badge.icon || '🏅'}</span>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{badge.name}</p>
                        <p className="text-3xs text-warning mt-0.5 font-medium">{'★'.repeat(badge.stars || 5)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <div className="card space-y-3 bg-card/30 border border-border/50">
                <h3 className="section-title text-sm font-semibold">Certifications</h3>
                <div className="space-y-2">
                  {!platformStats.certifications || platformStats.certifications.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-4">No certifications earned yet.</p>
                  ) : (
                    platformStats.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-2 py-2 px-3 bg-surface/40 border border-border/20 rounded-lg text-xs font-semibold text-text-primary">
                        <span className="text-emerald-400">✓</span>
                        <span>{cert}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card bg-card/30 border border-border/50 p-4">
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">HackerRank Overview</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Competency assessment level: <span className="font-semibold text-violet-light">{platformStats.problemSolvingLevel || 'Expert'}</span>.
                  Successfully competed in {platformStats.contestParticipation || 0} monthly code contests.
                </p>
              </div>
            </div>
          </div>
        )
      }

      case 'geeksforgeeks': {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {/* Unlocked Badges */}
            <div className="card space-y-3 bg-card/30 border border-border/50">
              <h3 className="section-title text-sm">Achievements & Badges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {!platformStats.badges || platformStats.badges.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No badges unlocked yet.</p>
                ) : (
                  platformStats.badges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-surface/50 p-2.5 border border-border/30 rounded-lg">
                      <span className="text-xl">{badge.icon || '🏅'}</span>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{badge.name}</p>
                        <p className="text-3xs text-violet-light mt-0.5 font-medium">{badge.tier || 'Gold'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="space-y-4">
              <div className="card bg-card/30 border border-border/50 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Institution Standings</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-3xs">Institute Rank</p>
                    <p className="text-base font-bold text-teal-light mt-0.5">#{platformStats.instituteRank || 1}</p>
                  </div>
                  <div className="bg-surface/40 p-2.5 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-3xs">Overall Rank</p>
                    <p className="text-base font-bold text-text-primary mt-0.5">#{platformStats.overallRank || 100}</p>
                  </div>
                </div>
              </div>

              <div className="card bg-card/30 border border-border/50 p-4">
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">Platform Overview</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Generated a coding score of <span className="font-semibold text-violet-light">{platformStats.codingScore || 0}</span> with {platformStats.problemsSolved || 0} coding challenges solved on GeeksforGeeks.
                  Maintained an active streak of {platformStats.streak || 0} consecutive coding days.
                </p>
              </div>
            </div>
          </div>
        )
      }

      case 'hackerearth':
      case 'codingninjas': {
        return (
          <div className="card space-y-3 bg-card/30 border border-border/50 pt-1">
            <h3 className="section-title text-sm">Advanced Analytical Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedPlatform === 'hackerearth' ? (
                <>
                  <div className="bg-surface/40 p-3 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-2xs">Skill Rating</p>
                    <p className="text-lg font-bold text-text-primary mt-1">{platformStats.currentRating || 0}</p>
                    <p className="text-3xs text-text-muted mt-0.5">Max Rating: {platformStats.maxRating || 0}</p>
                  </div>
                  <div className="bg-surface/40 p-3 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-2xs">Skill Score Percentile</p>
                    <p className="text-lg font-bold text-teal-light mt-1">{platformStats.skillScore || 0}%</p>
                  </div>
                  <div className="bg-surface/40 p-3 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-2xs font-semibold">Contests Competed</p>
                    <p className="text-lg font-bold text-violet-light mt-1">{platformStats.contestsParticipated || 0}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-surface/40 p-3 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-2xs">Ninja Level Rank</p>
                    <p className="text-lg font-bold text-text-primary mt-1">Level {platformStats.ninjaLevel || 0}</p>
                  </div>
                  <div className="bg-surface/40 p-3 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-2xs">Ninja Points Earned</p>
                    <p className="text-lg font-bold text-violet-light mt-1">{platformStats.ninjaPoints || 0}</p>
                  </div>
                  <div className="bg-surface/40 p-3 rounded-lg border border-border/30">
                    <p className="text-text-secondary text-2xs font-semibold">Belt Class</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1 capitalize">{platformStats.belt || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <PageWrapper>
      {/* Top Tabs Selector */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-border/40">
        {codingPlatforms.map((p) => {
          const isActive = selectedPlatform === p.id
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPlatform(p.id)
                setExpanded(false) // collapse details when swapping platform
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-violet/15 text-violet-light border border-violet/30 shadow-md shadow-violet/5'
                  : 'bg-card/30 text-text-secondary hover:text-text-primary border border-border/40 hover:bg-card/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          )
        })}
      </div>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activePlatformObj.color }}
            />
            {activePlatformObj.name} Stats
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">@{account.username}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Manually Sync button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-ghost p-2 text-text-secondary hover:text-text-primary border border-border/60 hover:bg-white/5 rounded-xl transition-all disabled:opacity-30 flex items-center gap-1.5 text-xs font-medium"
            title="Sync data now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-violet-light' : ''}`} />
            Sync
          </button>

          {!isSyncing && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              platformStats?._isReal
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}>
              {platformStats?._isReal ? '● Live' : '● Demo data'}
            </span>
          )}

          <a
            href={`${activePlatformObj.profilePrefix}${account.username}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost flex items-center gap-1.5 text-xs border border-border/60 hover:bg-white/5 px-2.5 py-1.5 rounded-xl font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Profile
          </a>
        </div>
      </div>

      {/* Sync Error Notice */}
      {!isSyncing && error && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Could not sync live stats: <span className="font-mono">{error}</span>. Displaying cached/demo backup.</span>
        </div>
      )}

      {/* High-level Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isSyncing && !platformStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))
          : metrics.map(({ label, value, color, icon: Icon }) => (
              <div
                key={label}
                className="card text-center flex flex-col justify-center items-center py-4 bg-card/40 border border-border/50 hover:border-border-light transition-all duration-150"
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <p className={`text-2xl font-bold mt-1.5 ${color}`}>{value}</p>
                <p className="text-xs text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
      </div>

      {/* Details Expander Toggle */}
      {platformStats && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-ghost flex items-center justify-center gap-2 border border-border/60 hover:border-violet-light/50 w-full py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-light/5 transition-all text-text-secondary hover:text-violet-light shadow-sm"
        >
          {expanded ? (
            <>Collapse Detailed Analytics <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Expand Detailed Analytics <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}

      {/* Expanded detailed visualizations */}
      <AnimatePresence>
        {expanded && platformStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-4"
          >
            {renderExpandedDetails()}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
