'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import NotificationBell from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Compass,
  Bot,
  Briefcase,
  Code2,
  Globe,
  Trophy,
  BarChart3,
  Rss,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Settings,
} from 'lucide-react';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      await fetch(`${apiUrl}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      window.location.href = '/login';
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/resumes', label: 'Resumes', icon: FileText },
    { href: '/portfolio/builder', label: 'Portfolio Builder', icon: Globe },
    { href: '/roadmaps', label: 'Roadmaps', icon: Compass },
    { href: '/coding-dashboard', label: 'Coding Stats', icon: Code2 },
    { href: '/job-tracker', label: 'Job Tracker', icon: Briefcase },
    { href: '/ai-advisor', label: 'AI Advisor', icon: Bot },
    { href: '/feed', label: 'Feed', icon: Rss },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/analytics-dashboard', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 flex flex-col justify-between`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--border-subtle)]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#d9541e] flex items-center justify-center shadow-xs text-white">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                  Devfolio <span className="text-[#d9541e]">OS</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-semibold">
                  Developer Platform
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="md:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas-subtle)] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => sidebarOpen && toggleSidebar()}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#d9541e] text-white shadow-2xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas-subtle)]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-[var(--text-muted)]'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Dashboard Entry (If Admin) */}
            {user?.is_admin && (
              <div className="pt-2 mt-2 border-t border-[var(--border-subtle)]">
                <Link
                  href="/admin"
                  onClick={() => sidebarOpen && toggleSidebar()}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    pathname.startsWith('/admin')
                      ? 'bg-[#111111] dark:bg-[#f3eee3] text-white dark:text-[#111111] shadow-2xs'
                      : 'text-[#d9541e] hover:bg-[#d9541e]/10'
                  }`}
                >
                  <ShieldAlert size={16} />
                  <span>Admin Panel</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* User Footer / Controls */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
          <div className="flex items-center justify-between px-1">
            <Link
              href="/profile/edit"
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <Settings size={14} className="text-[var(--text-muted)]" />
              <span>Settings</span>
            </Link>
            {user?.username && (
              <Link
                href={`/u/${user.username}`}
                className="flex items-center gap-1 text-xs text-[#d9541e] hover:underline transition font-medium"
              >
                <UserIcon size={13} />
                <span>My Profile</span>
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-lg bg-[var(--bg-canvas-subtle)] hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 border border-[var(--border-subtle)] text-xs font-medium transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between px-6 backdrop-blur-xs transition-colors duration-200">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas-subtle)] transition"
          >
            <Menu size={20} />
          </button>

          {/* Right Header Utilities: ThemeToggle, Notifications, User Pill */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Theme Toggle (Light Cream <-> Dark Black) */}
            <ThemeToggle />

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-subtle)]">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                  {user?.username || 'Developer'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                  {user?.email || 'user@devfolio.com'}
                </span>
              </div>

              {user?.is_admin && (
                <Badge variant="burnt" size="sm">
                  Admin
                </Badge>
              )}

              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#d9541e]/15 border border-[#d9541e]/30 flex items-center justify-center text-xs font-bold text-[#d9541e]">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--bg-canvas)] transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
