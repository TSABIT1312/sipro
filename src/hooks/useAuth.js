import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export function useAuthListener() {
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('sipro_token')
    if (!token) {
      clearAuth()
      return
    }
    api.get('/auth/me')
      .then(data => setAuth(data, data.mahasiswa || null))
      .catch(() => clearAuth())
  }, [])
}

export function useAuth() {
  const { user, mahasiswa, isLoading } = useAuthStore()
  return {
    user,
    mahasiswa,
    isLoading,
    role: user?.role ?? null,
    isAdmin: user?.role === 'admin',
    isMahasiswa: user?.role === 'mahasiswa',
    isAuthenticated: !!user,
  }
}
