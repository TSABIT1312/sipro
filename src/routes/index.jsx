import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'
import { ROUTES } from '@/constants/routes'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import MahasiswaPage from '@/pages/mahasiswa/MahasiswaPage'
import JadwalPage from '@/pages/jadwal/JadwalPage'
import NilaiPage from '@/pages/nilai/NilaiPage'
import PengumumanPage from '@/pages/pengumuman/PengumumanPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import SettingsPage from '@/pages/settings/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Mahasiswa routes */}
      <Route element={<ProtectedRoute requiredRole="mahasiswa" />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.JADWAL} element={<JadwalPage />} />
          <Route path={ROUTES.NILAI} element={<NilaiPage />} />
          <Route path={ROUTES.PENGUMUMAN} element={<PengumumanPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.ADMIN_MAHASISWA} element={<MahasiswaPage />} />
          <Route path={ROUTES.ADMIN_JADWAL} element={<JadwalPage />} />
          <Route path={ROUTES.ADMIN_NILAI} element={<NilaiPage />} />
          <Route path={ROUTES.ADMIN_PENGUMUMAN} element={<PengumumanPage />} />
          <Route path={ROUTES.ADMIN_PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}
