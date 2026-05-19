import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  Megaphone,
  UserCircle,
  Settings,
} from 'lucide-react'
import { ROUTES } from './routes'

export const MAHASISWA_MENU = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { label: 'Jadwal Kuliah', icon: CalendarDays, path: ROUTES.JADWAL },
  { label: 'Nilai Akademik', icon: BookOpen, path: ROUTES.NILAI },
  { label: 'Pengumuman', icon: Megaphone, path: ROUTES.PENGUMUMAN },
  { label: 'Profile', icon: UserCircle, path: ROUTES.PROFILE },
  { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
]

export const ADMIN_MENU = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD },
  { label: 'Data Mahasiswa', icon: Users, path: ROUTES.ADMIN_MAHASISWA },
  { label: 'Jadwal', icon: CalendarDays, path: ROUTES.ADMIN_JADWAL },
  { label: 'Nilai', icon: BookOpen, path: ROUTES.ADMIN_NILAI },
  { label: 'Pengumuman', icon: Megaphone, path: ROUTES.ADMIN_PENGUMUMAN },
  { label: 'Profile', icon: UserCircle, path: ROUTES.ADMIN_PROFILE },
  { label: 'Settings', icon: Settings, path: ROUTES.ADMIN_SETTINGS },
]
