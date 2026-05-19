import { create } from 'zustand'
import { clearToken } from '@/lib/api'

export const useAuthStore = create((set) => ({
  user: null,       // { id, email, role, nim }
  mahasiswa: null,  // mahasiswa row (if role=mahasiswa)
  isLoading: true,

  setLoading: (isLoading) => set({ isLoading }),

  setAuth: (user, mahasiswa = null) => set({ user, mahasiswa, isLoading: false }),

  clearAuth: () => {
    clearToken()
    set({ user: null, mahasiswa: null, isLoading: false })
  },
}))
