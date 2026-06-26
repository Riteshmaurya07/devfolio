import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'

import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import GitHub from '@/pages/GitHub'
import Coding from '@/pages/Coding'
import Resume from '@/pages/Resume'
import Projects from '@/pages/Projects'
import Jobs from '@/pages/Jobs'
import Streak from '@/pages/Streak'
import AIAdvisor from '@/pages/AIAdvisor'
import Compare from '@/pages/Compare'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'

import useAuthStore from '@/store/authStore'
import { SidebarProvider, useSidebar } from '@/store/sidebarContext.jsx'

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout />
}

// Main app layout with sidebar + navbar
function AppLayout() {
  const location = useLocation()
  const { collapsed } = useSidebar()
  const isResume = location.pathname === '/resume'

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? (collapsed ? 64 : 240) : 0 }}
      >
        <Navbar />
        <main className={`flex-1 ${isResume ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SidebarProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16161A',
            color: '#F1F1F3',
            border: '1px solid #1E1E22',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#16161A' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#16161A' },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:username" element={<Profile />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/github" element={<GitHub />} />
          <Route path="/coding" element={<Coding />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/streak" element={<Streak />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SidebarProvider>
  )
}
