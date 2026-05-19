import { api } from '@/lib/api'

export const getJadwal = (params) => api.get('/jadwal', params)
export const getJadwalAll = () => api.get('/jadwal')
export const createJadwal = (payload) => api.post('/jadwal', payload)
export const updateJadwal = (id, payload) => api.put(`/jadwal/${id}`, payload)
export const deleteJadwal = (id) => api.delete(`/jadwal/${id}`)
