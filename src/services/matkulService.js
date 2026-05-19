import { supabase } from '@/lib/supabase'

export async function getMatkulList() {
  const { data, error } = await supabase
    .from('mata_kuliah')
    .select('*')
    .order('nama')
  if (error) throw error
  return data
}

export async function createMatkul(payload) {
  const { data, error } = await supabase.from('mata_kuliah').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateMatkul(id, payload) {
  const { data, error } = await supabase.from('mata_kuliah').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteMatkul(id) {
  const { error } = await supabase.from('mata_kuliah').delete().eq('id', id)
  if (error) throw error
}
