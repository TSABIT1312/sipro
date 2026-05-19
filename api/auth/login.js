import { compare } from 'bcryptjs'
import sql from '../_lib/db.js'
import { signToken } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { identifier, password } = req.body
  if (!identifier || !password) return res.status(400).json({ error: 'Missing fields' })

  const isNIM = /^\d+$/.test(identifier.trim())
  const email = isNIM ? `${identifier.trim()}@sipro.ac.id` : identifier.trim()

  const [user] = await sql`select * from users where email = ${email} limit 1`
  if (!user) return res.status(401).json({ error: 'Email atau password salah' })

  const valid = await compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Email atau password salah' })

  const token = await signToken({ id: user.id, email: user.email, role: user.role, nim: user.nim })

  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, nim: user.nim }
  })
}
