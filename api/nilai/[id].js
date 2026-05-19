import sql from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const { id } = req.query

  if (req.method === 'PUT') {
    const { nilai_angka, nilai_huruf, bobot, tahun_ajaran } = req.body
    const [row] = await sql`
      update nilai set nilai_angka = ${nilai_angka}, nilai_huruf = ${nilai_huruf}, bobot = ${bobot},
        tahun_ajaran = coalesce(${tahun_ajaran||null}, tahun_ajaran)
      where id = ${id} returning *
    `
    if (!row) return res.status(404).json({ error: 'Not found' })
    return res.json(row)
  }

  if (req.method === 'DELETE') {
    await sql`delete from nilai where id = ${id}`
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
