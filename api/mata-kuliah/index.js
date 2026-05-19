import sql from '../_lib/db.js'
import { requireAuth } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  const session = await requireAuth(req, res)
  if (!session) return

  if (req.method === 'GET') {
    const rows = await sql`select * from mata_kuliah order by semester, nama`
    return res.json(rows)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
