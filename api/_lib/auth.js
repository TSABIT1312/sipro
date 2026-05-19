import { jwtVerify, SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

export async function getUser(req) {
  const auth = req.headers['authorization']
  if (!auth?.startsWith('Bearer ')) return null
  try {
    return await verifyToken(auth.slice(7))
  } catch {
    return null
  }
}

export async function requireAuth(req, res) {
  const user = await getUser(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}

export async function requireAdmin(req, res) {
  const user = await requireAuth(req, res)
  if (!user) return null
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  return user
}
