import sql from '../_lib/db.js'
import { requireAuth, requireAdmin } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  if (req.method === 'GET') {
    const session = await requireAuth(req, res)
    if (!session) return

    if (session.role === 'admin') {
      const { mahasiswa_id } = req.query
      const rows = await sql`
        select n.*, mk.nama as mata_kuliah_nama, mk.sks, mk.kode
        from nilai n
        join mata_kuliah mk on mk.id = n.mata_kuliah_id
        where (${mahasiswa_id || null} is null or n.mahasiswa_id = ${mahasiswa_id})
        order by n.semester, mk.nama
      `
      return res.json(rows)
    } else {
      const [mhs] = await sql`select id from mahasiswa where user_id = ${session.id}`
      if (!mhs) return res.json([])
      const rows = await sql`
        select n.*, mk.nama as mata_kuliah_nama, mk.sks, mk.kode
        from nilai n
        join mata_kuliah mk on mk.id = n.mata_kuliah_id
        where n.mahasiswa_id = ${mhs.id}
        order by n.semester, mk.nama
      `
      return res.json(rows)
    }
  }

  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const { mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf, bobot } = req.body
    const [row] = await sql`
      insert into nilai (mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf, bobot)
      values (${mahasiswa_id}, ${mata_kuliah_id}, ${semester}, ${tahun_ajaran||null}, ${nilai_angka}, ${nilai_huruf}, ${bobot})
      on conflict (mahasiswa_id, mata_kuliah_id, semester)
      do update set nilai_angka = excluded.nilai_angka, nilai_huruf = excluded.nilai_huruf, bobot = excluded.bobot
      returning *
    `
    return res.status(201).json(row)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
