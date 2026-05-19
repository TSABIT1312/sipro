import sql from '../_lib/db.js'
import { requireAuth, requireAdmin } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  if (req.method === 'GET') {
    const session = await requireAuth(req, res)
    if (!session) return

    const { kategori } = req.query
    const isAdmin = session.role === 'admin'

    const rows = await sql`
      select p.*, u.email as author_email
      from pengumuman p
      left join users u on u.id = p.author_id
      where (${isAdmin ? null : true} is null or p.is_published = true)
      and (${kategori || null} is null or p.kategori = ${kategori})
      order by p.created_at desc
    `
    return res.json(rows)
  }

  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const { judul, konten, kategori, is_published } = req.body
    const [row] = await sql`
      insert into pengumuman (judul, konten, kategori, author_id, is_published)
      values (${judul}, ${konten}, ${kategori||'umum'}, ${admin.id}, ${is_published !== false})
      returning *
    `
    return res.status(201).json(row)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
