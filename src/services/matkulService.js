import { api } from '@/lib/api'

export const getMatkulList = () => api.get('/mata-kuliah')
export const createMatkul = (payload) => api.post('/mata-kuliah', payload)
export const updateMatkul = (id, payload) => api.put(`/mata-kuliah/${id}`, payload)
export const deleteMatkul = (id) => api.delete(`/mata-kuliah/${id}`)
