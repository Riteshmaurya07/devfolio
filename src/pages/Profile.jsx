import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star,
  GitFork,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Building,
  FileText,
  Award,
  Zap,
  Cpu,
  Bookmark,
  Calendar
} from 'lucide-react'
import RadarChartComponent from '@/components/charts/RadarChartComponent'
import { LangBadge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { useGitHub } from '@/hooks/useGitHub'
import useAuthStore from '@/store/authStore'
import useConnectedAccountsStore from '@/store/connectedAccountsStore'
import { platformStatsService } from '@/utils/platformStatsService'
import { generateMockStats } from '@/utils/mockStatsGenerator'
import { calcGitHubStreak } from '@/utils/calcStreak'
import toast from 'react-hot-toast'

const PLATFORM_ICONS = {
  github: '🐙',
  leetcode: '💡',
  codeforces: '🏆',
  codechef: '🍳',
  hackerrank: '🟢',
  geeksforgeeks: '🌳',
  atcoder: '☯️',
  hackerearth: '⚡',
  linkedin: '💼',
  stackoverflow: 'SO',
  'dev.to': 'dt',
  hashnode: 'hn',
  kaggle: 'kg',
  topcoder: 'tc',
  codolio: 'co',
  codingninjas: 'cn',
}

const PLATFORM_COLORS = {
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

export default function Profile() {
  const { username } = useParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const store = useConnectedAccountsStore()
  const printRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [copied, setCopied] = useState(false)

  // Progression metrics for display
  const [progression, setProgression] = useState({
    xp: 0,
    level: 1,
    title: 'Novice Developer',
    badges: [],
  })

  // Connected accounts visibility mappings
  const [activeProfiles, setActiveProfiles] = useState([])

  useEffect(() => {
    if (!username) return
    document.title = `${username} — Developer Portfolio`

    const loadProfileData = async () => {
      setLoading(true)
      try {
        // Parse Query Params to support cross-device viewing
        const searchParams = new URLSearchParams(location.search)
        const paramsAccounts = {}
        let hasParams = false

        searchParams.forEach((value, key) => {
          if (value) {
            paramsAccounts[key] = value
            hasParams = true
          }
        })

        // 1. Viewing OWN profile from local storage
        if (!hasParams && user?.login === username) {
          const connected = Object.keys(store.accounts).filter(
            (k) => store.accounts[k].connected && store.accounts[k].showOnDashboard
          )

          // Trigger sync for connected platforms that are missing stats
          connected.forEach((plat) => {
            if (!store.stats[plat]) {
              store.syncAccount(plat)
            }
          })

          const list = []
          for (const plat of connected) {
            const acc = store.accounts[plat]
            const pStats = store.stats[plat]
            if (acc && pStats) {
              list.push({ platform: plat, username: acc.username, stats: pStats })
            }
          }

          const fallbackGitHub = {
            profile: {
              avatar_url: user?.avatar_url,
              login: user?.login,
              name: user?.name || user?.login,
              bio: user?.bio || 'Developer',
              company: user?.company,
              location: user?.location,
              html_url: user?.html_url || `https://github.com/${user?.login}`,
              public_repos: user?.public_repos || 0,
              followers: user?.followers || 0,
              following: user?.following || 0,
            },
            repos: [],
            languages: {},
          }

          setProfileData({
            github: store.stats.github || fallbackGitHub,
            leetcode: store.stats.leetcode || null,
            codeforces: store.stats.codeforces || null,
          })
          setProgression({
            xp: store.xp,
            level: store.level,
            title: store.title,
            badges: store.badges,
          })
          setActiveProfiles(list)
          setLoading(false)
          return
        }

        // 2. Viewing other profiles (or own from query params)
        // If query parameters exist, fetch/generate them. If not, simulate based on GitHub username
        const accountsToFetch = hasParams
          ? paramsAccounts
          : {
              github: username,
              leetcode: username,
              codeforces: username,
              linkedin: username,
            }

        const fetchPromises = Object.entries(accountsToFetch).map(async ([platId, handle]) => {
          const data = await platformStatsService.fetchAllPlatformStats(platId, handle)
          return { platform: platId, username: handle, stats: data }
        })

        const resolvedProfiles = await Promise.all(fetchPromises)

        // Find GitHub data to fill user details
        const githubProfile = resolvedProfiles.find((p) => p.platform === 'github')?.stats
        const finalGitHub = githubProfile || generateMockStats('github', username)

        // Blended progression metrics for other profiles
        let xp = 0
        let displaySolved = 0
        let displayContests = 0
        let displayCommits = 0
        let displayStars = 0
        let displayContributions = 0

        resolvedProfiles.forEach(({ platform, stats: pStats }) => {
          if (!pStats) return
          const platLower = platform.toLowerCase()

          if (platLower === 'github') {
            const stars = (pStats.repos || []).reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
            const commits = (pStats.events || []).filter(e => e.type === 'PushEvent')
              .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0) || 45
            const contributions = pStats.contributions?.reduce((sum, c) => sum + c.count, 0) || commits

            displayStars += stars
            displayCommits += commits
            displayContributions += contributions
            xp += contributions * 12
            xp += stars * 45
          } else if (platLower === 'leetcode') {
            displaySolved += pStats.totalSolved || 0
            xp += (pStats.easySolved || 0) * 10
            xp += (pStats.mediumSolved || 0) * 25
            xp += (pStats.hardSolved || 0) * 50
          } else if (platLower === 'codeforces') {
            displaySolved += pStats.problemsSolved || 0
            displayContests += pStats.contestsParticipated || 0
            xp += (pStats.problemsSolved || 0) * 18
            xp += (pStats.currentRating || 0) * 2
          } else if (pStats.problemsSolved !== undefined) {
            displaySolved += pStats.problemsSolved
            xp += pStats.problemsSolved * 12
          }
        })

        const level = Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1)
        let title = 'Novice Developer'
        if (level >= 25) title = 'Legendary Arch-Mage'
        else if (level >= 18) title = 'Systems Architect'
        else if (level >= 12) title = 'Senior Engineer'
        else if (level >= 6) title = 'Apprentice Coder'

        const badges = []
        if (displayContributions >= 100) badges.push({ id: 'commit-master', name: 'Commit Master', description: 'Unlocked 100+ GitHub contributions', icon: '⚡', tier: 'Gold' })
        if (displayStars >= 10) badges.push({ id: 'star-hunter', name: 'Star Hunter', description: 'Earned 10+ GitHub stars', icon: '⭐', tier: 'Silver' })
        if (displaySolved >= 150) badges.push({ id: 'algo-master', name: 'Algorithm Master', description: 'Solved 150+ coding problems', icon: '🧠', tier: 'Gold' })
        if (displayContests >= 5) badges.push({ id: 'contest-warrior', name: 'Contest Warrior', description: 'Competed in 5+ contests', icon: '⚔️', tier: 'Silver' })
        badges.push({ id: 'first-link', name: 'First Link', description: 'Connected your first coding profile', icon: '🔗', tier: 'Bronze' })

        setProfileData({
          github: finalGitHub,
          leetcode: resolvedProfiles.find((p) => p.platform === 'leetcode')?.stats,
          codeforces: resolvedProfiles.find((p) => p.platform === 'codeforces')?.stats,
        })
        setProgression({ xp: Math.round(xp), level, title, badges })
        setActiveProfiles(resolvedProfiles)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        toast.error('Error loading portfolio metrics.')
        setLoading(false)
      }
    }

    loadProfileData()
  }, [username, location.search, user?.login, store.accounts, store.stats])

  // Generate share link
  const handleCopyLink = () => {
    let url = window.location.origin + `/profile/${username}`
    if (user?.login === username) {
      // Append query parameters of connected profiles for others to see them
      const params = []
      Object.entries(store.accounts).forEach(([platId, acc]) => {
        if (acc.connected && acc.username && acc.showOnDashboard) {
          params.push(`${platId}=${encodeURIComponent(acc.username)}`)
        }
      })
      if (params.length > 0) {
        url = `${url}?${params.join('&')}`
      }
    } else {
      // Keep existing URL if copy on someone else's page
      url = window.location.href
    }

    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Portfolio shareable link copied! 🔗')
    setTimeout(() => setCopied(false), 2000)
  }

  // Print PDF Trigger
  const handleExportPDF = () => {
    window.print()
  }

  if (loading || !profileData || !profileData.github) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-4xl mx-auto space-y-4">
        <SkeletonCard height="h-48" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard height="h-32" />
          <SkeletonCard height="h-32" />
        </div>
        <SkeletonCard height="h-64" />
      </div>
    )
  }

  const { profile = {}, repos = [], languages = {} } = profileData.github
  const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3)
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
  const topLangs = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l)

  // Skill Radar variables
  const hasFront = topLangs.some(l => ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte'].includes(l))
  const hasBack = topLangs.some(l => ['Python', 'Go', 'Java', 'Ruby', 'PHP', 'Rust', 'C#', 'C++'].includes(l))
  const reposCount = repos.length || 0

  const dsaSolved = activeProfiles.reduce((sum, p) => {
    if (p.stats?.totalSolved !== undefined) return sum + p.stats.totalSolved
    if (p.stats?.problemsSolved !== undefined) return sum + p.stats.problemsSolved
    return sum
  }, 0)

  const contestCount = activeProfiles.reduce((sum, p) => {
    if (p.stats?.contestsParticipated !== undefined) return sum + p.stats.contestsParticipated
    if (p.stats?.contestHistory?.length !== undefined) return sum + p.stats.contestHistory.length
    return sum
  }, 0)

  const cfStats = activeProfiles.find(p => p.platform === 'codeforces')?.stats
  const cfMaxRating = cfStats?.maxRating || 0

  const radarData = [
    { skill: 'DSA', score: Math.min(95, Math.max(30, Math.round(dsaSolved / 6 + 40))) },
    { skill: 'Compet. Programming', score: Math.min(95, Math.max(25, Math.round(cfMaxRating / 32 + (contestCount * 4) + 20))) },
    { skill: 'Frontend', score: hasFront ? Math.min(95, Math.max(40, 50 + reposCount * 1.8)) : 28 },
    { skill: 'Backend', score: hasBack ? Math.min(95, Math.max(45, 55 + reposCount * 2.2)) : 22 },
    { skill: 'System Design', score: Math.min(88, Math.max(30, 30 + reposCount * 1.2)) },
  ]

  // Dynamic activity feed compilation
  const activityTimeline = []
  activeProfiles.forEach(p => {
    if (p.platform === 'github' && p.stats?.repos) {
      p.stats.repos.slice(0, 2).forEach(r => {
        activityTimeline.push({
          title: `Updated repository "${r.name}"`,
          desc: `GitHub · ${r.language || 'Code'}`,
          date: r.updated_at,
          icon: '🐙'
        })
      })
    } else if (p.platform === 'leetcode' && p.stats?.recentSubmissions) {
      p.stats.recentSubmissions.slice(0, 2).forEach(s => {
        activityTimeline.push({
          title: `Solved algorithm "${s.title}"`,
          desc: `LeetCode · ${s.lang}`,
          date: new Date(s.timestamp * 1000).toISOString(),
          icon: '✅'
        })
      })
    } else if (p.platform === 'codeforces' && p.stats?.recentContests) {
      p.stats.recentContests.slice(0, 1).forEach(c => {
        activityTimeline.push({
          title: `Participated in CF Round`,
          desc: `${c.contestName} · Rank ${c.rank}`,
          date: c.date,
          icon: '🏆'
        })
      })
    }
  })

  const sortedTimeline = activityTimeline.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  return (
    <div className="min-h-screen bg-bg py-8 px-4 print:py-0 print:px-0" ref={printRef}>
      {/* Printable Area Wrapper */}
      <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative card border-gradient overflow-hidden print:border-border print:bg-white print:text-black"
        >
          {/* Gradients background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 print:hidden" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 print:hidden" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={profile.avatar_url}
              alt={profile.login}
              className="w-24 h-24 rounded-2xl ring-2 ring-violet/40 flex-shrink-0 print:ring-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-text-primary print:text-black">{profile.name || profile.login}</h1>
              <p className="text-text-secondary text-sm mb-2 print:text-gray-500">@{profile.login}</p>
              {profile.bio && <p className="text-sm text-text-secondary mb-3 print:text-gray-700">{profile.bio}</p>}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-text-muted print:text-gray-500">
                {profile.company && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{profile.company}</span>}
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>}
              </div>
            </div>

            {/* Sharing / PDF Export (Hidden in Print) */}
            <div className="flex flex-col gap-2 no-print">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:border-violet/40 hover:text-text-primary transition-all bg-surface/50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Share Portfolio'}
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:border-violet/40 hover:text-text-primary transition-all bg-surface/50"
              >
                <FileText className="w-3.5 h-3.5" /> Export PDF
              </button>
              <a
                href={profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:border-violet/40 hover:text-text-primary transition-all bg-surface/50"
              >
                <ExternalLink className="w-3.5 h-3.5" /> GitHub Profile
              </a>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-border print:border-gray-200">
            <div className="text-center">
              <p className="text-lg font-extrabold text-yellow-400 print:text-yellow-600">{totalStars.toLocaleString()}</p>
              <p className="text-3xs text-text-muted uppercase">GitHub Stars</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-teal-light print:text-teal-700">{dsaSolved}</p>
              <p className="text-3xs text-text-muted uppercase">DSA Solved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-violet-light print:text-violet-700">{progression.xp.toLocaleString()}</p>
              <p className="text-3xs text-text-muted uppercase">Developer XP</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold gradient-text print:text-purple-700">Lvl {progression.level}</p>
              <p className="text-3xs text-text-muted uppercase">Coder Level</p>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Details layout columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
          {/* LEFT COLUMN: Skill scoring details */}
          <div className="space-y-6 print:space-y-4">
            {/* Level & XP Progression */}
            <div className="card space-y-3.5 print:bg-white print:border-gray-200 print:text-black">
              <h3 className="section-title flex items-center gap-2 print:text-black">
                <Award className="w-4 h-4 text-violet-light print:text-violet-700" /> Coder Rank & Titles
              </h3>
              <div className="bg-surface/50 border border-border/40 rounded-xl p-3.5 print:bg-gray-50 print:border-gray-200">
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider print:text-gray-500">Title Classification</p>
                <p className="text-sm font-bold text-text-primary mt-1 print:text-black">{progression.title}</p>
                <p className="text-3xs text-text-secondary mt-1 print:text-gray-600">
                  XP gained acrossconnected profiles: <span className="font-semibold text-text-primary print:text-black">{progression.xp.toLocaleString()}</span>
                </p>

                {/* Bar */}
                <div className="w-full bg-surface border border-border rounded-full h-2 mt-3.5 overflow-hidden print:bg-gray-200 print:border-gray-300">
                  <div className="bg-gradient-to-r from-violet to-teal h-full rounded-full" style={{ width: `${Math.min(100, (progression.xp % 100))}%` }} />
                </div>
              </div>
            </div>

            {/* Dynamic Skill Radar chart */}
            <div className="card space-y-3.5 print:bg-white print:border-gray-200">
              <h3 className="section-title print:text-black">Blended Skill Matrix</h3>
              <div className="flex justify-center items-center py-2">
                <RadarChartComponent data={radarData} />
              </div>
            </div>

            {/* Badges Shelf */}
            <div className="card space-y-3.5 print:bg-white print:border-gray-200">
              <h3 className="section-title print:text-black">Developer Achievements</h3>
              <div className="flex flex-wrap gap-2.5">
                {progression.badges.length === 0 ? (
                  <p className="text-2xs text-text-muted">No badges unlocked yet.</p>
                ) : (
                  progression.badges.map(b => (
                    <div
                      key={b.id}
                      className="badge bg-surface border border-border px-2.5 py-1.5 flex items-center gap-2 rounded-xl print:bg-gray-50 print:border-gray-200"
                    >
                      <span className="text-base">{b.icon}</span>
                      <div>
                        <p className="text-3xs font-bold text-text-primary leading-tight print:text-black">{b.name}</p>
                        <p className="text-4xs text-text-muted mt-0.5 leading-none print:text-gray-500">{b.tier}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Connected platforms & stats list */}
          <div className="space-y-6 print:space-y-4">
            {/* Connected platforms card badges */}
            <div className="card space-y-3.5 print:bg-white print:border-gray-200">
              <h3 className="section-title print:text-black">Verified Developer Profiles</h3>
              <div className="space-y-2.5">
                {activeProfiles.length === 0 ? (
                  <p className="text-2xs text-text-muted">No external accounts shared on this dashboard.</p>
                ) : (
                  activeProfiles.map(({ platform, username, stats: pStats }) => {
                    if (!pStats) return null
                    const pColor = PLATFORM_COLORS[platform] || '#7C3AED'
                    const pIcon = PLATFORM_ICONS[platform] || '🔗'

                    return (
                      <div
                        key={platform}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-surface/30 print:bg-gray-50 print:border-gray-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                            style={{ backgroundColor: pColor }}
                          >
                            {pIcon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary capitalize truncate print:text-black">
                              {platform}
                            </p>
                            <p className="text-3xs text-text-secondary truncate print:text-gray-500">@{username}</p>
                          </div>
                        </div>

                        {/* Specific small key details display */}
                        <div className="text-right">
                          {platform === 'leetcode' && (
                            <p className="text-xs font-extrabold text-text-primary print:text-black">
                              {pStats.totalSolved} <span className="text-3xs text-text-muted font-normal uppercase">solved</span>
                            </p>
                          )}
                          {platform === 'codeforces' && (
                            <p className="text-xs font-extrabold text-text-primary print:text-black">
                              {pStats.currentRating} <span className="text-3xs text-text-muted font-normal uppercase">rating</span>
                            </p>
                          )}
                          {platform === 'github' && (
                            <p className="text-xs font-extrabold text-text-primary print:text-black">
                              {repos.length} <span className="text-3xs text-text-muted font-normal uppercase">repos</span>
                            </p>
                          )}
                          {pStats.reputation !== undefined && (
                            <p className="text-xs font-extrabold text-text-primary print:text-black">
                              {pStats.reputation} <span className="text-3xs text-text-muted font-normal uppercase">rep</span>
                            </p>
                          )}
                          {pStats.problemsSolved !== undefined && platform !== 'leetcode' && (
                            <p className="text-xs font-extrabold text-text-primary print:text-black">
                              {pStats.problemsSolved} <span className="text-3xs text-text-muted font-normal uppercase">solved</span>
                            </p>
                          )}
                          {platform === 'linkedin' && (
                            <p className="text-xs font-extrabold text-text-primary print:text-black">
                              {pStats.followers} <span className="text-3xs text-text-muted font-normal uppercase">followers</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Favorite Programming languages */}
            <div className="card space-y-3.5 print:bg-white print:border-gray-200">
              <h3 className="section-title print:text-black">Favorite Languages</h3>
              <div className="flex flex-wrap gap-2">
                {topLangs.length === 0 ? (
                  <p className="text-2xs text-text-muted">Analyzing coding profile languages...</p>
                ) : (
                  topLangs.map((lang) => <LangBadge key={lang} lang={lang} />)
                )}
              </div>
            </div>

            {/* Top Projects */}
            <div className="card space-y-3.5 print:bg-white print:border-gray-200">
              <h3 className="section-title print:text-black">Top Projects</h3>
              <div className="space-y-3">
                {topRepos.length === 0 ? (
                  <p className="text-2xs text-text-muted">No public projects loaded.</p>
                ) : (
                  topRepos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 rounded-xl border border-border/40 hover:border-violet/40 transition-colors bg-surface/10 print:bg-gray-50 print:border-gray-200"
                    >
                      <h4 className="text-xs font-bold text-text-primary truncate print:text-black">{repo.name}</h4>
                      {repo.description && (
                        <p className="text-3xs text-text-secondary line-clamp-1 mt-1 print:text-gray-700">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-3xs text-text-muted mt-2 print:text-gray-500">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {repo.stargazers_count}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-teal-light" /> {repo.forks_count}</span>
                        {repo.language && <span className="font-medium">{repo.language}</span>}
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Combined activity timeline */}
        <div className="card space-y-3.5 print:bg-white print:border-gray-200">
          <h3 className="section-title flex items-center gap-2 print:text-black">
            <Calendar className="w-4 h-4 text-violet-light print:text-violet-700" /> Recent Coding Activities
          </h3>
          <div className="space-y-3.5 pl-3 border-l border-border/50 print:border-gray-300">
            {sortedTimeline.length === 0 ? (
              <p className="text-2xs text-text-muted">No recent activities updated.</p>
            ) : (
              sortedTimeline.map((item, idx) => (
                <div key={idx} className="relative flex gap-3 pb-1">
                  {/* Dot */}
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-violet border border-bg flex items-center justify-center print:border-white print:bg-violet-700" />
                  <span className="text-sm leading-none flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary leading-snug print:text-black">{item.title}</p>
                    <p className="text-3xs text-text-muted mt-0.5 print:text-gray-500">{item.desc}</p>
                  </div>
                  <span className="text-3xs text-text-muted flex-shrink-0 mt-0.5 print:text-gray-500">
                    {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted py-4 print:text-gray-400">
          Powered by <span className="gradient-text font-semibold print:text-purple-700">DevFolio OS</span> · Create your own developer profile at devfolio.dev
        </p>
      </div>
    </div>
  )
}
