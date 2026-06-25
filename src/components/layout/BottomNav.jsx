import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Github,
  Code2,
  Briefcase,
  Flame,
  Bot,
} from 'lucide-react'

const BOTTOM_NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/github', icon: Github, label: 'GitHub' },
  { to: '/coding', icon: Code2, label: 'Coding' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/streak', icon: Flame, label: 'Streak' },
  { to: '/ai-advisor', icon: Bot, label: 'AI' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-30 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'text-violet-light'
                  : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-2xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
