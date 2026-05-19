import { api } from '@/lib/api'
import { angkaToHuruf } from '@/utils/nilaiConverter'

export const getNilaiByMahasiswa = (mahasiswaId) => api.get('/nilai', { mahasiswa_id: mahasiswaId })
export const getNilaiAll = (params) => api.get('/nilai', params)

export async function upsertNilai(payload) {
  const { huruf, bobot } = angkaToHuruf(payload.nilai_angka)
  return api.post('/nilai', { ...payload, nilai_huruf: huruf, bobot })
}

export const deleteNilai = (id) => api.delete(`/nilai/${id}`)
