import sql from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { setCors, handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (handleOptions(req, res)) return

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const { id } = req.query

  if (req.method === 'GET') {
    const [mhs] = await sql`select * from mahasiswa where id = ${id}`
    if (!mhs) return res.status(404).json({ error: 'Not found' })
    return res.json(mhs)
  }

  if (req.method === 'PUT') {
    const { nama, tanggal_lahir, email, no_hp, alamat, fakultas, prodi, semester } = req.body
    const [mhs] = await sql`
      update mahasiswa set
        nama = coalesce(${nama||null}, nama),
        tanggal_lahir = coalesce(${tanggal_lahir||null}, tanggal_lahir),
        email = coalesce(${email||null}, email),
        no_hp = coalesce(${no_hp||null}, no_hp),
        alamat = coalesce(${alamat||null}, alamat),
        fakultas = coalesce(${fakultas||null}, fakultas),
        prodi = coalesce(${prodi||null}, prodi),
        semester = coalesce(${semester||null}, semester)
      where id = ${id}
      returning *
    `
    if (!mhs) return res.status(404).json({ error: 'Not found' })
    return res.json(mhs)
  }

  if (req.method === 'DELETE') {
    await sql`delete from mahasiswa where id = ${id}`
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
