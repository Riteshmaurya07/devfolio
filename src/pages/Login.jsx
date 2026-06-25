import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, Zap, ArrowRight, Star, GitFork, Code2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import useUserDataStore from '@/store/userDataStore'
import { mockUser } from '@/data/mockUser'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Login() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const { clearData } = useUserDataStore()
  const navigate = useNavigate()

  // Extract username from a full GitHub URL if pasted (e.g. https://github.com/torvalds)
  const parseUsername = (value) => {
    const trimmed = value.trim()
    // Match https://github.com/username or github.com/username
    const match = trimmed.match(/(?:https?:\/\/)?github\.com\/([a-zA-Z0-9-]+)\/?/)
    return match ? match[1] : trimmed
  }

  const fetchGitHubUser = async (name, useToken = true) => {
    const headers = {}
    const token = import.meta.env.VITE_GITHUB_TOKEN
    // Only attach the token if it looks like a real PAT (not the placeholder)
    if (useToken && token && !token.includes('your_') && token.length > 10) {
      headers.Authorization = `Bearer ${token}`
    }
    return axios.get(`https://api.github.com/users/${name}`, { headers })
  }

  const handleGitHubLogin = async () => {
    const name = parseUsername(username)

    if (!name) {
      toast.error('Please enter your GitHub username')
      return
    }

    setLoading(true)

    try {
      let res
      try {
        res = await fetchGitHubUser(name, true)
      } catch (tokenErr) {
        // If the token caused a 401, retry without it
        if (tokenErr.response?.status === 401) {
          res = await fetchGitHubUser(name, false)
        } else {
          throw tokenErr
        }
      }

      clearData()
      login(res.data)
      toast.success(`Welcome, ${res.data.name || res.data.login}! 👋`)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error(`GitHub user "${name}" not found. Check the username and try again.`)
      } else if (err.response?.status === 403) {
        toast.error('GitHub API rate limit hit. Try again in a minute.')
      } else if (err.response?.status === 401) {
        toast.error('GitHub auth failed. Check your VITE_GITHUB_TOKEN in .env or leave it blank.')
      } else if (!err.response) {
        toast.error('Network error — check your internet connection and try again.')
      } else {
        toast.error(`GitHub API error: ${err.response?.status}. Please try again.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    login(mockUser)
    toast.success('Logged in as demo user 🚀')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/8 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet glow-violet mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Dev<span className="gradient-text">Folio OS</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Your all-in-one developer career operating system
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { icon: Star, label: 'GitHub Stars', value: '1.2K' },
            { icon: Code2, label: 'LC Problems', value: '247' },
            { icon: GitFork, label: 'Jobs Tracked', value: '48' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card text-center py-3">
              <Icon className="w-4 h-4 text-violet-light mx-auto mb-1" />
              <p className="text-base font-bold text-text-primary">{value}</p>
              <p className="text-2xs text-text-muted">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="card space-y-4"
        >
          <div>
            <label htmlFor="github-username" className="label">GitHub Username</label>
            <input
              id="github-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGitHubLogin()}
              placeholder="username or github.com/username"
              className="input"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-2xs text-text-muted mt-1.5">
              Enter your username or paste your full GitHub profile URL
            </p>
          </div>

          <Button
            onClick={handleGitHubLogin}
            loading={loading}
            icon={Github}
            className="w-full justify-center"
            size="lg"
          >
            Continue with GitHub
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            variant="outline"
            onClick={handleDemoLogin}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full justify-center"
            size="md"
          >
            Try Demo Mode
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-text-muted mt-6"
        >
          Only public GitHub data is accessed. No password stored.
        </motion.p>
      </div>
    </div>
  )
}
