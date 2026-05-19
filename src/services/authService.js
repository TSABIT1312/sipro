import { api, setToken, clearToken } from '@/lib/api'

export async function login(identifier, password) {
  const data = await api.post('/auth/login', { identifier, password })
  setToken(data.token)
  return data
}

export async function registerAdmin({ email, nama, password }) {
  const data = await api.post('/auth/register', { email, nama, password })
  setToken(data.token)
  return data
}

export async function logout() {
  clearToken()
}

export async function fetchMe() {
  return api.get('/auth/me')
}
