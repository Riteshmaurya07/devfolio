import { LangBadge } from '@/components/ui/Badge'
import { Star, GitFork, Users, BookOpen } from 'lucide-react'

export default function CompareCard({ user, side = 'left' }) {
  if (!user) {
    return (
      <div className="card flex-1 flex items-center justify-center h-64 border-dashed">
        <p className="text-sm text-text-muted">Enter a username above</p>
      </div>
    )
  }

  const topLangs = Object.entries(user.languages || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([lang]) => lang)

  const totalStars = (user.repos || []).reduce((sum, r) => sum + (r.stargazers_count || 0), 0)

  return (
    <div className={`card flex-1 space-y-4 ${side === 'left' ? 'border-violet/30' : 'border-teal/30'}`}>
      {/* Profile */}
      <div className="flex items-center gap-3">
        <img
          src={user.avatar_url}
          alt={user.login}
          className={`w-14 h-14 rounded-full ring-2 ${side === 'left' ? 'ring-violet/40' : 'ring-teal/40'}`}
        />
        <div>
          <h3 className="font-semibold text-text-primary">{user.name || user.login}</h3>
          <p className="text-xs text-text-muted">@{user.login}</p>
          {user.bio && <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{user.bio}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatItem icon={BookOpen} label="Repos" value={user.public_repos} />
        <StatItem icon={Star} label="Stars" value={totalStars} />
        <StatItem icon={Users} label="Followers" value={user.followers} />
        <StatItem icon={GitFork} label="Following" value={user.following} />
      </div>

      {/* Languages */}
      <div>
        <p className="text-xs text-text-muted mb-2">Top Languages</p>
        <div className="flex flex-wrap gap-1.5">
          {topLangs.map((lang) => <LangBadge key={lang} lang={lang} />)}
          {topLangs.length === 0 && <p className="text-xs text-text-muted">No languages detected</p>}
        </div>
      </div>
    </div>
  )
}

function StatItem({ icon: Icon, label, value }) {
  return (
    <div className="bg-surface rounded-lg px-3 py-2 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-text-muted" />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{(value || 0).toLocaleString()}</p>
      </div>
    </div>
  )
}
