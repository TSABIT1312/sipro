import sql from '../_lib/db.js'
import { requireAuth, requireAdmin } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  if (req.method === 'GET') {
    const session = await requireAuth(req, res)
    if (!session) return

    const { prodi, semester } = req.query

    if (session.role === 'mahasiswa') {
      const [mhs] = await sql`select prodi, semester from mahasiswa where user_id = ${session.id}`
      const p = mhs?.prodi || prodi
      const s = mhs?.semester || semester
      const rows = await sql`
        select j.*, mk.nama as mata_kuliah_nama, mk.sks, mk.kode, mk.dosen
        from jadwal j join mata_kuliah mk on mk.id = j.mata_kuliah_id
        where (${p || null} is null or j.prodi = ${p})
        and (${s || null} is null or j.semester = ${Number(s)})
        order by j.hari, j.jam_mulai
      `
      return res.json(rows)
    }

    const rows = await sql`
      select j.*, mk.nama as mata_kuliah_nama, mk.sks, mk.kode, mk.dosen
      from jadwal j join mata_kuliah mk on mk.id = j.mata_kuliah_id
      where (${prodi || null} is null or j.prodi = ${prodi})
      and (${semester || null} is null or j.semester = ${Number(semester)})
      order by j.hari, j.jam_mulai
    `
    return res.json(rows)
  }

  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const { mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi } = req.body
    const [row] = await sql`
      insert into jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi)
      values (${mata_kuliah_id}, ${hari}, ${jam_mulai}, ${jam_selesai}, ${ruang||null}, ${semester||null}, ${prodi||null})
      returning *
    `
    return res.status(201).json(row)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
