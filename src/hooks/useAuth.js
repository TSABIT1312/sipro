import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { fetchProfile } from '@/services/authService'

export function useAuthListener() {
  const { setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id)
          setAuth(session.user, profile)
        } catch {
          setAuth(session.user, null)
        }
      } else {
        clearAuth()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await fetchProfile(session.user.id)
          setAuth(session.user, profile)
        } catch {
          setAuth(session.user, null)
        }
      } else if (event === 'SIGNED_OUT') {
        clearAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [])
}

export function useAuth() {
  const { user, profile, isLoading } = useAuthStore()
  return {
    user,
    profile,
    isLoading,
    role: profile?.role ?? null,
    isAdmin: profile?.role === 'admin',
    isMahasiswa: profile?.role === 'mahasiswa',
    isAuthenticated: !!user,
  }
}
