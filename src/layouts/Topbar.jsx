import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun, Bell, LogOut, UserCircle, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import toast from 'react-hot-toast'

export function Topbar() {
  const [dropOpen, setDropOpen] = useState(false)
  const { toggleSidebar, toggleDarkMode, darkMode } = useUiStore()
  const { user, profile, isAdmin } = useAuth()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      clearAuth()
      navigate(ROUTES.LOGIN)
    } catch {
      toast.error('Gagal logout')
    }
  }

  const profilePath = isAdmin ? ROUTES.ADMIN_PROFILE : ROUTES.PROFILE
  const settingsPath = isAdmin ? ROUTES.ADMIN_SETTINGS : ROUTES.SETTINGS

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 shrink-0">
      <button onClick={toggleSidebar} className="btn-ghost p-2 rounded-lg lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Dark mode */}
      <button onClick={toggleDarkMode} className="btn-ghost p-2 rounded-lg" title="Toggle dark mode">
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Notif placeholder */}
      <button className="btn-ghost p-2 rounded-lg relative" title="Notifikasi">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropRef}>
        <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Avatar name={profile?.nama || user?.email} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight max-w-[120px] truncate">
              {profile?.nama || user?.email}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">{profile?.role}</p>
          </div>
        </button>

        <AnimatePresence>
          {dropOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.14 }}
              className="absolute right-0 top-full mt-1 w-48 card shadow-lg z-50 py-1"
            >
              <button
                onClick={() => { navigate(profilePath); setDropOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <UserCircle className="w-4 h-4 text-slate-400" />
                Profile
              </button>
              <button
                onClick={() => { navigate(settingsPath); setDropOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
