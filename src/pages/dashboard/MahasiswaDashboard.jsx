import { motion } from 'framer-motion'
import { BookOpen, Calendar, TrendingUp, Award, Clock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useMahasiswaSelf } from '@/hooks/useMahasiswa'
import { useNilaiMahasiswa } from '@/hooks/useNilai'
import { useJadwal } from '@/hooks/useJadwal'
import { usePengumuman } from '@/hooks/usePengumuman'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, KATEGORI_BADGE } from '@/components/ui/Badge'
import { StatsSkeleton, CardSkeleton } from '@/components/ui/Skeleton'
import { ipkColor, calculateIPS } from '@/utils/calculateIPK'
import { formatTime, formatRelative } from '@/utils/formatDate'
import { ROUTES } from '@/constants/routes'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const DAY_COLORS = ['#4DA8FF', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export default function MahasiswaDashboard() {
  const { user } = useAuth()
  const { data: mhs, loading: mhsLoading } = useMahasiswaSelf(user?.id)
  const { data: nilaiList, loading: nilaiLoading, ipk, sks, semesters } = useNilaiMahasiswa(mhs?.id)
  const { todaySchedule, loading: jadwalLoading } = useJadwal(
    mhs ? { prodi: mhs.prodi, semester: mhs.semester } : {}
  )
  const { data: pengumuman } = usePengumuman({ limit: 3 })

  const TARGET_SKS = 144
  const progress = Math.min((sks / TARGET_SKS) * 100, 100)

  const chartData = semesters.map((sem) => ({
    name: `Sem ${sem}`,
    IPS: parseFloat(calculateIPS(nilaiList, sem)),
  }))

  const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

  return (
    <div className="page-container space-y-6">
      {/* Welcome */}
      {mhsLoading ? (
        <CardSkeleton />
      ) : (
        <motion.div
          {...fadeUp} transition={{ delay: 0 }}
          className="card p-5 bg-gradient-to-r from-primary-600 to-primary-400 text-white"
        >
          <div className="flex items-center gap-4">
            <Avatar name={mhs?.nama} src={mhs?.foto_url} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm">Selamat datang 👋</p>
              <h2 className="font-bold text-xl truncate">{mhs?.nama || 'Mahasiswa'}</h2>
              <p className="text-white/80 text-sm">{mhs?.prodi} · Semester {mhs?.semester}</p>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-white/60 text-xs">NIM</p>
              <p className="font-mono font-semibold">{mhs?.nim}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {nilaiLoading ? <StatsSkeleton /> : (
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'IPK', value: ipk, icon: TrendingUp, color: 'text-emerald-600', sub: ipkColor(ipk) },
            { label: 'Total SKS', value: sks, icon: BookOpen, color: 'text-blue-600', sub: 'text-blue-600' },
            { label: 'Semester', value: mhs?.semester ?? '-', icon: Calendar, color: 'text-purple-600', sub: 'text-purple-600' },
            { label: 'Mata Kuliah', value: nilaiList.length, icon: Award, color: 'text-amber-600', sub: 'text-amber-600' },
          ].map((s, i) => (
            <motion.div key={s.label} {...fadeUp} transition={{ delay: 0.05 + i * 0.04 }} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.sub}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress studi */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">Progress Studi</h3>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{sks} SKS ditempuh</span>
              <span>Target {TARGET_SKS} SKS</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
              />
            </div>
            <p className="text-right text-xs text-slate-400 mt-1">{progress.toFixed(1)}%</p>
          </motion.div>

          {/* Chart */}
          <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">Perkembangan IPS per Semester</h3>
            {chartData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-slate-400">Belum ada data nilai</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="IPS" stroke="#4DA8FF" strokeWidth={2.5} dot={{ r: 4, fill: '#4DA8FF' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Jadwal hari ini */}
          <motion.div {...fadeUp} transition={{ delay: 0.12 }} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Jadwal Hari Ini</h3>
              <Link to={ROUTES.JADWAL} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                Lihat semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {jadwalLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
            ) : todaySchedule.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Tidak ada jadwal hari ini</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySchedule.map((j, idx) => (
                  <div key={j.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ background: DAY_COLORS[idx % DAY_COLORS.length] }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{j.mata_kuliah_nama}</p>
                      <p className="text-[11px] text-slate-400">{formatTime(j.jam_mulai)} – {formatTime(j.jam_selesai)} · {j.ruang}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pengumuman */}
          <motion.div {...fadeUp} transition={{ delay: 0.17 }} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Pengumuman</h3>
              <Link to={ROUTES.PENGUMUMAN} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                Lihat semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {pengumuman.slice(0, 3).map((p) => (
                <div key={p.id} className="border-l-2 border-primary-400 pl-3">
                  <div className="flex items-start gap-2">
                    <Badge variant={KATEGORI_BADGE[p.kategori]} className="shrink-0 mt-0.5">{p.kategori}</Badge>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 line-clamp-2">{p.judul}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatRelative(p.created_at)}</p>
                </div>
              ))}
              {pengumuman.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada pengumuman</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
