-- Enable RLS on all tables
alter table profiles enable row level security;
alter table mahasiswa enable row level security;
alter table mata_kuliah enable row level security;
alter table jadwal enable row level security;
alter table nilai enable row level security;
alter table pengumuman enable row level security;

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES
create policy "own_profile_select" on profiles for select using (auth.uid() = id or is_admin());
create policy "admin_insert_profiles" on profiles for insert with check (is_admin());
create policy "admin_update_profiles" on profiles for update using (is_admin());

-- MAHASISWA
create policy "mahasiswa_self_select" on mahasiswa for select using (user_id = auth.uid() or is_admin());
create policy "admin_insert_mahasiswa" on mahasiswa for insert with check (is_admin());
create policy "admin_update_mahasiswa" on mahasiswa for update using (is_admin() or user_id = auth.uid());
create policy "admin_delete_mahasiswa" on mahasiswa for delete using (is_admin());

-- MATA KULIAH (all authenticated)
create policy "authenticated_read_matkul" on mata_kuliah for select using (auth.role() = 'authenticated');
create policy "admin_manage_matkul" on mata_kuliah for all using (is_admin());

-- JADWAL (all authenticated)
create policy "authenticated_read_jadwal" on jadwal for select using (auth.role() = 'authenticated');
create policy "admin_manage_jadwal" on jadwal for all using (is_admin());

-- NILAI
create policy "mahasiswa_self_nilai" on nilai for select using (
  is_admin() or
  mahasiswa_id in (select id from mahasiswa where user_id = auth.uid())
);
create policy "admin_manage_nilai" on nilai for all using (is_admin());

-- PENGUMUMAN
create policy "read_published_pengumuman" on pengumuman for select using (
  auth.role() = 'authenticated' and (is_published = true or is_admin())
);
create policy "admin_manage_pengumuman" on pengumuman for all using (is_admin());
