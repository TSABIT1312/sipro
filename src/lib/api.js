const BASE = '/api'

function getToken() {
  return localStorage.getItem('sipro_token')
}

export function setToken(token) {
  localStorage.setItem('sipro_token', token)
}

export function clearToken() {
  localStorage.removeItem('sipro_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  get: (path, params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(path + qs)
  },
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
