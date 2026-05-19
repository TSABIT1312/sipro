import { api } from '@/lib/api'

export async function getMahasiswaList({ search = '', prodi = '', semester = '' } = {}) {
  const params = {}
  if (search) params.search = search
  if (prodi) params.prodi = prodi
  if (semester) params.semester = semester
  const data = await api.get('/mahasiswa', params)
  return { data, count: data.length }
}

export const getMahasiswaById = (id) => api.get(`/mahasiswa/${id}`)
export const getMahasiswaByUserId = () => api.get('/mahasiswa')
export const createMahasiswa = (payload) => api.post('/mahasiswa', payload)
export const updateMahasiswa = (id, payload) => api.put(`/mahasiswa/${id}`, payload)
export const deleteMahasiswa = (id) => api.delete(`/mahasiswa/${id}`)
