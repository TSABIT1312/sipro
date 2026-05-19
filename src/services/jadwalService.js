import { supabase } from '@/lib/supabase'

export async function getJadwal({ prodi = '', semester = '' } = {}) {
  let query = supabase
    .from('jadwal')
    .select('*, mata_kuliah(id, nama, kode, sks, dosen)')
    .order('hari')
    .order('jam_mulai')

  if (prodi) query = query.eq('prodi', prodi)
  if (semester) query = query.eq('semester', Number(semester))

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getJadwalAll() {
  const { data, error } = await supabase
    .from('jadwal')
    .select('*, mata_kuliah(id, nama, kode, sks, dosen)')
    .order('hari')
    .order('jam_mulai')
  if (error) throw error
  return data
}

export async function createJadwal(payload) {
  const { data, error } = await supabase.from('jadwal').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateJadwal(id, payload) {
  const { data, error } = await supabase.from('jadwal').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteJadwal(id) {
  const { error } = await supabase.from('jadwal').delete().eq('id', id)
  if (error) throw error
}
