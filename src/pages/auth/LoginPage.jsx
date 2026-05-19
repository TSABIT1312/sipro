import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Eye, EyeOff, GraduationCap, Lock, User, ArrowRight } from 'lucide-react'
import { login } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { isAuthenticated, role, isLoading } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [identifier, setIdentifier] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const watched = watch('identifier', '')
  const isNIM = /^\d+$/.test((watched || '').trim())

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD, { replace: true })
    }
  }, [isAuthenticated, role, isLoading])

  const onSubmit = async ({ identifier, password }) => {
    setLoading(true)
    try {
      await login(identifier, password)
    } catch (e) {
      const msg = e.message?.includes('Invalid') ? 'NIM/Email atau password salah' : e.message
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-400 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white"
              style={{ width: 80 + i * 120, height: 80 + i * 120, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SIPRO</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Sistem Informasi<br />Progres Mahasiswa
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Pantau perkembangan akademikmu — IPK, jadwal, nilai, dan pengumuman terbaru dalam satu platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            {[
              { label: 'Mahasiswa Aktif', value: '500+' },
              { label: 'Mata Kuliah', value: '120+' },
              { label: 'Program Studi', value: '12' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">SIPRO</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Masuk ke SIPRO</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {isNIM ? 'Masukkan NIM dan tanggal lahir kamu' : 'Masukkan email dan password admin'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="label">
                {isNIM ? 'NIM' : 'NIM atau Email'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('identifier', { required: 'Wajib diisi' })}
                  placeholder={isNIM ? 'Contoh: 23240857' : 'NIM atau email admin'}
                  className="input pl-9"
                  autoComplete="username"
                />
              </div>
              {errors.identifier && <p className="text-xs text-red-500">{errors.identifier.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="label">
                {isNIM ? 'Tanggal Lahir' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('password', { required: 'Wajib diisi' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder={isNIM ? 'Format: YYYY-MM-DD' : '••••••••'}
                  className="input pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              {isNIM && (
                <p className="text-[11px] text-slate-400">Password kamu adalah tanggal lahir, contoh: 2005-02-21</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Masuk <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Ingin buat akun admin?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary-600 hover:underline font-medium">
              Daftar di sini
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
