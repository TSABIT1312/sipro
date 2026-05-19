import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  setAuth: (user, profile) => set({ user, profile, isLoading: false }),

  clearAuth: () => set({ user: null, profile: null, isLoading: false }),

  get role() {
    return this.profile?.role ?? null
  },

  get isAdmin() {
    return this.profile?.role === 'admin'
  },

  get isMahasiswa() {
    return this.profile?.role === 'mahasiswa'
  },
}))
