-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (bridge auth.users <-> app data)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'mahasiswa')),
  nim varchar(12) unique,
  nama varchar(255),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MAHASISWA
create table mahasiswa (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  nim varchar(12) unique not null,
  nama varchar(255) not null,
  tanggal_lahir date not null,
  email varchar(255),
  no_hp varchar(20),
  alamat text,
  fakultas varchar(100),
  prodi varchar(100),
  semester smallint check (semester between 1 and 14),
  foto_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MATA KULIAH
create table mata_kuliah (
  id uuid primary key default uuid_generate_v4(),
  kode varchar(10) unique not null,
  nama varchar(255) not null,
  sks smallint not null check (sks > 0),
  semester smallint,
  prodi varchar(100),
  dosen varchar(255),
  created_at timestamptz default now()
);

-- JADWAL
create table jadwal (
  id uuid primary key default uuid_generate_v4(),
  mata_kuliah_id uuid not null references mata_kuliah(id) on delete cascade,
  hari text not null check (hari in ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')),
  jam_mulai time not null,
  jam_selesai time not null,
  ruang varchar(50),
  semester smallint,
  prodi varchar(100),
  created_at timestamptz default now()
);

-- NILAI
create table nilai (
  id uuid primary key default uuid_generate_v4(),
  mahasiswa_id uuid not null references mahasiswa(id) on delete cascade,
  mata_kuliah_id uuid not null references mata_kuliah(id) on delete cascade,
  semester smallint not null,
  tahun_ajaran varchar(10),
  nilai_angka numeric(4,2) check (nilai_angka >= 0 and nilai_angka <= 100),
  nilai_huruf varchar(2),
  bobot numeric(3,2),
  created_at timestamptz default now(),
  unique(mahasiswa_id, mata_kuliah_id, semester)
);

-- PENGUMUMAN
create table pengumuman (
  id uuid primary key default uuid_generate_v4(),
  judul varchar(255) not null,
  konten text not null,
  kategori text default 'umum' check (kategori in ('akademik','kegiatan','umum','penting')),
  author_id uuid references profiles(id) on delete set null,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDEXES
create index idx_mahasiswa_nim on mahasiswa(nim);
create index idx_mahasiswa_user_id on mahasiswa(user_id);
create index idx_mahasiswa_prodi_semester on mahasiswa(prodi, semester);
create index idx_nilai_mahasiswa on nilai(mahasiswa_id);
create index idx_jadwal_filter on jadwal(hari, prodi, semester);
create index idx_pengumuman_published on pengumuman(is_published, created_at desc);

-- Trigger: auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles
  for each row execute function update_updated_at();
create trigger trg_mahasiswa_updated before update on mahasiswa
  for each row execute function update_updated_at();
create trigger trg_pengumuman_updated before update on pengumuman
  for each row execute function update_updated_at();
