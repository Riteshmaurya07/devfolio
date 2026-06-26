import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import useAuthStore from '@/store/authStore'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/github': 'GitHub Analytics',
  '/coding': 'Coding Stats',
  '/resume': 'Resume Builder',
  '/projects': 'Project Tracker',
  '/jobs': 'Job Tracker',
  '/streak': 'Habit Tracker',
  '/ai-advisor': 'AI Advisor',
  '/compare': 'Compare Profiles',
  '/settings': 'Account Settings',
}

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuthStore()

  const title =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/profile') ? 'Public Profile' : 'DevFolio OS')

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
        <p className="text-2xs text-text-muted hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          id="navbar-notifications"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.login}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full ring-2 ring-violet/30"
          />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-text-primary">{user?.name}</p>
            <p className="text-2xs text-text-muted">@{user?.login}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
