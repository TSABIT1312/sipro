import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useJadwal } from '@/hooks/useJadwal'
import { useMahasiswaSelf } from '@/hooks/useMahasiswa'
import { getJadwalAll, createJadwal, updateJadwal, deleteJadwal } from '@/services/jadwalService'
import { getMatkulList } from '@/services/matkulService'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatTime, todayName } from '@/utils/formatDate'
import toast from 'react-hot-toast'

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const DAY_COLORS = { Senin: '#4DA8FF', Selasa: '#8b5cf6', Rabu: '#10b981', Kamis: '#f59e0b', Jumat: '#ef4444', Sabtu: '#06b6d4' }
const PRODI_OPTIONS = ['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer', 'Teknik Elektro', 'Manajemen', 'Akuntansi']

function AdminView() {
  const [jadwalList, setJadwalList] = useState([])
  const [matkul, setMatkul] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editData, setEditData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const today = todayName()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const loadData = async () => {
    setLoading(true)
    const [j, m] = await Promise.all([getJadwalAll(), getMatkulList()])
    setJadwalList(j)
    setMatkul(m)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const openCreate = () => { setEditData(null); reset({}); setModal('form') }
  const openEdit = (j) => {
    setEditData(j)
    reset({ mata_kuliah_id: j.mata_kuliah_id, hari: j.hari, jam_mulai: j.jam_mulai, jam_selesai: j.jam_selesai, ruang: j.ruang, semester: j.semester, prodi: j.prodi })
    setModal('form')
  }

  const handleSave = async (values) => {
    setSaving(true)
    try {
      if (editData) { await updateJadwal(editData.id, values); toast.success('Jadwal diperbarui') }
      else { await createJadwal(values); toast.success('Jadwal ditambahkan') }
      setModal(null)
      loadData()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteJadwal(deleteTarget.id); toast.success('Jadwal dihapus'); setDeleteTarget(null); loadData() }
    catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  const grouped = HARI.reduce((acc, h) => {
    acc[h] = jadwalList.filter((j) => j.hari === h)
    return acc
  }, {})

  return (
    <div className="page-container">
      <PageHeader title="Jadwal Kuliah" subtitle="Kelola jadwal per prodi & semester" actions={
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Tambah Jadwal</button>
      } />

      {loading ? <TableSkeleton rows={6} cols={5} /> : jadwalList.length === 0 ? (
        <EmptyState title="Belum ada jadwal" action={<button onClick={openCreate} className="btn-primary">Tambah Jadwal</button>} />
      ) : (
        <div className="space-y-4">
          {HARI.map((h) => grouped[h]?.length > 0 && (
            <motion.div key={h} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800" style={{ borderLeft: `3px solid ${DAY_COLORS[h]}` }}>
                <span className="font-semibold text-sm text-slate-700 dark:text-white">{h}</span>
                <span className="text-xs text-slate-400">{grouped[h].length} kelas</span>
                {h === today && <span className="text-[10px] bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-medium">Hari ini</span>}
              </div>
              <table className="table">
                <thead><tr><th>Mata Kuliah</th><th>Dosen</th><th>Jam</th><th>Ruang</th><th>Prodi / Sem</th><th className="text-right">Aksi</th></tr></thead>
                <tbody>
                  {grouped[h].map((j) => (
                    <tr key={j.id}>
                      <td><p className="font-medium text-xs text-slate-700 dark:text-slate-200">{j.mata_kuliah_nama}</p><p className="text-[11px] text-slate-400">{j.kode}</p></td>
                      <td className="text-xs">{j.dosen || '-'}</td>
                      <td className="text-xs font-mono">{formatTime(j.jam_mulai)} – {formatTime(j.jam_selesai)}</td>
                      <td className="text-xs">{j.ruang || '-'}</td>
                      <td className="text-xs">{j.prodi || '-'} {j.semester ? `/ Sem ${j.semester}` : ''}</td>
                      <td>
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(j)} className="btn-ghost p-1.5 text-slate-500 hover:text-primary-600"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(j)} className="btn-ghost p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editData ? 'Edit Jadwal' : 'Tambah Jadwal'}>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div className="space-y-1">
            <label className="label">Mata Kuliah *</label>
            <select {...register('mata_kuliah_id', { required: 'Wajib diisi' })} className="input">
              <option value="">Pilih mata kuliah</option>
              {matkul.map(m => <option key={m.id} value={m.id}>{m.nama} ({m.kode})</option>)}
            </select>
            {errors.mata_kuliah_id && <p className="text-xs text-red-500">{errors.mata_kuliah_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="label">Hari *</label>
              <select {...register('hari', { required: true })} className="input">
                {HARI.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Ruang</label>
              <input {...register('ruang')} className="input" placeholder="A201" />
            </div>
            <div className="space-y-1">
              <label className="label">Jam Mulai *</label>
              <input type="time" {...register('jam_mulai', { required: true })} className="input" />
            </div>
            <div className="space-y-1">
              <label className="label">Jam Selesai *</label>
              <input type="time" {...register('jam_selesai', { required: true })} className="input" />
            </div>
            <div className="space-y-1">
              <label className="label">Program Studi</label>
              <select {...register('prodi')} className="input">
                <option value="">Pilih Prodi</option>
                {PRODI_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Semester</label>
              <select {...register('semester', { valueAsNumber: true })} className="input">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Hapus Jadwal" message={`Hapus jadwal "${deleteTarget?.mata_kuliah_nama}"?`} loading={deleting} />
    </div>
  )
}

function MahasiswaView() {
  const { user } = useAuth()
  const { data: mhs } = useMahasiswaSelf(user?.id)
  const { data, loading, todaySchedule } = useJadwal(mhs ? { prodi: mhs.prodi, semester: mhs.semester } : {})
  const today = todayName()

  const grouped = HARI.reduce((acc, h) => { acc[h] = data.filter(j => j.hari === h); return acc }, {})

  return (
    <div className="page-container">
      <PageHeader title="Jadwal Kuliah" subtitle={mhs ? `${mhs.prodi} · Semester ${mhs.semester}` : ''} />
      {loading ? <TableSkeleton rows={5} cols={4} /> : data.length === 0 ? (
        <EmptyState icon={Clock} title="Belum ada jadwal" subtitle="Jadwal akan tampil setelah admin menambahkan" />
      ) : (
        <div className="space-y-4">
          {HARI.map((h) => grouped[h]?.length > 0 && (
            <motion.div key={h} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800" style={{ borderLeft: `3px solid ${DAY_COLORS[h]}` }}>
                <span className="font-semibold text-sm">{h}</span>
                {h === today && <span className="text-[10px] bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-medium">Hari ini</span>}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {grouped[h].map((j) => (
                  <div key={j.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ background: DAY_COLORS[h] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{j.mata_kuliah_nama}</p>
                      <p className="text-xs text-slate-500">{j.dosen} · {j.sks} SKS</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200">{formatTime(j.jam_mulai)} – {formatTime(j.jam_selesai)}</p>
                      <p className="text-xs text-slate-400">{j.ruang || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function JadwalPage() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminView /> : <MahasiswaView />
}
