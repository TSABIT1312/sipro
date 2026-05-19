import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ChevronLeft, LogOut } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { ADMIN_MENU, MAHASISWA_MENU } from '@/constants/menu'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const { mahasiswa, isAdmin, user } = useAuth()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const menu = isAdmin ? ADMIN_MENU : MAHASISWA_MENU

  const handleLogout = async () => {
    try {
      await logout()
      clearAuth()
    } catch {
      toast.error('Gagal logout')
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 h-full z-30 flex flex-col',
          'bg-gradient-to-b from-primary-700 via-primary-600 to-primary-500',
          'shadow-xl overflow-hidden',
          'lg:relative lg:z-auto'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 shrink-0 relative">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="font-bold text-white text-lg tracking-tight whitespace-nowrap"
                >
                  SIPRO
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={toggleSidebar}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors lg:flex hidden"
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.25 }}>
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </button>
        </div>

        {/* Role badge */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 mb-2"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                {isAdmin ? 'Administrator' : 'Mahasiswa'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 group',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-white/70')} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="p-2 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <Avatar name={mahasiswa?.nama || user?.email} size="sm" className="shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold text-white truncate">
                    {mahasiswa?.nama || user?.email}
                  </p>
                  <p className="text-[10px] text-white/50 truncate capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
