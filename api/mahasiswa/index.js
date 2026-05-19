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
      const { search, prodi, semester } = req.query
      let rows = await sql`
        select * from mahasiswa
        where (${search || null} is null or lower(nama) like ${'%' + (search||'').toLowerCase() + '%'} or nim like ${'%' + (search||'') + '%'})
        and (${prodi || null} is null or prodi = ${prodi})
        and (${semester || null} is null or semester = ${Number(semester)})
        order by nama
      `
      return res.json(rows)
    } else {
      const [mhs] = await sql`select * from mahasiswa where user_id = ${session.id}`
      return res.json(mhs || null)
    }
  }

  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const { nim, nama, tanggal_lahir, email, no_hp, alamat, fakultas, prodi, semester } = req.body
    const [existing] = await sql`select id from mahasiswa where nim = ${nim}`
    if (existing) return res.status(409).json({ error: 'NIM sudah ada' })

    const [mhs] = await sql`
      insert into mahasiswa (nim, nama, tanggal_lahir, email, no_hp, alamat, fakultas, prodi, semester)
      values (${nim}, ${nama}, ${tanggal_lahir}, ${email||null}, ${no_hp||null}, ${alamat||null}, ${fakultas||null}, ${prodi||null}, ${semester||null})
      returning *
    `
    return res.status(201).json(mhs)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
