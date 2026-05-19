# SIPRO — Sistem Informasi Progres Mahasiswa

Dashboard akademik universitas modern dengan dua role: **Admin** dan **Mahasiswa**.

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **State**: Zustand, React Hook Form

---

## Prerequisites

- Node.js 18+
- Akun [Supabase](https://supabase.com) (gratis)

---

## 1. Setup Supabase

### 1.1 Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project
2. Catat **Project URL** dan **Anon Key** dari Settings > API

### 1.2 Jalankan SQL

Di Supabase **SQL Editor**, jalankan file berikut secara berurutan:

```bash
# 1. Schema (tabel, index, trigger)
supabase/schema.sql

# 2. RLS Policies
supabase/rls.sql

# 3. Seed data (mata kuliah, jadwal, pengumuman contoh)
supabase/seed.sql
```

### 1.3 Buat Storage Bucket

Di Supabase > **Storage** → New Bucket:
- Name: `avatars`
- Public: ✅ (centang)

---

## 2. Install & Konfigurasi

```bash
# Clone / masuk ke folder project
cd D:\sipro

# Install dependencies
npm install

# Setup env
cp .env.local.example .env.local   # atau buat manual
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

---

## 3. Import Data Mahasiswa dari CSV

Script ini membuat akun Supabase Auth + insert ke database untuk semua mahasiswa di CSV.

**Butuh Service Role Key** (Settings > API > `service_role`):

```bash
# Set env vars (jangan commit service_role key!)
$env:SUPABASE_URL="https://xxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJxxx..."

# Jalankan script (path CSV opsional, default: data_dummy_mahasiswa.csv)
node scripts/import-csv.js C:\Users\user\Downloads\data_dummy_mahasiswa.csv
```

Output:
```
✅ 23240857 — Sutan Pangestu Rahmawati, S.E.I
✅ 23131919 — Violet Purnawati
...
📊 Selesai: 50 berhasil, 0 dilewati, 0 gagal
```

### Format Login Mahasiswa

| Field    | Value                        |
|----------|------------------------------|
| Username | NIM (e.g. `23240857`)        |
| Password | Tanggal lahir (`2005-02-21`) |

---

## 4. Buat Akun Admin

1. Jalankan app (`npm run dev`)
2. Buka `/register`
3. Isi form → akun admin dibuat
4. Login di `/login` dengan email & password

---

## 5. Jalankan Project

```bash
npm run dev
```

Buka **http://localhost:5173**

---

## Struktur Folder

```
src/
├── components/     # UI components (Button, Modal, Badge, dll)
├── layouts/        # AppLayout, Sidebar, Topbar
├── pages/          # Halaman per fitur
├── routes/         # ProtectedRoute + route definitions
├── hooks/          # Custom hooks
├── services/       # Supabase queries
├── store/          # Zustand stores (auth, UI)
├── lib/            # Supabase client
├── utils/          # Helpers (IPK, nilai converter, dll)
└── constants/      # Routes, menu items
```

## Halaman

| Path                    | Role      | Deskripsi                          |
|-------------------------|-----------|-------------------------------------|
| `/login`                | Semua     | Login mahasiswa & admin             |
| `/register`             | -         | Daftar akun admin                   |
| `/dashboard`            | Mahasiswa | IPK, jadwal hari ini, grafik nilai  |
| `/jadwal`               | Mahasiswa | Jadwal kuliah mingguan              |
| `/nilai`                | Mahasiswa | Nilai per semester + IPK            |
| `/pengumuman`           | Mahasiswa | Baca pengumuman                     |
| `/profile`              | Mahasiswa | Edit profil + foto                  |
| `/settings`             | Mahasiswa | Dark mode toggle                    |
| `/admin/dashboard`      | Admin     | Statistik + distribusi mahasiswa    |
| `/admin/mahasiswa`      | Admin     | CRUD mahasiswa                      |
| `/admin/jadwal`         | Admin     | CRUD jadwal                         |
| `/admin/nilai`          | Admin     | Input nilai mahasiswa               |
| `/admin/pengumuman`     | Admin     | Buat & kelola pengumuman            |

---

## Build untuk Production

```bash
npm run build
npm run preview
```
