-- SIPRO Schema for Neon PostgreSQL

-- USERS (replaces Supabase auth)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'mahasiswa')),
  nim varchar(12) unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MAHASISWA
create table if not exists mahasiswa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
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
create table if not exists mata_kuliah (
  id uuid primary key default gen_random_uuid(),
  kode varchar(10) unique not null,
  nama varchar(255) not null,
  sks smallint not null check (sks > 0),
  semester smallint,
  prodi varchar(100),
  dosen varchar(255),
  created_at timestamptz default now()
);

-- JADWAL
create table if not exists jadwal (
  id uuid primary key default gen_random_uuid(),
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
create table if not exists nilai (
  id uuid primary key default gen_random_uuid(),
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
create table if not exists pengumuman (
  id uuid primary key default gen_random_uuid(),
  judul varchar(255) not null,
  konten text not null,
  kategori text default 'umum' check (kategori in ('akademik','kegiatan','umum','penting')),
  author_id uuid references users(id) on delete set null,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_mahasiswa_nim on mahasiswa(nim);
create index if not exists idx_mahasiswa_user_id on mahasiswa(user_id);
create index if not exists idx_nilai_mahasiswa on nilai(mahasiswa_id);
create index if not exists idx_jadwal_hari on jadwal(hari, prodi, semester);
create index if not exists idx_pengumuman_published on pengumuman(is_published, created_at desc);

-- TRIGGER: auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create or replace trigger trg_users_updated before update on users
  for each row execute function update_updated_at();
create or replace trigger trg_mahasiswa_updated before update on mahasiswa
  for each row execute function update_updated_at();
create or replace trigger trg_pengumuman_updated before update on pengumuman
  for each row execute function update_updated_at();
