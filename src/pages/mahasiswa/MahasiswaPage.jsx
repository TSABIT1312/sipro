import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Upload } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMahasiswaSelf } from '@/hooks/useMahasiswa'
import { useMahasiswaList } from '@/hooks/useMahasiswa'
import { createMahasiswa, updateMahasiswa, deleteMahasiswa } from '@/services/mahasiswaService'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/utils/formatDate'
import toast from 'react-hot-toast'

const PRODI_OPTIONS = ['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer', 'Teknik Elektro', 'Manajemen', 'Akuntansi', 'Hukum', 'Kedokteran']

function MahasiswaForm({ defaultValues, onSubmit, onClose, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <label className="label">Nama Lengkap *</label>
          <input {...register('nama', { required: 'Wajib diisi' })} className="input" />
          {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="label">NIM *</label>
          <input {...register('nim', { required: 'Wajib diisi' })} className="input" />
          {errors.nim && <p className="text-xs text-red-500">{errors.nim.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="label">Tanggal Lahir *</label>
          <input type="date" {...register('tanggal_lahir', { required: 'Wajib diisi' })} className="input" />
          {errors.tanggal_lahir && <p className="text-xs text-red-500">{errors.tanggal_lahir.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="label">Email</label>
          <input type="email" {...register('email')} className="input" />
        </div>
        <div className="space-y-1">
          <label className="label">No. HP</label>
          <input {...register('no_hp')} className="input" />
        </div>
        <div className="space-y-1">
          <label className="label">Fakultas</label>
          <input {...register('fakultas')} className="input" />
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
            {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-1">
          <label className="label">Alamat</label>
          <textarea {...register('alamat')} rows={2} className="input resize-none" />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}

function AdminView() {
  const [search, setSearch] = useState('')
  const [prodi, setProdi] = useState('')
  const [semester, setSemester] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [editData, setEditData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data, count, loading, refetch } = useMahasiswaList({ search, prodi, semester, page, limit: 10 })

  const handleSave = async (values) => {
    setSaving(true)
    try {
      if (editData) {
        await updateMahasiswa(editData.id, values)
        toast.success('Data mahasiswa diperbarui')
      } else {
        await createMahasiswa(values)
        toast.success('Mahasiswa berhasil ditambahkan')
      }
      setModal(null)
      setEditData(null)
      refetch()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMahasiswa(deleteTarget.id)
      toast.success('Mahasiswa dihapus')
      setDeleteTarget(null)
      refetch()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Data Mahasiswa"
        subtitle={`${count || 0} mahasiswa terdaftar`}
        actions={
          <button onClick={() => { setEditData(null); setModal('form') }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cari nama atau NIM..."
              className="input pl-9"
            />
          </div>
          <select value={prodi} onChange={(e) => { setProdi(e.target.value); setPage(1) }} className="input sm:w-48">
            <option value="">Semua Prodi</option>
            {PRODI_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={semester} onChange={(e) => { setSemester(e.target.value); setPage(1) }} className="input sm:w-36">
            <option value="">Semua Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <TableSkeleton rows={8} cols={5} /> : data.length === 0 ? (
          <EmptyState title="Tidak ada mahasiswa" subtitle="Tambah mahasiswa atau ubah filter pencarian" />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mahasiswa</th>
                    <th>NIM</th>
                    <th>Prodi</th>
                    <th>Semester</th>
                    <th>Tgl. Lahir</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((m) => (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.nama} src={m.foto_url} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white text-xs">{m.nama}</p>
                            <p className="text-[11px] text-slate-400">{m.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs">{m.nim}</td>
                      <td className="text-xs">{m.prodi || '-'}</td>
                      <td className="text-xs">{m.semester ? `Sem ${m.semester}` : '-'}</td>
                      <td className="text-xs">{formatDate(m.tanggal_lahir)}</td>
                      <td>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => { setEditData(m); setModal('form') }}
                            className="btn-ghost p-1.5 rounded text-slate-500 hover:text-primary-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="btn-ghost p-1.5 rounded text-slate-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={count} limit={10} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={modal === 'form'} onClose={() => { setModal(null); setEditData(null) }} title={editData ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'} size="lg">
        <MahasiswaForm defaultValues={editData || { semester: 1 }} onSubmit={handleSave} onClose={() => { setModal(null); setEditData(null) }} loading={saving} />
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Mahasiswa"
        message={`Hapus "${deleteTarget?.nama}"? Data ini tidak bisa dikembalikan.`}
        loading={deleting}
      />
    </div>
  )
}

function MahasiswaSelfView() {
  const { user } = useAuth()
  const { data: mhs, loading } = useMahasiswaSelf(user?.id)

  if (loading) return <div className="page-container"><div className="card p-8"><div className="skeleton h-32" /></div></div>
  if (!mhs) return <div className="page-container"><EmptyState title="Data mahasiswa tidak ditemukan" /></div>

  const fields = [
    { label: 'Nama Lengkap', value: mhs.nama },
    { label: 'NIM', value: mhs.nim },
    { label: 'Tanggal Lahir', value: formatDate(mhs.tanggal_lahir) },
    { label: 'Email', value: mhs.email || '-' },
    { label: 'No. HP', value: mhs.no_hp || '-' },
    { label: 'Fakultas', value: mhs.fakultas || '-' },
    { label: 'Program Studi', value: mhs.prodi || '-' },
    { label: 'Semester', value: mhs.semester ? `Semester ${mhs.semester}` : '-' },
    { label: 'Alamat', value: mhs.alamat || '-' },
  ]

  return (
    <div className="page-container">
      <PageHeader title="Data Mahasiswa" subtitle="Informasi akademik kamu" />
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <Avatar name={mhs.nama} src={mhs.foto_url} size="xl" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{mhs.nama}</h2>
            <p className="text-sm text-slate-500">{mhs.prodi} · Semester {mhs.semester}</p>
            <p className="font-mono text-xs text-slate-400 mt-1">NIM: {mhs.nim}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MahasiswaPage() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminView /> : <MahasiswaSelfView />
}
