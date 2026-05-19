import { hash } from 'bcryptjs'
import sql from '../_lib/db.js'
import { signToken } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password, nama } = req.body
  if (!email || !password || !nama) return res.status(400).json({ error: 'Missing fields' })

  const [existing] = await sql`select id from users where email = ${email} limit 1`
  if (existing) return res.status(409).json({ error: 'Email sudah digunakan' })

  const password_hash = await hash(password, 12)
  const [user] = await sql`
    insert into users (email, password_hash, role)
    values (${email}, ${password_hash}, 'admin')
    returning id, email, role, nim
  `

  const token = await signToken({ id: user.id, email: user.email, role: user.role, nim: user.nim })
  res.status(201).json({ token, user })
}
