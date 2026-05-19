import { supabase } from '@/lib/supabase'
import { angkaToHuruf } from '@/utils/nilaiConverter'

export async function getNilaiByMahasiswa(mahasiswaId) {
  const { data, error } = await supabase
    .from('nilai')
    .select('*, mata_kuliah(id, nama, kode, sks)')
    .eq('mahasiswa_id', mahasiswaId)
    .order('semester', { ascending: true })
  if (error) throw error
  return data
}

export async function getNilaiAll({ search = '', page = 1, limit = 20 } = {}) {
  let query = supabase
    .from('nilai')
    .select('*, mahasiswa(id, nama, nim), mata_kuliah(id, nama, kode, sks)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`mahasiswa.nama.ilike.%${search}%,mahasiswa.nim.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export async function upsertNilai(payload) {
  const { nilai_angka } = payload
  const { huruf, bobot } = angkaToHuruf(nilai_angka)
  const full = { ...payload, nilai_huruf: huruf, bobot }

  const { data, error } = await supabase
    .from('nilai')
    .upsert(full, { onConflict: 'mahasiswa_id,mata_kuliah_id,semester' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNilai(id) {
  const { error } = await supabase.from('nilai').delete().eq('id', id)
  if (error) throw error
}
