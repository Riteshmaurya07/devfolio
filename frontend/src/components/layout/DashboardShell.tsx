'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Menu, X, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <span className="text-xl font-bold text-gray-800 dark:text-white">Devfolio OS</span>
          <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" onClick={() => sidebarOpen && toggleSidebar()} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/resumes" onClick={() => sidebarOpen && toggleSidebar()} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <User size={20} />
            <span>Resumes</span>
          </Link>
          <Link href="/roadmaps" onClick={() => sidebarOpen && toggleSidebar()} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Settings size={20} />
            <span>Roadmaps</span>
          </Link>
          <Link href="/ai" onClick={() => sidebarOpen && toggleSidebar()} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Settings size={20} />
            <span>AI Advisor</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
          <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4">
          <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-4 ml-auto">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.username || 'User'}</span>
            {user?.avatar_url && (
              <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
