import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Eye, EyeOff, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react'
import { registerAdmin } from '@/services/authService'
import { ROUTES } from '@/constants/routes'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ email, nama, password }) => {
    setLoading(true)
    try {
      await registerAdmin({ email, nama, password })
      toast.success('Akun admin berhasil dibuat! Silakan login.')
      navigate(ROUTES.LOGIN)
    } catch (e) {
      toast.error(e.message || 'Gagal membuat akun')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">SIPRO</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Daftar Akun Admin</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Akun admin dapat mengelola seluruh data SIPRO.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="label">Nama Lengkap</label>
            <input
              {...register('nama', { required: 'Wajib diisi' })}
              placeholder="Nama lengkap admin"
              className="input"
            />
            {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="label">Email</label>
            <input
              {...register('email', { required: 'Wajib diisi', pattern: { value: /\S+@\S+\.\S+/, message: 'Email tidak valid' } })}
              type="email"
              placeholder="email@domain.com"
              className="input"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="label">Password</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Wajib diisi', minLength: { value: 6, message: 'Minimal 6 karakter' } })}
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 karakter"
                className="input pr-10"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="label">Konfirmasi Password</label>
            <input
              {...register('konfirmasi', {
                required: 'Wajib diisi',
                validate: (v) => v === watch('password') || 'Password tidak cocok',
              })}
              type="password"
              placeholder="Ulangi password"
              className="input"
            />
            {errors.konfirmasi && <p className="text-xs text-red-500">{errors.konfirmasi.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mendaftarkan...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                Daftar Sekarang <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <Link to={ROUTES.LOGIN} className="flex items-center gap-1.5 justify-center mt-6 text-xs text-slate-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Sudah punya akun? Masuk
        </Link>
      </motion.div>
    </div>
  )
}
