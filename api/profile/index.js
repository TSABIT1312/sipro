import { hash, compare } from 'bcryptjs'
import sql from '../_lib/db.js'
import { requireAuth } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  const session = await requireAuth(req, res)
  if (!session) return

  if (req.method === 'GET') {
    const [user] = await sql`select id, email, role, nim from users where id = ${session.id}`
    if (!user) return res.status(404).json({ error: 'Not found' })

    if (user.role === 'mahasiswa' && user.nim) {
      const [mhs] = await sql`select * from mahasiswa where nim = ${user.nim}`
      return res.json({ ...user, mahasiswa: mhs || null })
    }
    return res.json(user)
  }

  if (req.method === 'PUT') {
    const { nama, no_hp, alamat, current_password, new_password } = req.body

    if (new_password) {
      const [user] = await sql`select password_hash from users where id = ${session.id}`
      const valid = await compare(current_password || '', user.password_hash)
      if (!valid) return res.status(400).json({ error: 'Password lama salah' })
      const pw_hash = await hash(new_password, 12)
      await sql`update users set password_hash = ${pw_hash} where id = ${session.id}`
    }

    if (session.role === 'mahasiswa' && session.nim) {
      const [mhs] = await sql`
        update mahasiswa set
          nama = coalesce(${nama||null}, nama),
          no_hp = coalesce(${no_hp||null}, no_hp),
          alamat = coalesce(${alamat||null}, alamat)
        where nim = ${session.nim} returning *
      `
      return res.json(mhs)
    }

    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
