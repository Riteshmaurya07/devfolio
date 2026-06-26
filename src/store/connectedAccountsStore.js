import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { platformStatsService } from '@/utils/platformStatsService'
import axios from 'axios'

const initialAccountsState = {
  github: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  leetcode: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  codeforces: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  codechef: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  hackerrank: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  geeksforgeeks: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  atcoder: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  hackerearth: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  linkedin: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  stackoverflow: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  'dev.to': { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  hashnode: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  kaggle: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  topcoder: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  codolio: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
  codingninjas: { username: '', connected: false, verified: false, lastSynced: null, autoSync: true, showOnDashboard: true, error: null },
}

// Utility to calculate developer score, XP, Level and Badges based on active stats
function calcProgression(accounts, stats) {
  let xp = 0
  let totalSolved = 0
  let totalContests = 0
  let totalCommits = 0
  let totalStars = 0
  let totalContributions = 0
  let platformsConnected = 0

  // GitHub
  if (accounts.github?.connected && stats.github) {
    platformsConnected++
    const gh = stats.github
    const repos = gh.repos || []
    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
    const commitsCount = (gh.events || []).filter(e => e.type === 'PushEvent')
      .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0) || 45
    const contributionsCount = gh.contributions?.reduce((sum, c) => sum + c.count, 0) || commitsCount

    totalStars += stars
    totalCommits += commitsCount
    totalContributions += contributionsCount
    xp += contributionsCount * 12
    xp += stars * 45
  }

  // LeetCode
  if (accounts.leetcode?.connected && stats.leetcode) {
    platformsConnected++
    const lc = stats.leetcode
    totalSolved += lc.totalSolved || 0
    xp += (lc.easySolved || 0) * 10
    xp += (lc.mediumSolved || 0) * 25
    xp += (lc.hardSolved || 0) * 50
  }

  // Codeforces
  if (accounts.codeforces?.connected && stats.codeforces) {
    platformsConnected++
    const cf = stats.codeforces
    totalSolved += cf.problemsSolved || 0
    totalContests += cf.contestsParticipated || 0
    xp += (cf.problemsSolved || 0) * 18
    xp += (cf.currentRating || 0) * 2
  }

  // CodeChef
  if (accounts.codechef?.connected && stats.codechef) {
    platformsConnected++
    const cc = stats.codechef
    totalSolved += cc.problemsSolved || 0
    totalContests += cc.contestHistory?.length || 0
    xp += (cc.problemsSolved || 0) * 15
    xp += (cc.currentRating || 0) * 1.5
  }

  // GeeksforGeeks
  if (accounts.geeksforgeeks?.connected && stats.geeksforgeeks) {
    platformsConnected++
    const gfg = stats.geeksforgeeks
    totalSolved += gfg.problemsSolved || 0
    xp += (gfg.problemsSolved || 0) * 10
    xp += (gfg.codingScore || 0) * 1
  }

  // HackerRank
  if (accounts.hackerrank?.connected && stats.hackerrank) {
    platformsConnected++
    const hr = stats.hackerrank
    totalContests += hr.contestParticipation || 0
    xp += (hr.contestParticipation || 0) * 100
    xp += (hr.skillBadges?.length || 0) * 120
  }

  // AtCoder
  if (accounts.atcoder?.connected && stats.atcoder) {
    platformsConnected++
    const ac = stats.atcoder
    totalSolved += ac.problemsSolved || 0
    totalContests += ac.contestsParticipated || 0
    xp += (ac.problemsSolved || 0) * 22
    xp += (ac.currentRating || 0) * 2
  }

  // HackerEarth
  if (accounts.hackerearth?.connected && stats.hackerearth) {
    platformsConnected++
    const he = stats.hackerearth
    totalSolved += he.problemsSolved || 0
    totalContests += he.contestsParticipated || 0
    xp += (he.problemsSolved || 0) * 18
    xp += (he.currentRating || 0) * 1.5
  }

  // StackOverflow
  if (accounts.stackoverflow?.connected && stats.stackoverflow) {
    platformsConnected++
    const so = stats.stackoverflow
    xp += (so.reputation || 0) * 1.2
    xp += (so.badgeCounts?.gold || 0) * 400
    xp += (so.badgeCounts?.silver || 0) * 80
    xp += (so.badgeCounts?.bronze || 0) * 15
  }

  // Dev.to & Hashnode
  if (accounts['dev.to']?.connected && stats['dev.to']) {
    platformsConnected++
    const dt = stats['dev.to']
    xp += (dt.postsCount || 0) * 150
    xp += (dt.followersCount || 0) * 1.5
  }
  if (accounts.hashnode?.connected && stats.hashnode) {
    platformsConnected++
    const hn = stats.hashnode
    const postCount = hn.publications?.reduce((sum, p) => sum + p.postsCount, 0) || 0
    xp += postCount * 150
    xp += (hn.followersCount || 0) * 1.5
  }

  // Kaggle
  if (accounts.kaggle?.connected && stats.kaggle) {
    platformsConnected++
    const kg = stats.kaggle
    const tierMap = { Grandmaster: 4000, Master: 2500, Expert: 1200, Contributor: 400, Novice: 100 }
    xp += tierMap[kg.tier] || 100
    xp += (kg.medals?.gold || 0) * 800
    xp += (kg.medals?.silver || 0) * 250
    xp += (kg.medals?.bronze || 0) * 80
  }

  // TopCoder
  if (accounts.topcoder?.connected && stats.topcoder) {
    platformsConnected++
    const tc = stats.topcoder
    xp += (tc.rating || 0) * 1.8
  }

  // Coding Ninjas
  if (accounts.codingninjas?.connected && stats.codingninjas) {
    platformsConnected++
    const cn = stats.codingninjas
    totalSolved += cn.problemsSolved || 0
    xp += (cn.problemsSolved || 0) * 10
    xp += (cn.ninjaPoints || 0) * 0.5
  }

  // Calculate Level based on XP
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1)

  // Map levels to titles
  let title = 'Novice Developer'
  if (level >= 25) title = 'Legendary Arch-Mage'
  else if (level >= 18) title = 'Systems Architect'
  else if (level >= 12) title = 'Senior Engineer'
  else if (level >= 6) title = 'Apprentice Coder'

  // Generate Badges List
  const badges = []
  if (totalContributions >= 100) {
    badges.push({ id: 'commit-master', name: 'Commit Master', description: 'Unlocked 100+ GitHub contributions', icon: '⚡', tier: 'Gold' })
  }
  if (totalStars >= 10) {
    badges.push({ id: 'star-hunter', name: 'Star Hunter', description: 'Earned 10+ GitHub stars', icon: '⭐', tier: 'Silver' })
  }
  if (totalSolved >= 150) {
    badges.push({ id: 'algo-master', name: 'Algorithm Master', description: 'Solved 150+ coding problems', icon: '🧠', tier: 'Gold' })
  }
  if (totalContests >= 5) {
    badges.push({ id: 'contest-warrior', name: 'Contest Warrior', description: 'Competed in 5+ contests', icon: '⚔️', tier: 'Silver' })
  }
  if (xp >= 5000) {
    badges.push({ id: 'xp-collector', name: 'XP Collector', description: 'Earned 5,000+ developer XP', icon: '💎', tier: 'Gold' })
  }
  if (platformsConnected >= 5) {
    badges.push({ id: 'polymath', name: 'Platform Polymath', description: 'Connected 5+ coding accounts', icon: '🔮', tier: 'Gold' })
  }
  if (platformsConnected >= 1) {
    badges.push({ id: 'first-link', name: 'First Link', description: 'Connected your first coding profile', icon: '🔗', tier: 'Bronze' })
  }

  return {
    xp: Math.round(xp),
    level,
    title,
    badges,
    totalSolved,
    totalContests,
    totalCommits,
    totalStars,
    totalContributions,
  }
}

const useConnectedAccountsStore = create(
  persist(
    (set, get) => ({
      accounts: initialAccountsState,
      stats: {},
      syncing: {},
      xp: 0,
      level: 1,
      title: 'Novice Developer',
      badges: [],
      totalSolved: 0,
      totalContests: 0,
      totalCommits: 0,
      totalStars: 0,
      totalContributions: 0,

      // Actions
      connectAccount: async (platformId, username) => {
        if (!username.trim()) return

        set((state) => ({
          accounts: {
            ...state.accounts,
            [platformId]: {
              ...state.accounts[platformId],
              username: username.trim(),
              connected: true,
              verified: false,
              error: null,
            },
          },
        }))

        // Trigger immediate sync
        await get().syncAccount(platformId, true)
      },

      disconnectAccount: (platformId) => {
        set((state) => {
          const updatedAccounts = {
            ...state.accounts,
            [platformId]: { ...initialAccountsState[platformId] },
          }
          const updatedStats = { ...state.stats }
          delete updatedStats[platformId]

          const prog = calcProgression(updatedAccounts, updatedStats)

          return {
            accounts: updatedAccounts,
            stats: updatedStats,
            ...prog,
          }
        })
      },

      toggleAutoSync: (platformId) => {
        set((state) => ({
          accounts: {
            ...state.accounts,
            [platformId]: {
              ...state.accounts[platformId],
              autoSync: !state.accounts[platformId].autoSync,
            },
          },
        }))
      },

      toggleDashboardVisibility: (platformId) => {
        set((state) => {
          const updatedAccounts = {
            ...state.accounts,
            [platformId]: {
              ...state.accounts[platformId],
              showOnDashboard: !state.accounts[platformId].showOnDashboard,
            },
          }
          const prog = calcProgression(updatedAccounts, get().stats)
          return {
            accounts: updatedAccounts,
            ...prog,
          }
        })
      },

      syncAccount: async (platformId, force = false) => {
        const account = get().accounts[platformId]
        if (!account || !account.connected || !account.username) return

        // Cache policy: 5 minutes cache unless forced
        const now = Date.now()
        if (!force && account.lastSynced && now - account.lastSynced < 5 * 60 * 1000) {
          console.log(`[Store] Skipping sync for ${platformId}. Loaded from cache.`)
          return
        }

        set((state) => ({
          syncing: { ...state.syncing, [platformId]: true },
        }))

        const token = import.meta.env.VITE_GITHUB_TOKEN
        const fetchedStats = await platformStatsService.fetchAllPlatformStats(
          platformId,
          account.username,
          token
        )

        set((state) => {
          const updatedAccounts = {
            ...state.accounts,
            [platformId]: {
              ...state.accounts[platformId],
              verified: !fetchedStats._error,
              lastSynced: now,
              error: fetchedStats._error || null,
            },
          }

          const updatedStats = {
            ...state.stats,
            [platformId]: fetchedStats,
          }

          const prog = calcProgression(updatedAccounts, updatedStats)

          return {
            accounts: updatedAccounts,
            stats: updatedStats,
            syncing: { ...state.syncing, [platformId]: false },
            ...prog,
          }
        })
      },

      syncAllAccounts: async (force = false) => {
        const connectedPlatforms = Object.keys(get().accounts).filter(
          (k) => get().accounts[k].connected
        )
        await Promise.all(connectedPlatforms.map((p) => get().syncAccount(p, force)))
      },

      importFromGitHub: async (githubUsername) => {
        if (!githubUsername) return
        set((state) => ({ syncing: { ...state.syncing, github: true } }))

        try {
          // Connect github first if not done
          if (!get().accounts.github.connected) {
            await get().connectAccount('github', githubUsername)
          }

          const token = import.meta.env.VITE_GITHUB_TOKEN
          const headers = {}
          if (token && !token.includes('your_') && token.length >= 10) {
            headers.Authorization = `Bearer ${token}`
          }

          const res = await axios.get(
            `https://api.github.com/users/${githubUsername}/social_accounts`,
            { headers }
          )

          const socialAccounts = res.data || []
          const connectPromises = []

          socialAccounts.forEach((social) => {
            const provider = social.provider.toLowerCase()
            const url = social.url

            // Try to match platform and username
            if (provider === 'linkedin' && url.includes('linkedin.com/in/')) {
              const username = url.split('linkedin.com/in/')[1]?.replace(/\/$/, '')
              if (username) connectPromises.push(get().connectAccount('linkedin', username))
            } else if (provider === 'stackoverflow' && url.includes('stackoverflow.com/users/')) {
              const matches = url.match(/users\/(\d+)/)
              const userId = matches ? matches[1] : null
              if (userId) connectPromises.push(get().connectAccount('stackoverflow', userId))
            } else if (provider === 'twitter' || provider === 'x') {
              // Not directly mapped, skip or handle as needed
            } else if (url.includes('leetcode.com/')) {
              const username = url.split('leetcode.com/')[1]?.replace(/\/$/, '').split('/')[0]
              if (username) connectPromises.push(get().connectAccount('leetcode', username))
            } else if (url.includes('codeforces.com/profile/')) {
              const username = url.split('codeforces.com/profile/')[1]?.replace(/\/$/, '')
              if (username) connectPromises.push(get().connectAccount('codeforces', username))
            } else if (url.includes('dev.to/')) {
              const username = url.split('dev.to/')[1]?.replace(/\/$/, '')
              if (username) connectPromises.push(get().connectAccount('dev.to', username))
            } else if (url.includes('hashnode.com/@')) {
              const username = url.split('hashnode.com/@')[1]?.replace(/\/$/, '')
              if (username) connectPromises.push(get().connectAccount('hashnode', username))
            }
          } )

          await Promise.all(connectPromises)
        } catch (error) {
          console.warn('[Store] GitHub social import failed:', error.message)
        } finally {
          set((state) => ({ syncing: { ...state.syncing, github: false } }))
        }
      },

      connectDemoMode: async () => {
        // Clear old first
        set({ accounts: initialAccountsState, stats: {}, syncing: {} })

        // Pre-fill usernames for all platforms
        const demoUsernames = {
          github: 'demo-dev',
          leetcode: 'lc_ninja',
          codeforces: 'cf_expert',
          codechef: 'chef_gold',
          hackerrank: 'hr_champion',
          geeksforgeeks: 'gfg_wizard',
          atcoder: 'atcoder_pro',
          hackerearth: 'he_coder',
          linkedin: 'demodeveloper',
          stackoverflow: '1234567',
          'dev.to': 'devto_writer',
          hashnode: 'hash_blogger',
          kaggle: 'kaggle_master',
          topcoder: 'tc_coder',
          codolio: 'codolio_profile',
          codingninjas: 'ninja_level5',
        }

        const connectPromises = Object.entries(demoUsernames).map(([platformId, username]) =>
          get().connectAccount(platformId, username)
        )

        await Promise.all(connectPromises)
      },

      clearAll: () => {
        set({
          accounts: initialAccountsState,
          stats: {},
          syncing: {},
          xp: 0,
          level: 1,
          title: 'Novice Developer',
          badges: [],
          totalSolved: 0,
          totalContests: 0,
          totalCommits: 0,
          totalStars: 0,
          totalContributions: 0,
        })
      },
    }),
    {
      name: 'devfolio-connected-accounts',
      partialize: (state) => ({
        accounts: state.accounts,
        stats: state.stats,
        xp: state.xp,
        level: state.level,
        title: state.title,
        badges: state.badges,
        totalSolved: state.totalSolved,
        totalContests: state.totalContests,
        totalCommits: state.totalCommits,
        totalStars: state.totalStars,
        totalContributions: state.totalContributions,
      }),
    }
  )
)

export default useConnectedAccountsStore
