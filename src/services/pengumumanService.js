import { api } from '@/lib/api'

export const getPengumuman = (params) => api.get('/pengumuman', params)
export const getPengumumanAll = () => api.get('/pengumuman')
export const createPengumuman = (payload) => api.post('/pengumuman', payload)
export const updatePengumuman = (id, payload) => api.put(`/pengumuman/${id}`, payload)
export const deletePengumuman = (id) => api.delete(`/pengumuman/${id}`)
