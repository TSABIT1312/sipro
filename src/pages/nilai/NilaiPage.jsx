import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useNilaiMahasiswa } from '@/hooks/useNilai'
import { useMahasiswaSelf } from '@/hooks/useMahasiswa'
import { getNilaiAll, upsertNilai, deleteNilai } from '@/services/nilaiService'
import { getMahasiswaList } from '@/services/mahasiswaService'
import { getMatkulList } from '@/services/matkulService'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { StatsSkeleton } from '@/components/ui/Skeleton'
import { angkaToHuruf, hurufColor } from '@/utils/nilaiConverter'
import { calculateIPS, ipkColor } from '@/utils/calculateIPK'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

const COLORS = ['#4DA8FF', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

function AdminView() {
  const [nilaiList, setNilaiList] = useState([])
  const [mahasiswaList, setMahasiswaList] = useState([])
  const [matkulList, setMatkulList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState(null)

  const { register, handleSubmit, watch, reset } = useForm()
  const nilaiAngka = watch('nilai_angka')

  useEffect(() => {
    if (nilaiAngka) setPreview(angkaToHuruf(nilaiAngka))
    else setPreview(null)
  }, [nilaiAngka])

  const loadData = async () => {
    setLoading(true)
    const [n, m, mk] = await Promise.all([getNilaiAll({ limit: 50 }), getMahasiswaList({ limit: 100 }), getMatkulList()])
    setNilaiList(n.data)
    setMahasiswaList(m.data)
    setMatkulList(mk)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async (values) => {
    setSaving(true)
    try {
      await upsertNilai({ ...values, nilai_angka: parseFloat(values.nilai_angka), semester: parseInt(values.semester) })
      toast.success('Nilai disimpan')
      setModal(null)
      reset()
      loadData()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteNilai(deleteTarget.id); toast.success('Nilai dihapus'); setDeleteTarget(null); loadData() }
    catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="page-container">
      <PageHeader title="Nilai Akademik" subtitle="Input dan kelola nilai mahasiswa" actions={
        <button onClick={() => { reset(); setModal('form') }} className="btn-primary"><Plus className="w-4 h-4" /> Input Nilai</button>
      } />

      <div className="card overflow-hidden">
        {loading ? <div className="p-4"><StatsSkeleton /></div> : nilaiList.length === 0 ? (
          <EmptyState icon={BookOpen} title="Belum ada nilai" action={<button onClick={() => setModal('form')} className="btn-primary">Input Nilai</button>} />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Mahasiswa</th><th>Mata Kuliah</th><th>Semester</th><th>Nilai</th><th>Grade</th><th>SKS</th><th className="text-right">Aksi</th></tr>
              </thead>
              <tbody>
                {nilaiList.map((n) => (
                  <tr key={n.id}>
                    <td><p className="text-xs font-medium">{n.mahasiswa?.nama}</p><p className="text-[11px] text-slate-400">{n.mahasiswa?.nim}</p></td>
                    <td className="text-xs">{n.mata_kuliah?.nama}</td>
                    <td className="text-xs">Sem {n.semester}</td>
                    <td className="text-xs font-semibold">{n.nilai_angka}</td>
                    <td><Badge className={cn('badge', hurufColor(n.nilai_huruf))}>{n.nilai_huruf}</Badge></td>
                    <td className="text-xs">{n.mata_kuliah?.sks}</td>
                    <td>
                      <button onClick={() => setDeleteTarget(n)} className="btn-ghost p-1.5 text-slate-500 hover:text-red-600 float-right"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal === 'form'} onClose={() => { setModal(null); reset() }} title="Input Nilai">
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div className="space-y-1">
            <label className="label">Mahasiswa *</label>
            <select {...register('mahasiswa_id', { required: true })} className="input">
              <option value="">Pilih mahasiswa</option>
              {mahasiswaList.map(m => <option key={m.id} value={m.id}>{m.nama} ({m.nim})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="label">Mata Kuliah *</label>
            <select {...register('mata_kuliah_id', { required: true })} className="input">
              <option value="">Pilih mata kuliah</option>
              {matkulList.map(m => <option key={m.id} value={m.id}>{m.nama} ({m.kode})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="label">Semester</label>
              <select {...register('semester')} className="input">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Tahun Ajaran</label>
              <input {...register('tahun_ajaran')} placeholder="2024/2025" className="input" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="label">Nilai Angka (0–100) *</label>
            <input type="number" min="0" max="100" step="0.01" {...register('nilai_angka', { required: true })} className="input" />
            {preview && (
              <p className="text-xs text-slate-500">
                Grade: <span className={cn('font-semibold', hurufColor(preview.huruf))}>{preview.huruf}</span> · Bobot: {preview.bobot}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setModal(null); reset() }} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Hapus Nilai" message="Hapus nilai ini?" loading={deleting} />
    </div>
  )
}

function MahasiswaView() {
  const { user } = useAuth()
  const { data: mhs } = useMahasiswaSelf(user?.id)
  const { data, loading, ipk, sks, semesters } = useNilaiMahasiswa(mhs?.id)
  const [openSem, setOpenSem] = useState(null)

  const chartData = semesters.map(s => ({ name: `Sem ${s}`, IPS: parseFloat(calculateIPS(data, s)) }))
  const barData = data.map(n => ({ name: n.mata_kuliah?.kode, value: n.nilai_angka, huruf: n.nilai_huruf }))

  return (
    <div className="page-container space-y-6">
      <PageHeader title="Nilai Akademik" subtitle="Riwayat dan perkembangan nilai kamu" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'IPK', value: ipk, color: ipkColor(ipk) },
          { label: 'Total SKS', value: sks, color: 'text-blue-600' },
          { label: 'Mata Kuliah', value: data.length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-4">Tren IPS per Semester</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }} />
                <Line type="monotone" dataKey="IPS" stroke="#4DA8FF" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-4">Nilai per Mata Kuliah</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(v, _, p) => [`${v} (${p.payload.huruf})`, 'Nilai']} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {barData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Accordion per semester */}
      {loading ? <div className="skeleton h-32 rounded-xl" /> : semesters.length === 0 ? (
        <EmptyState icon={BookOpen} title="Belum ada nilai" subtitle="Nilai akan muncul setelah admin menginput" />
      ) : (
        <div className="space-y-3">
          {semesters.map(sem => {
            const semNilai = data.filter(n => n.semester === sem)
            const ips = calculateIPS(data, sem)
            return (
              <div key={sem} className="card overflow-hidden">
                <button
                  onClick={() => setOpenSem(openSem === sem ? null : sem)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">Semester {sem}</span>
                    <span className="text-xs text-slate-400">{semNilai.length} mata kuliah</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary-600">IPS: {ips}</span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', openSem === sem && 'rotate-180')} />
                  </div>
                </button>
                <AnimatePresence>
                  {openSem === sem && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <table className="table">
                        <thead><tr><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Grade</th><th>Bobot</th></tr></thead>
                        <tbody>
                          {semNilai.map(n => (
                            <tr key={n.id}>
                              <td className="text-xs">{n.mata_kuliah?.nama}</td>
                              <td className="text-xs">{n.mata_kuliah?.sks}</td>
                              <td className="text-xs font-semibold">{n.nilai_angka}</td>
                              <td><span className={cn('badge text-xs px-2 py-0.5 rounded-full', hurufColor(n.nilai_huruf))}>{n.nilai_huruf}</span></td>
                              <td className="text-xs">{n.bobot}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function NilaiPage() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminView /> : <MahasiswaView />
}
