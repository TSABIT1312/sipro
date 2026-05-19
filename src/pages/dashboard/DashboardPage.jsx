import { useAuth } from '@/hooks/useAuth'
import AdminDashboard from './AdminDashboard'
import MahasiswaDashboard from './MahasiswaDashboard'

export default function DashboardPage() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard /> : <MahasiswaDashboard />
}
