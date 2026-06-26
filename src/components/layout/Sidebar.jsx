import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Github,
  Code2,
  FileText,
  FolderKanban,
  Briefcase,
  Flame,
  Bot,
  GitCompare,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Settings,
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useSidebar } from '@/store/sidebarContext.jsx'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/github', icon: Github, label: 'GitHub' },
  { to: '/coding', icon: Code2, label: 'Coding' },
  { to: '/resume', icon: FileText, label: 'Resume' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/streak', icon: Flame, label: 'Streak' },
  { to: '/ai-advisor', icon: Bot, label: 'AI Advisor' },
  { to: '/compare', icon: GitCompare, label: 'Compare' },
]

export default function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen bg-surface border-r border-border fixed left-0 top-0 z-30 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet flex items-center justify-center flex-shrink-0 glow-violet">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-sm text-text-primary whitespace-nowrap"
              >
                DevFolio OS
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-violet/15 text-violet-light border-l-2 border-violet ml-0 pl-[9px]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-violet-light' : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-md text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile + Collapse */}
      <div className="border-t border-border px-2 py-3 flex-shrink-0 space-y-0.5">
        {/* Settings link */}
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all group"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Public Profile link */}
        <NavLink
          to={`/profile/${user?.login}`}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all group"
        >
          <User className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Public Profile
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.login}`}
            alt={user?.name}
            className="w-7 h-7 rounded-full flex-shrink-0 ring-1 ring-border"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="text-xs font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-2xs text-text-muted truncate">@{user?.login}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-violet transition-all z-40"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  )
}
