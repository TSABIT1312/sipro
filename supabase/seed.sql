-- Seed: Mata Kuliah
insert into mata_kuliah (kode, nama, sks, semester, prodi, dosen) values
('TI101', 'Algoritma & Pemrograman', 3, 1, 'Teknik Informatika', 'Dr. Budi Santoso'),
('TI102', 'Matematika Diskrit', 3, 1, 'Teknik Informatika', 'Dr. Siti Rahayu'),
('TI103', 'Dasar Komputer', 2, 1, 'Teknik Informatika', 'Ir. Ahmad Fauzan'),
('TI201', 'Struktur Data', 3, 2, 'Teknik Informatika', 'Dr. Budi Santoso'),
('TI202', 'Sistem Operasi', 3, 2, 'Teknik Informatika', 'M.Kom. Dewi Lestari'),
('TI203', 'Basis Data', 3, 3, 'Teknik Informatika', 'Dr. Siti Rahayu'),
('TI301', 'Pemrograman Web', 3, 3, 'Teknik Informatika', 'M.T. Hendra Wijaya'),
('TI302', 'Jaringan Komputer', 3, 4, 'Teknik Informatika', 'Ir. Ahmad Fauzan'),
('TI401', 'Kecerdasan Buatan', 3, 5, 'Teknik Informatika', 'Dr. Budi Santoso'),
('TI402', 'Machine Learning', 3, 5, 'Teknik Informatika', 'Dr. Siti Rahayu'),
('SI101', 'Pengantar SI', 3, 1, 'Sistem Informasi', 'Prof. Andi Gunawan'),
('SI201', 'Analisis Sistem', 3, 2, 'Sistem Informasi', 'Dr. Maya Putri'),
('SI301', 'Manajemen Proyek TI', 3, 4, 'Sistem Informasi', 'Prof. Andi Gunawan');

-- Seed: Jadwal (Teknik Informatika Semester 5)
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Senin', '08:00', '10:30', 'A201', 5, 'Teknik Informatika' from mata_kuliah where kode = 'TI401';
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Selasa', '10:00', '12:30', 'B102', 5, 'Teknik Informatika' from mata_kuliah where kode = 'TI402';
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Rabu', '13:00', '15:30', 'Lab TI', 5, 'Teknik Informatika' from mata_kuliah where kode = 'TI302';

-- Seed: Jadwal (Teknik Informatika Semester 1)
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Senin', '07:00', '09:30', 'A101', 1, 'Teknik Informatika' from mata_kuliah where kode = 'TI101';
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Rabu', '08:00', '10:30', 'B201', 1, 'Teknik Informatika' from mata_kuliah where kode = 'TI102';
insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
select id, 'Jumat', '10:00', '12:00', 'Lab Dasar', 1, 'Teknik Informatika' from mata_kuliah where kode = 'TI103';

-- Seed: Pengumuman
insert into pengumuman (judul, konten, kategori, is_published) values
('Jadwal UTS Semester Ganjil 2024/2025', 'Ujian Tengah Semester akan dilaksanakan pada tanggal 18-29 November 2024. Peserta diwajibkan membawa KTM dan datang tepat waktu. Ruangan ujian akan diumumkan H-3 sebelum pelaksanaan.', 'akademik', true),
('Peringatan Hari Pahlawan', 'Dalam rangka memperingati Hari Pahlawan Nasional 10 November, seluruh civitas akademika diharapkan mengikuti upacara bendera yang akan dilaksanakan di Lapangan Utama kampus pukul 07.30 WIB.', 'kegiatan', true),
('Batas Akhir Pengisian KRS Semester Genap', 'Pengisian Kartu Rencana Studi (KRS) untuk Semester Genap 2024/2025 dibuka mulai 1 Desember 2024 s.d. 15 Desember 2024 melalui portal akademik. Mahasiswa yang tidak mengisi KRS tidak dapat mengikuti perkuliahan.', 'penting', true);
