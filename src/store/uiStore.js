import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUiStore = create(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      darkMode: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        if (next) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      initDarkMode: () => {
        if (get().darkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    }),
    {
      name: 'sipro-ui',
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
)
