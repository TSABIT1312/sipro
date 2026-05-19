import sql from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const [{ count: totalMahasiswa }] = await sql`select count(*)::int from mahasiswa`
  const [{ count: totalMataKuliah }] = await sql`select count(*)::int from mata_kuliah`
  const [{ count: totalJadwal }] = await sql`select count(*)::int from jadwal`
  const [{ count: totalPengumuman }] = await sql`select count(*)::int from pengumuman where is_published = true`

  const distribusiProdi = await sql`
    select prodi, count(*)::int as total from mahasiswa
    where prodi is not null group by prodi order by total desc
  `

  const recentNilai = await sql`
    select n.*, m.nama as mahasiswa_nama, mk.nama as mata_kuliah_nama
    from nilai n
    join mahasiswa m on m.id = n.mahasiswa_id
    join mata_kuliah mk on mk.id = n.mata_kuliah_id
    order by n.created_at desc limit 10
  `

  res.json({ totalMahasiswa, totalMataKuliah, totalJadwal, totalPengumuman, distribusiProdi, recentNilai })
}
