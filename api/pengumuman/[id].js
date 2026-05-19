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
    const { judul, konten, kategori, is_published } = req.body
    const [row] = await sql`
      update pengumuman set
        judul = coalesce(${judul||null}, judul),
        konten = coalesce(${konten||null}, konten),
        kategori = coalesce(${kategori||null}, kategori),
        is_published = coalesce(${is_published ?? null}, is_published),
        updated_at = now()
      where id = ${id} returning *
    `
    if (!row) return res.status(404).json({ error: 'Not found' })
    return res.json(row)
  }

  if (req.method === 'DELETE') {
    await sql`delete from pengumuman where id = ${id}`
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
