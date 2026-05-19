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
    const { mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi } = req.body
    const [row] = await sql`
      update jadwal set
        mata_kuliah_id = coalesce(${mata_kuliah_id||null}, mata_kuliah_id),
        hari = coalesce(${hari||null}, hari),
        jam_mulai = coalesce(${jam_mulai||null}, jam_mulai),
        jam_selesai = coalesce(${jam_selesai||null}, jam_selesai),
        ruang = coalesce(${ruang||null}, ruang),
        semester = coalesce(${semester||null}, semester),
        prodi = coalesce(${prodi||null}, prodi)
      where id = ${id} returning *
    `
    if (!row) return res.status(404).json({ error: 'Not found' })
    return res.json(row)
  }

  if (req.method === 'DELETE') {
    await sql`delete from jadwal where id = ${id}`
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
