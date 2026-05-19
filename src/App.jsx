import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AppRoutes } from './routes'
import { useAuthListener } from './hooks/useAuth'
import { useUiStore } from './store/uiStore'

function AuthListener() {
  useAuthListener()
  return null
}

export default function App() {
  const initDarkMode = useUiStore((s) => s.initDarkMode)

  useEffect(() => {
    initDarkMode()
  }, [])

  return (
    <BrowserRouter>
      <AuthListener />
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #0f172a)',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
