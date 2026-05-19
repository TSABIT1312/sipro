import { supabase } from '@/lib/supabase'

export async function getPengumuman({ kategori = '', limit = 50 } = {}) {
  let query = supabase
    .from('pengumuman')
    .select('*, profiles(id)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (kategori) query = query.eq('kategori', kategori)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPengumumanAll() {
  const { data, error } = await supabase
    .from('pengumuman')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPengumuman(payload) {
  const { data, error } = await supabase.from('pengumuman').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updatePengumuman(id, payload) {
  const { data, error } = await supabase.from('pengumuman').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePengumuman(id) {
  const { error } = await supabase.from('pengumuman').delete().eq('id', id)
  if (error) throw error
}
