import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Share2, Search, Users } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import CompareCard from '@/components/compare/CompareCard'
import StatRow from '@/components/compare/StatRow'
import Button from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { useGitHub } from '@/hooks/useGitHub'
import { captureAndShare } from '@/utils/captureScreenshot'
import toast from 'react-hot-toast'

export default function Compare() {
  const [username1, setUsername1] = useState('')
  const [username2, setUsername2] = useState('')
  const [users, setUsers] = useState({ user1: null, user2: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const compareRef = useRef(null)
  const { fetchTwoUsers } = useGitHub()

  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) {
      toast.error('Please enter both usernames')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await fetchTwoUsers(username1.trim(), username2.trim())
      setUsers(result)
    } catch (err) {
      setError('Failed to fetch one or both users. Check usernames.')
      toast.error('Failed to fetch profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => captureAndShare(compareRef, 'devfolio-compare.png')

  const totalStars1 = (users.user1?.repos || []).reduce((s, r) => s + (r.stargazers_count || 0), 0)
  const totalStars2 = (users.user2?.repos || []).reduce((s, r) => s + (r.stargazers_count || 0), 0)

  return (
    <PageWrapper>
      <div>
        <h2 className="text-xl font-bold text-text-primary">Profile Comparison</h2>
        <p className="text-sm text-text-muted">Compare two GitHub profiles side by side</p>
      </div>

      {/* Input row */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">GitHub Username 1</label>
            <input
              className="input"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              placeholder="e.g. torvalds"
            />
          </div>
          <div>
            <label className="label">GitHub Username 2</label>
            <input
              className="input"
              value={username2}
              onChange={(e) => setUsername2(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              placeholder="e.g. gaearon"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleCompare} loading={loading} icon={Search} className="flex-1 sm:flex-none justify-center">
            Compare
          </Button>
          {users.user1 && users.user2 && (
            <Button variant="outline" onClick={handleShare} icon={Share2}>
              Share on LinkedIn
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      {/* Comparison result */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard height="h-64" />
          <SkeletonCard height="h-64" />
        </div>
      ) : users.user1 && users.user2 ? (
        <motion.div
          ref={compareRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Profile cards */}
          <div className="flex gap-4">
            <CompareCard user={users.user1} side="left" />
            <CompareCard user={users.user2} side="right" />
          </div>

          {/* Head-to-head stats */}
          <div className="card">
            <h3 className="section-title mb-4 text-center">Head to Head</h3>
            <div className="flex items-center gap-3 mb-3 text-xs text-text-muted font-medium">
              <span className="flex-1 text-right text-violet-light">{users.user1.login}</span>
              <span className="w-28 text-center">Category</span>
              <span className="flex-1 text-left text-teal-light">{users.user2.login}</span>
            </div>
            <StatRow label="Repos" value1={users.user1.public_repos} value2={users.user2.public_repos} />
            <StatRow label="Stars" value1={totalStars1} value2={totalStars2} />
            <StatRow label="Followers" value1={users.user1.followers} value2={users.user2.followers} />
            <StatRow label="Following" value1={users.user1.following} value2={users.user2.following} />
            <StatRow label="Languages" value1={Object.keys(users.user1.languages || {}).length} value2={Object.keys(users.user2.languages || {}).length} />
          </div>
        </motion.div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed">
          <Users className="w-12 h-12 text-text-muted mb-3" />
          <h3 className="text-base font-semibold text-text-secondary">Compare two developers</h3>
          <p className="text-sm text-text-muted mt-1">Enter two GitHub usernames above to see the comparison</p>
        </div>
      )}
    </PageWrapper>
  )
}
