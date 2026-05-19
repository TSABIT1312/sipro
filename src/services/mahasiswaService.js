import { supabase } from '@/lib/supabase'

export async function getMahasiswaList({ search = '', prodi = '', semester = '', page = 1, limit = 10 } = {}) {
  let query = supabase
    .from('mahasiswa')
    .select('*', { count: 'exact' })
    .order('nama', { ascending: true })

  if (search) query = query.or(`nama.ilike.%${search}%,nim.ilike.%${search}%`)
  if (prodi) query = query.eq('prodi', prodi)
  if (semester) query = query.eq('semester', Number(semester))

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export async function getMahasiswaById(id) {
  const { data, error } = await supabase
    .from('mahasiswa')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getMahasiswaByUserId(userId) {
  const { data, error } = await supabase
    .from('mahasiswa')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

export async function createMahasiswa(payload) {
  const { data, error } = await supabase.from('mahasiswa').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateMahasiswa(id, payload) {
  const { data, error } = await supabase
    .from('mahasiswa')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMahasiswa(id) {
  const { error } = await supabase.from('mahasiswa').delete().eq('id', id)
  if (error) throw error
}

export async function uploadFoto(file, nim) {
  const ext = file.name.split('.').pop()
  const path = `avatars/${nim}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
