import sql from '../_lib/db.js'
import { requireAuth } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const session = await requireAuth(req, res)
  if (!session) return

  const [user] = await sql`select id, email, role, nim, created_at from users where id = ${session.id}`
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (user.role === 'mahasiswa' && user.nim) {
    const [mhs] = await sql`select * from mahasiswa where nim = ${user.nim}`
    return res.json({ ...user, mahasiswa: mhs || null })
  }

  res.json(user)
}
