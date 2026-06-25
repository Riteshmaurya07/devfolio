import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Github,
  Linkedin,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
  Link,
  Shield,
  Info
} from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import useAuthStore from '@/store/authStore'
import useConnectedAccountsStore from '@/store/connectedAccountsStore'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const PLATFORM_DEFS = [
  { id: 'github', name: 'GitHub', placeholder: 'username or URL', color: '#7C3AED', icon: Github },
  { id: 'leetcode', name: 'LeetCode', placeholder: 'username', color: '#F59E0B', label: 'LC' },
  { id: 'codeforces', name: 'Codeforces', placeholder: 'handle', color: '#3B82F6', label: 'CF' },
  { id: 'codechef', name: 'CodeChef', placeholder: 'username', color: '#92400E', label: 'CC' },
  { id: 'hackerrank', name: 'HackerRank', placeholder: 'username', color: '#10B981', label: 'HR' },
  { id: 'geeksforgeeks', name: 'GeeksforGeeks', placeholder: 'username', color: '#047857', label: 'GfG' },
  { id: 'atcoder', name: 'AtCoder', placeholder: 'username', color: '#6B7280', label: 'AC' },
  { id: 'hackerearth', name: 'HackerEarth', placeholder: 'username', color: '#4F46E5', label: 'HE' },
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'profile-slug', color: '#0284C7', icon: Linkedin },
  { id: 'stackoverflow', name: 'Stack Overflow', placeholder: 'User ID (e.g. 12345)', color: '#F97316', label: 'SO' },
  { id: 'dev.to', name: 'Dev.to', placeholder: 'username', color: '#0F172A', label: 'dt' },
  { id: 'hashnode', name: 'Hashnode', placeholder: 'username', color: '#2563EB', label: 'hn' },
  { id: 'kaggle', name: 'Kaggle', placeholder: 'username', color: '#06B6D4', label: 'kg' },
  { id: 'topcoder', name: 'TopCoder', placeholder: 'username', color: '#EAB308', label: 'tc' },
  { id: 'codolio', name: 'Codolio (Optional)', placeholder: 'username', color: '#8B5CF6', label: 'co' },
  { id: 'codingninjas', name: 'Coding Ninjas (Optional)', placeholder: 'username', color: '#EF4444', label: 'cn' },
]

export default function Settings() {
  const { user } = useAuthStore()
  const {
    accounts,
    stats,
    syncing,
    xp,
    level,
    title,
    badges,
    connectAccount,
    disconnectAccount,
    toggleAutoSync,
    toggleDashboardVisibility,
    syncAccount,
    syncAllAccounts,
    importFromGitHub,
    connectDemoMode,
    clearAll
  } = useConnectedAccountsStore()

  // Local state for input fields
  const [inputs, setInputs] = useState(
    Object.keys(accounts).reduce((acc, key) => {
      acc[key] = accounts[key].username || ''
      return acc
    }, {})
  )

  const [isInitialized, setIsInitialized] = useState(false)

  // Sync inputs with persisted store on initial hydration
  useEffect(() => {
    if (!isInitialized && useConnectedAccountsStore.persist?.hasHydrated()) {
      setInputs(
        Object.keys(accounts).reduce((acc, key) => {
          acc[key] = accounts[key].username || ''
          return acc
        }, {})
      )
      setIsInitialized(true)
    }
  }, [accounts, isInitialized])

  const handleInputChange = (platformId, value) => {
    setInputs(prev => ({ ...prev, [platformId]: value }))
  }

  const handleConnect = async (platformId) => {
    const username = inputs[platformId]
    if (!username) {
      toast.error('Please enter a username')
      return
    }

    try {
      await connectAccount(platformId, username)
      toast.success(`Connecting ${PLATFORM_DEFS.find(p => p.id === platformId)?.name}...`)
    } catch (err) {
      toast.error(`Connection failed: ${err.message}`)
    }
  }

  const handleDisconnect = (platformId) => {
    disconnectAccount(platformId)
    setInputs(prev => ({ ...prev, [platformId]: '' }))
    toast.success(`Disconnected from platform.`)
  }

  const handleSync = async (platformId) => {
    toast.promise(
      syncAccount(platformId, true),
      {
        loading: 'Syncing profile data...',
        success: 'Sync complete!',
        error: 'Failed to sync. Please try again.'
      }
    )
  }

  const handleSyncAll = async () => {
    toast.promise(
      syncAllAccounts(true),
      {
        loading: 'Syncing all accounts...',
        success: 'All accounts synced!',
        error: 'Failed to sync some accounts.'
      }
    )
  }

  const handleImportGitHub = async () => {
    if (!user?.login) {
      toast.error('Please connect your main GitHub account first')
      return
    }

    toast.promise(
      importFromGitHub(user.login),
      {
        loading: 'Fetching social links from GitHub...',
        success: 'Import complete! Connected platforms updated.',
        error: 'Failed to import. Try setting handles manually.'
      }
    )
  }

  const handleConnectDemo = async () => {
    toast.promise(
      connectDemoMode(),
      {
        loading: 'Loading demo accounts...',
        success: 'Demo Mode Activated! Connected all platforms.',
        error: 'Failed to load demo profiles.'
      }
    )
    // Pre-populate input states
    setInputs({
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
    })
  }

  const handleClearAll = () => {
    clearAll()
    setInputs(
      Object.keys(accounts).reduce((acc, key) => {
        acc[key] = ''
        return acc
      }, {})
    )
    toast.success('All profiles disconnected.')
  }

  const connectedCount = Object.values(accounts).filter(a => a.connected).length

  return (
    <PageWrapper>
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Connected Developer Profiles</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Link your accounts to automatically synchronize coding statistics and populate your portfolio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            onClick={handleImportGitHub}
            icon={Github}
            size="sm"
          >
            Import from GitHub
          </Button>
          {connectedCount > 0 ? (
            <Button
              variant="outline"
              onClick={handleClearAll}
              icon={Trash2}
              size="sm"
              className="border-danger/30 bg-danger/5 text-danger hover:bg-danger/10"
            >
              Deactivate Demo Mode
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleConnectDemo}
              icon={Sparkles}
              size="sm"
              className="border-violet-light/30 bg-violet-light/5 text-violet-light hover:bg-violet-light/10"
            >
              Activate Demo Mode
            </Button>
          )}
          {connectedCount > 0 && (
            <Button
              onClick={handleSyncAll}
              icon={RefreshCw}
              size="sm"
            >
              Sync All Accounts
            </Button>
          )}
        </div>
      </div>

      {/* Progression Banner */}
      <div className="card border-gradient relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center justify-center text-center glow-violet">
            <span className="text-xs text-text-secondary uppercase font-semibold">Lvl</span>
            <span className="text-xl font-bold text-violet-light">{level}</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{title}</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              XP Points: <span className="text-violet-light font-medium">{xp.toLocaleString()}</span> · Connected Platforms: <span className="text-teal-light font-medium">{connectedCount}/16</span>
            </p>
            {/* Level progress bar */}
            <div className="w-56 h-1.5 bg-surface border border-border rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet to-teal rounded-full"
                style={{ width: `${Math.min(100, (xp % 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Preview */}
        <div className="flex flex-wrap items-center gap-2 max-w-sm justify-center md:justify-end">
          {badges.length === 0 ? (
            <div className="flex items-center gap-1.5 text-2xs text-text-muted">
              <Shield className="w-3.5 h-3.5" />
              <span>Connect accounts to unlock achievements & badges</span>
            </div>
          ) : (
            badges.map(badge => (
              <div
                key={badge.id}
                className="badge bg-surface border border-border px-2 py-1 flex items-center gap-1.5 rounded-lg group relative cursor-help"
              >
                <span>{badge.icon}</span>
                <span className="text-text-primary text-3xs font-medium">{badge.name}</span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border text-text-secondary text-3xs rounded-md p-1.5 shadow-xl w-36 text-center pointer-events-none z-50">
                  <p className="font-semibold text-text-primary">{badge.name}</p>
                  <p className="mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid of connected accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {PLATFORM_DEFS.map(platform => {
          const account = accounts[platform.id] || { connected: false }
          const isSyncing = syncing[platform.id]
          const isConnected = account.connected
          const isVerified = account.verified
          const errorMsg = account.error
          const platformStats = stats[platform.id]

          return (
            <motion.div
              layout
              key={platform.id}
              className={`card relative overflow-hidden flex flex-col justify-between ${
                isConnected
                  ? 'border-border-light bg-card/60'
                  : 'border-border/40 bg-surface/20'
              }`}
            >
              {/* Top Row: Platform Icon & Connection status */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Visual platform identifier */}
                    {platform.icon ? (
                      <platform.icon
                        className="w-7 h-7 flex-shrink-0"
                        style={{ color: platform.color }}
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-2xs text-white"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.label}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{platform.name}</h4>
                      <p className="text-2xs text-text-muted capitalize">
                        {isConnected ? (isVerified ? 'verified' : 'pending sync') : 'disconnected'}
                      </p>
                    </div>
                  </div>

                  {/* Top status indicator */}
                  {isConnected && (
                    <div className="flex items-center gap-1.5">
                      {isVerified ? (
                        <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
                      ) : errorMsg ? (
                        <span className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-warning animate-pulse flex-shrink-0" />
                      )}
                    </div>
                  )}
                </div>

                {/* Subcontent block */}
                <div className="mt-4 flex-1">
                  {!isConnected ? (
                    <div className="space-y-2.5">
                      <div>
                        <label className="label">Username or Profile handle</label>
                        <input
                          type="text"
                          value={inputs[platform.id] || ''}
                          onChange={(e) => handleInputChange(platform.id, e.target.value)}
                          placeholder={platform.placeholder}
                          className="input"
                          onKeyDown={(e) => e.key === 'Enter' && handleConnect(platform.id)}
                        />
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => handleConnect(platform.id)}
                        className="w-full justify-center h-8 text-xs"
                        loading={isSyncing}
                      >
                        Connect Account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Connected state information details */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="text-xs text-text-primary font-medium truncate max-w-[130px]">
                          @{account.username}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isVerified ? (
                            <span className="badge bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> Verified
                            </span>
                          ) : errorMsg ? (
                            <span className="badge bg-danger/10 text-danger flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Error
                            </span>
                          ) : (
                            <span className="badge bg-amber-500/10 text-amber-400">
                              Connecting
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display small cached stat snippets inside settings */}
                      {isVerified && platformStats && (
                        <div className="text-3xs text-text-secondary bg-surface/50 border border-border/30 rounded-lg p-2 flex flex-col gap-1">
                          {platform.id === 'github' && (
                            <>
                              <p>Repos: <span className="text-text-primary font-medium">{platformStats.profile?.public_repos || 0}</span></p>
                              <p>Followers: <span className="text-text-primary font-medium">{platformStats.profile?.followers || 0}</span></p>
                            </>
                          )}
                          {platform.id === 'leetcode' && (
                            <>
                              <p>Solved: <span className="text-text-primary font-medium">{platformStats.totalSolved || 0}</span> (H: {platformStats.hardSolved || 0})</p>
                              <p>Streak: <span className="text-text-primary font-medium">{platformStats.streak || 0} days</span></p>
                            </>
                          )}
                          {platform.id === 'codeforces' && (
                            <>
                              <p>Rating: <span className="text-text-primary font-medium">{platformStats.currentRating || 0}</span> ({platformStats.rank})</p>
                              <p>Solved: <span className="text-text-primary font-medium">{platformStats.problemsSolved || 0}</span></p>
                            </>
                          )}
                          {!['github', 'leetcode', 'codeforces'].includes(platform.id) && platformStats.problemsSolved !== undefined && (
                            <p>Problems Solved: <span className="text-text-primary font-medium">{platformStats.problemsSolved}</span></p>
                          )}
                          {platformStats.reputation !== undefined && (
                            <p>Reputation: <span className="text-text-primary font-medium">{platformStats.reputation.toLocaleString()}</span></p>
                          )}
                          {platformStats.followers !== undefined && (
                            <p>Followers: <span className="text-text-primary font-medium">{platformStats.followers.toLocaleString()}</span></p>
                          )}
                          {platformStats.points !== undefined && (
                            <p>Points: <span className="text-text-primary font-medium">{platformStats.points.toLocaleString()}</span> ({platformStats.tier})</p>
                          )}
                          {platform.id === 'linkedin' && (
                            <p>Followers: <span className="text-text-primary font-medium">{platformStats.followers || 0}</span></p>
                          )}
                        </div>
                      )}

                      {/* Error block */}
                      {errorMsg && (
                        <p className="text-3xs text-danger leading-normal bg-danger/5 border border-danger/10 p-1.5 rounded-md mt-1">
                          ⚠️ {errorMsg}
                        </p>
                      )}

                      {/* Toggles */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-3xs text-text-secondary flex items-center gap-1">
                            <Info className="w-2.5 h-2.5 text-text-muted" /> Auto Synchronization
                          </span>
                          <button
                            onClick={() => toggleAutoSync(platform.id)}
                            className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex ${
                              account.autoSync ? 'bg-violet items-end justify-end' : 'bg-border-light items-start justify-start'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-white transition-all" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xs text-text-secondary flex items-center gap-1">
                            {account.showOnDashboard ? (
                              <Eye className="w-2.5 h-2.5 text-violet-light" />
                            ) : (
                              <EyeOff className="w-2.5 h-2.5 text-text-muted" />
                            )}
                            Show on Dashboard & Profile
                          </span>
                          <button
                            onClick={() => toggleDashboardVisibility(platform.id)}
                            className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex ${
                              account.showOnDashboard ? 'bg-teal items-end justify-end' : 'bg-border-light items-start justify-start'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-white transition-all" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Actions */}
              {isConnected && (
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2.5">
                  <span className="text-3xs text-text-muted">
                    Synced: {account.lastSynced ? new Date(account.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSync(platform.id)}
                      disabled={isSyncing}
                      className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-30"
                      title="Sync data now"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-violet-light' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      className="p-1 rounded-md text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Disconnect account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </PageWrapper>
  )
}
