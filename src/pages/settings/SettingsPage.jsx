import { motion } from 'framer-motion'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { PageHeader } from '@/components/shared/PageHeader'

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useUiStore()

  return (
    <div className="page-container max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Preferensi tampilan dan aplikasi" />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Tampilan</h3>
        <p className="text-xs text-slate-500 mb-5">Atur tema tampilan aplikasi</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {darkMode ? <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mode Gelap</p>
              <p className="text-xs text-slate-400">{darkMode ? 'Aktif' : 'Nonaktif'}</p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${darkMode ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <motion.span
              animate={{ x: darkMode ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm"
            />
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Notifikasi</h3>
        <p className="text-xs text-slate-500 mb-5">Pengaturan notifikasi (segera hadir)</p>
        <div className="space-y-3 opacity-50">
          {['Pengumuman baru', 'Update nilai', 'Perubahan jadwal'].map(label => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-sm text-slate-700 dark:text-slate-300">{label}</p>
              <div className="h-6 w-11 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1 text-sm">Tentang SIPRO</h3>
        <div className="text-xs text-slate-500 space-y-1 mt-3">
          <p>Versi 1.0.0</p>
          <p>Sistem Informasi Progres Mahasiswa</p>
        </div>
      </motion.div>
    </div>
  )
}
