-- Seed: mata kuliah, jadwal, pengumuman

insert into mata_kuliah (kode, nama, sks, semester, prodi, dosen) values
  ('MK001', 'Kalkulus I', 3, 1, 'Teknik Informatika', 'Dr. Ahmad Fauzi'),
  ('MK002', 'Fisika Dasar', 2, 1, 'Teknik Informatika', 'Dr. Siti Rahayu'),
  ('MK003', 'Pengantar Teknologi Informasi', 2, 1, 'Teknik Informatika', 'Budi Santoso, M.T.'),
  ('MK004', 'Algoritma dan Pemrograman', 4, 1, 'Teknik Informatika', 'Andi Wijaya, M.Kom.'),
  ('MK005', 'Bahasa Indonesia', 2, 1, 'Teknik Informatika', 'Rini Astuti, M.Hum.'),
  ('MK006', 'Kalkulus II', 3, 2, 'Teknik Informatika', 'Dr. Ahmad Fauzi'),
  ('MK007', 'Struktur Data', 4, 2, 'Teknik Informatika', 'Andi Wijaya, M.Kom.'),
  ('MK008', 'Matematika Diskrit', 3, 2, 'Teknik Informatika', 'Dr. Hendra Kusuma'),
  ('MK009', 'Pemrograman Berorientasi Objek', 4, 3, 'Teknik Informatika', 'Dewi Permata, M.Kom.'),
  ('MK010', 'Basis Data', 3, 3, 'Teknik Informatika', 'Faisal Akbar, M.T.'),
  ('MK011', 'Sistem Operasi', 3, 3, 'Teknik Informatika', 'Yusuf Hidayat, M.T.'),
  ('MK012', 'Jaringan Komputer', 3, 4, 'Teknik Informatika', 'Rizky Pratama, M.T.'),
  ('MK013', 'Rekayasa Perangkat Lunak', 3, 5, 'Teknik Informatika', 'Nadia Putri, M.Kom.')
on conflict (kode) do nothing;

insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Senin', '08:00', '10:30', 'R. 101', 1, 'Teknik Informatika' from mata_kuliah where kode = 'MK001'
on conflict do nothing;
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Selasa', '10:00', '12:00', 'Lab A', 1, 'Teknik Informatika' from mata_kuliah where kode = 'MK002'
on conflict do nothing;
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Rabu', '08:00', '10:00', 'R. 102', 1, 'Teknik Informatika' from mata_kuliah where kode = 'MK003'
on conflict do nothing;
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Kamis', '13:00', '16:40', 'Lab B', 1, 'Teknik Informatika' from mata_kuliah where kode = 'MK004'
on conflict do nothing;
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Jumat', '09:00', '11:00', 'R. 201', 1, 'Teknik Informatika' from mata_kuliah where kode = 'MK005'
on conflict do nothing;
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Senin', '13:00', '15:30', 'R. 203', 5, 'Teknik Informatika' from mata_kuliah where kode = 'MK013'
on conflict do nothing;
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Rabu', '10:00', '13:40', 'Lab C', 3, 'Teknik Informatika' from mata_kuliah where kode = 'MK009'
on conflict do nothing;
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Kamis', '08:00', '10:30', 'Lab D', 3, 'Teknik Informatika' from mata_kuliah where kode = 'MK010'
on conflict do nothing;

insert into pengumuman (judul, konten, kategori, is_published) values
  (
    'Jadwal UAS Semester Ganjil 2024/2025',
    'Ujian Akhir Semester (UAS) akan dilaksanakan mulai tanggal 15 Januari 2025. Mahasiswa diwajibkan membawa kartu ujian yang telah divalidasi. Hadir 15 menit sebelum ujian dimulai.',
    'akademik',
    true
  ),
  (
    'Libur Nasional dan Hari Libur Kampus',
    'Kampus akan diliburkan pada tanggal 25 Desember 2024 s.d. 1 Januari 2025 dalam rangka libur Natal dan Tahun Baru. Seluruh kegiatan akademik dimulai kembali pada tanggal 6 Januari 2025.',
    'umum',
    true
  ),
  (
    'Pendaftaran KKN Gelombang II Dibuka',
    'Pendaftaran Kuliah Kerja Nyata (KKN) Gelombang II telah dibuka. Mahasiswa yang telah menyelesaikan minimal 100 SKS dapat mendaftar melalui portal akademik. Batas pendaftaran: 31 Desember 2024.',
    'kegiatan',
    true
  )
on conflict do nothing;
