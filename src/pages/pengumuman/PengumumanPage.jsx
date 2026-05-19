import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Megaphone, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { usePengumuman } from '@/hooks/usePengumuman'
import { getPengumumanAll, createPengumuman, updatePengumuman, deletePengumuman } from '@/services/pengumumanService'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Badge, KATEGORI_BADGE } from '@/components/ui/Badge'
import { formatDate, formatRelative } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const KATEGORIS = ['akademik', 'kegiatan', 'umum', 'penting']

function PengumumanCard({ p, onEdit, onDelete, isAdmin }) {
  const [detailOpen, setDetailOpen] = useState(false)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 hover:shadow-card-hover transition-shadow cursor-pointer group"
        onClick={() => setDetailOpen(true)}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <Badge variant={KATEGORI_BADGE[p.kategori]}>{p.kategori}</Badge>
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button onClick={() => onEdit(p)} className="btn-ghost p-1 rounded text-slate-400 hover:text-primary-600"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => onDelete(p)} className="btn-ghost p-1 rounded text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-snug mb-2 line-clamp-2">{p.judul}</h3>
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{p.konten}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400">{formatRelative(p.created_at)}</p>
          {!p.is_published && <Badge variant="warning">Draft</Badge>}
        </div>
      </motion.div>

      <AnimatePresence>
        {detailOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="relative card shadow-xl max-w-lg w-full z-10 p-6">
              <button onClick={() => setDetailOpen(false)} className="absolute top-4 right-4 btn-ghost p-1 rounded-lg"><X className="w-4 h-4" /></button>
              <Badge variant={KATEGORI_BADGE[p.kategori]} className="mb-3">{p.kategori}</Badge>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{p.judul}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{p.konten}</p>
              <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">{formatDate(p.created_at)}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function PengumumanForm({ defaultValues, onSubmit, onClose, loading }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="label">Judul *</label>
        <input {...register('judul', { required: true })} className="input" />
      </div>
      <div className="space-y-1">
        <label className="label">Konten *</label>
        <textarea {...register('konten', { required: true })} rows={5} className="input resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="label">Kategori</label>
          <select {...register('kategori')} className="input">
            {KATEGORIS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_published')} className="w-4 h-4 rounded text-primary-600" defaultChecked />
            <span className="text-sm text-slate-700 dark:text-slate-300">Publish sekarang</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Menyimpan...' : 'Simpan'}</button>
      </div>
    </form>
  )
}

export default function PengumumanPage() {
  const { isAdmin } = useAuth()
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [editData, setEditData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [allData, setAllData] = useState([])

  const { data: publishedData } = usePengumuman({ kategori: kategoriFilter })

  useEffect(() => {
    if (isAdmin) getPengumumanAll().then(setAllData)
  }, [isAdmin])

  const displayData = isAdmin ? allData.filter(p => !kategoriFilter || p.kategori === kategoriFilter) : publishedData

  const handleSave = async (values) => {
    setSaving(true)
    try {
      const payload = { ...values }
      if (editData) { await updatePengumuman(editData.id, payload); toast.success('Pengumuman diperbarui') }
      else { await createPengumuman(payload); toast.success('Pengumuman diterbitkan') }
      setModal(null); setEditData(null)
      if (isAdmin) getPengumumanAll().then(setAllData)
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deletePengumuman(deleteTarget.id); toast.success('Pengumuman dihapus'); setDeleteTarget(null); getPengumumanAll().then(setAllData) }
    catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="page-container">
      <PageHeader title="Pengumuman" subtitle="Informasi & pengumuman terbaru" actions={
        isAdmin && (
          <button onClick={() => { setEditData(null); setModal('form') }} className="btn-primary">
            <Plus className="w-4 h-4" /> Buat Pengumuman
          </button>
        )
      } />

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', ...KATEGORIS].map(k => (
          <button key={k} onClick={() => setKategoriFilter(k)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
              kategoriFilter === k
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
            )}>
            {k || 'Semua'}
          </button>
        ))}
      </div>

      {displayData.length === 0 ? (
        <EmptyState icon={Megaphone} title="Belum ada pengumuman" action={isAdmin && <button onClick={() => setModal('form')} className="btn-primary">Buat Pengumuman</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayData.map(p => (
            <PengumumanCard key={p.id} p={p} isAdmin={isAdmin}
              onEdit={(p) => { setEditData(p); setModal('form') }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <Modal open={modal === 'form'} onClose={() => { setModal(null); setEditData(null) }}
        title={editData ? 'Edit Pengumuman' : 'Buat Pengumuman'}>
        <PengumumanForm
          defaultValues={editData || { kategori: 'umum', is_published: true }}
          onSubmit={handleSave}
          onClose={() => { setModal(null); setEditData(null) }}
          loading={saving}
        />
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Hapus Pengumuman" message={`Hapus "${deleteTarget?.judul}"?`} loading={deleting} />
    </div>
  )
}
