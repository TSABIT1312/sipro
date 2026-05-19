import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, CalendarDays, Megaphone, Plus, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { usePengumuman } from '@/hooks/usePengumuman'
import { Badge, KATEGORI_BADGE } from '@/components/ui/Badge'
import { StatsSkeleton } from '@/components/ui/Skeleton'
import { formatRelative } from '@/utils/formatDate'
import { ROUTES } from '@/constants/routes'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = ['#4DA8FF', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [prodiData, setProdiData] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: pengumuman } = usePengumuman({ limit: 4 })
  const navigate = useNavigate()

  useEffect(() => {
    async function loadStats() {
      const [
        { count: totalMhs },
        { count: totalMk },
        { count: totalJadwal },
        { count: totalPengumuman },
        { data: mhsList },
      ] = await Promise.all([
        supabase.from('mahasiswa').select('*', { count: 'exact', head: true }),
        supabase.from('mata_kuliah').select('*', { count: 'exact', head: true }),
        supabase.from('jadwal').select('*', { count: 'exact', head: true }),
        supabase.from('pengumuman').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('mahasiswa').select('prodi'),
      ])

      setStats({ totalMhs, totalMk, totalJadwal, totalPengumuman })

      if (mhsList) {
        const counts = mhsList.reduce((acc, m) => {
          const key = m.prodi || 'Lainnya'
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})
        setProdiData(Object.entries(counts).map(([name, value]) => ({ name: name.split(' ').slice(-1)[0], fullName: name, value })))
      }

      setLoading(false)
    }
    loadStats()
  }, [])

  const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

  return (
    <div className="page-container space-y-6">
      <motion.div {...fadeUp}>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Admin</h1>
        <p className="text-sm text-slate-500 mt-0.5">Selamat datang kembali. Berikut ringkasan SIPRO hari ini.</p>
      </motion.div>

      {/* Stats */}
      {loading ? <StatsSkeleton /> : (
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Mahasiswa', value: stats.totalMhs, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', href: ROUTES.ADMIN_MAHASISWA },
            { label: 'Mata Kuliah', value: stats.totalMk, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', href: ROUTES.ADMIN_JADWAL },
            { label: 'Jadwal Aktif', value: stats.totalJadwal, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', href: ROUTES.ADMIN_JADWAL },
            { label: 'Pengumuman', value: stats.totalPengumuman, icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', href: ROUTES.ADMIN_PENGUMUMAN },
          ].map((s, i) => (
            <motion.div key={s.label} {...fadeUp} transition={{ delay: 0.05 + i * 0.04 }}>
              <Link to={s.href} className="card p-4 block hover:shadow-card-hover transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">Distribusi Mahasiswa per Prodi</h3>
          {prodiData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={prodiData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, _, props) => [value, props.payload.fullName]}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {prodiData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Quick actions + pengumuman */}
        <div className="space-y-4">
          <motion.div {...fadeUp} transition={{ delay: 0.12 }} className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">Aksi Cepat</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(ROUTES.ADMIN_MAHASISWA)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Tambah Mahasiswa
              </button>
              <button
                onClick={() => navigate(ROUTES.ADMIN_PENGUMUMAN)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Buat Pengumuman
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.14 }} className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">Pengumuman Terbaru</h3>
            <div className="space-y-2.5">
              {pengumuman.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-start gap-2">
                  <Badge variant={KATEGORI_BADGE[p.kategori]} className="shrink-0 mt-0.5">{p.kategori}</Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{p.judul}</p>
                    <p className="text-[11px] text-slate-400">{formatRelative(p.created_at)}</p>
                  </div>
                </div>
              ))}
              {pengumuman.length === 0 && <p className="text-xs text-slate-400 text-center py-3">Belum ada pengumuman</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
