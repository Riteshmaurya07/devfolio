'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import NotificationBell from '@/components/notifications/NotificationBell';
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
  Settings
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
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 flex flex-col justify-between`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Devfolio OS
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => sidebarOpen && toggleSidebar()}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Dashboard Entry (If Admin) */}
            {user?.is_admin && (
              <div className="pt-2 mt-2 border-t border-slate-800">
                <Link
                  href="/admin"
                  onClick={() => sidebarOpen && toggleSidebar()}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    pathname.startsWith('/admin')
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : 'text-amber-400 hover:bg-amber-950/40 hover:text-amber-300'
                  }`}
                >
                  <ShieldAlert size={18} />
                  <span>Admin Panel</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* User Footer / Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between px-2">
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
            >
              <Settings size={14} />
              <span>Settings</span>
            </Link>
            {user?.username && (
              <Link
                href={`/u/${user.username}`}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                <UserIcon size={14} />
                <span>My Profile</span>
              </Link>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-900/40 text-xs font-semibold transition"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-6 backdrop-blur-md">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-slate-400 hover:text-white transition p-1"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <NotificationBell />
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="text-xs font-semibold text-slate-200">
                {user?.username || 'Developer'}
              </span>
              {user?.is_admin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin
                </span>
              )}
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
