import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Camera, Save, Lock, User, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMahasiswaSelf } from '@/hooks/useMahasiswa'
import { useAuthStore } from '@/store/authStore'
import { updateMahasiswa } from '@/services/mahasiswaService'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const { data: mhs, loading } = useMahasiswaSelf(user?.id)
  const mahasiswa = useAuthStore(s => s.mahasiswa)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)
  const fileRef = useRef()

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: mhs ? {
      nama: mhs.nama, email: mhs.email || '', no_hp: mhs.no_hp || '',
      alamat: mhs.alamat || '', fakultas: mhs.fakultas || '',
    } : {}
  })

  const { register: regPass, handleSubmit: handlePass, reset: resetPass, watch, formState: { errors: errPass } } = useForm()

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !mhs) return
    setUploadingPhoto(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        await updateMahasiswa(mhs.id, { foto_url: ev.target.result })
        setPhotoUrl(ev.target.result)
        toast.success('Foto profil diperbarui')
        setUploadingPhoto(false)
      }
      reader.readAsDataURL(file)
    } catch (e) {
      toast.error(e.message)
      setUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async (values) => {
    if (!mhs) return
    setSavingProfile(true)
    try {
      await updateMahasiswa(mhs.id, values)
      toast.success('Profil berhasil diperbarui')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePassword = async ({ current_password, password }) => {
    setSavingPass(true)
    try {
      await api.put('/profile', { current_password, new_password: password })
      toast.success('Password berhasil diubah')
      resetPass()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingPass(false)
    }
  }

  const currentPhoto = photoUrl || mhs?.foto_url

  return (
    <div className="page-container max-w-3xl space-y-6">
      <PageHeader title="Profile" subtitle="Kelola informasi akun kamu" />

      {/* Photo */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={mhs?.nama || user?.email} src={currentPhoto} size="xl" />
            {!isAdmin && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                {uploadingPhoto ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">{mhs?.nama || user?.email}</h2>
            <p className="text-sm text-slate-500">{isAdmin ? 'Administrator' : `${mhs?.prodi} · Semester ${mhs?.semester}`}</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Profile form — only for mahasiswa */}
      {!isAdmin && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" /> Informasi Pribadi
          </h3>
          <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="label">Nama Lengkap</label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('nama')} className="input pl-9" /></div>
              </div>
              <div className="space-y-1">
                <label className="label">Email</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" {...register('email')} className="input pl-9" /></div>
              </div>
              <div className="space-y-1">
                <label className="label">No. HP</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('no_hp')} className="input pl-9" /></div>
              </div>
              <div className="space-y-1">
                <label className="label">Fakultas</label>
                <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('fakultas')} className="input pl-9" /></div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="label">Alamat</label>
                <div className="relative"><MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea {...register('alamat')} rows={2} className="input pl-9 resize-none" /></div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                <Save className="w-4 h-4" /> {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary-600" /> Ganti Password
        </h3>
        <form onSubmit={handlePass(handleSavePassword)} className="space-y-4 max-w-sm">
          <div className="space-y-1">
            <label className="label">Password Lama</label>
            <input type="password" {...regPass('current_password', { required: true })} className="input" />
          </div>
          <div className="space-y-1">
            <label className="label">Password Baru</label>
            <input type="password" {...regPass('password', { required: true, minLength: { value: 6, message: 'Min. 6 karakter' } })} className="input" placeholder="Min. 6 karakter" />
            {errPass.password && <p className="text-xs text-red-500">{errPass.password.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="label">Konfirmasi Password</label>
            <input type="password" {...regPass('konfirmasi', { validate: v => v === watch('password') || 'Password tidak cocok' })} className="input" />
            {errPass.konfirmasi && <p className="text-xs text-red-500">{errPass.konfirmasi.message}</p>}
          </div>
          <button type="submit" disabled={savingPass} className="btn-primary">
            <Lock className="w-4 h-4" /> {savingPass ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">Informasi Akun</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role, className: 'capitalize' },
            { label: 'NIM', value: mhs?.nim || '-' },
            { label: 'Bergabung', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-slate-400">{f.label}</p>
              <p className={`font-medium text-slate-700 dark:text-slate-200 text-xs mt-0.5 ${f.className || ''}`}>{f.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
