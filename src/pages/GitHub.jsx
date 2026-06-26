import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, GitFork, ExternalLink, AlertCircle, GitPullRequest, Package } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import BarChartComponent from '@/components/charts/BarChartComponent'
import PieChartComponent from '@/components/charts/PieChartComponent'
import { LangBadge } from '@/components/ui/Badge'
import { SkeletonCard, SkeletonGrid } from '@/components/ui/SkeletonCard'
import useAuthStore from '@/store/authStore'
import useUserDataStore from '@/store/userDataStore'
import { useGitHub } from '@/hooks/useGitHub'

function generateCommitData(contributions = [], events = []) {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    months.push({ name: label, monthKey, value: 0 })
  }

  if (contributions && contributions.length > 0) {
    contributions.forEach((day) => {
      const monthKey = day.date?.slice(0, 7)
      const found = months.find((m) => m.monthKey === monthKey)
      if (found) found.value += day.count || 0
    })
  } else {
    events.forEach((event) => {
      if (event.type === 'PushEvent') {
        const monthKey = event.created_at?.slice(0, 7)
        const found = months.find((m) => m.monthKey === monthKey)
        if (found) found.value += event.payload?.commits?.length || 0
      }
    })
  }
  return months
}

export default function GitHub() {
  const { user } = useAuthStore()
  const { githubData, repos, events, languages, contributions, githubLoading } = useUserDataStore()
  const { fetchUserData } = useGitHub()

  useEffect(() => {
    if (user?.login && !githubData) fetchUserData(user.login)
  }, [user?.login, githubData, fetchUserData])

  const loading = githubLoading || !githubData
  const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6)
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)

  const langData = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const commitData = generateCommitData(contributions, events)

  const prCount = events.filter((e) => e.type === 'PullRequestEvent').length
  const issueCount = events.filter((e) => e.type === 'IssuesEvent').length

  return (
    <PageWrapper>
      {/* Profile header */}
      {loading ? (
        <SkeletonCard height="h-24" />
      ) : (
        <div className="card flex items-center gap-4">
          <img
            src={githubData?.avatar_url}
            alt={githubData?.login}
            className="w-16 h-16 rounded-full ring-2 ring-violet/40"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary">{githubData?.name}</h2>
            <p className="text-sm text-text-muted">@{githubData?.login}</p>
            {githubData?.bio && <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">{githubData.bio}</p>}
          </div>
          <div className="hidden sm:flex items-center gap-4 text-center">
            <div><p className="text-lg font-bold text-text-primary">{repos.length}</p><p className="text-xs text-text-muted">Repos</p></div>
            <div><p className="text-lg font-bold text-yellow-400">{totalStars.toLocaleString()}</p><p className="text-xs text-text-muted">Stars</p></div>
            <div><p className="text-lg font-bold text-text-primary">{githubData?.followers?.toLocaleString()}</p><p className="text-xs text-text-muted">Followers</p></div>
          </div>
          <a href={githubData?.html_url} target="_blank" rel="noreferrer" className="btn-ghost flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4" /> View on GitHub
          </a>
        </div>
      )}

      {/* PR + Issues summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Repos', value: repos.length, icon: Package, iconColor: 'text-violet-light' },
          { label: 'Total Stars', value: totalStars.toLocaleString(), icon: Star, iconColor: 'text-yellow-400' },
          { label: 'Pull Requests', value: prCount, icon: GitPullRequest, iconColor: 'text-teal-light' },
          { label: 'Issues', value: issueCount, icon: AlertCircle, iconColor: 'text-danger' },
        ].map(({ label, value, icon: Icon, iconColor }) => (
          <div key={label} className="card text-center flex flex-col items-center justify-center py-4">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <p className="text-lg font-bold text-text-primary mt-1.5">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Top repos grid */}
      <div>
        <h3 className="section-title mb-4">Top Repositories</h3>
        {loading ? (
          <SkeletonGrid cols={3} count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRepos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2 }}
                className="card-hover block"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-text-primary truncate mr-2">{repo.name}</h4>
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 mb-3 min-h-[2rem]">
                  {repo.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks_count}</span>
                  </div>
                  {repo.language && <LangBadge lang={repo.language} />}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <h3 className="section-title">Commit Frequency</h3>
          <BarChartComponent data={commitData} dataKey="value" label="commits" loading={loading} />
        </div>
        <div className="card space-y-3">
          <h3 className="section-title">Language Distribution</h3>
          <PieChartComponent
            data={langData.map(({ name, value }) => ({ name, value }))}
            loading={loading}
          />
        </div>
      </div>
    </PageWrapper>
  )
}
