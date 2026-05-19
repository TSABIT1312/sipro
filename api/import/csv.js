import { hash } from 'bcryptjs'
import sql from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { rows } = req.body // [{ nim, nama, tanggal_lahir, prodi, semester, ... }]
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'No rows' })

  let success = 0, skipped = 0, failed = 0, errors = []

  for (const row of rows) {
    try {
      const { nim, nama, tanggal_lahir, prodi, semester, fakultas } = row
      if (!nim || !nama || !tanggal_lahir) { skipped++; continue }

      const email = `${nim}@sipro.ac.id`
      const password_hash = await hash(tanggal_lahir, 12)

      const [existing] = await sql`select id from users where email = ${email} limit 1`
      if (existing) { skipped++; continue }

      const [user] = await sql`
        insert into users (email, password_hash, role, nim)
        values (${email}, ${password_hash}, 'mahasiswa', ${nim})
        returning id
      `
      await sql`
        insert into mahasiswa (user_id, nim, nama, tanggal_lahir, prodi, semester, fakultas)
        values (${user.id}, ${nim}, ${nama}, ${tanggal_lahir}, ${prodi||null}, ${semester ? Number(semester) : null}, ${fakultas||null})
        on conflict (nim) do nothing
      `
      success++
    } catch (e) {
      failed++
      errors.push({ nim: row.nim, error: e.message })
    }
  }

  res.json({ success, skipped, failed, errors })
}
