import { neon } from '@neondatabase/serverless'
import { jwtVerify, SignJWT } from 'jose'
import { compare, hash } from 'bcryptjs'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL env var is missing')
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is missing')

const sql = neon(process.env.DATABASE_URL)
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

async function signToken(payload) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret)
}

async function getSession(req) {
  const auth = req.headers['authorization']
  if (!auth?.startsWith('Bearer ')) return null
  try { return (await jwtVerify(auth.slice(7), secret)).payload } catch { return null }
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') { res.status(204).end(); return }

  // Parse path — check query param first (Vercel catch-all rewrite), then req.url
  const pathFromQuery = Array.isArray(req.query?.path) ? req.query.path.join('/') : req.query?.path
  const urlPath = pathFromQuery ? `/${pathFromQuery}` : req.url.split('?')[0].replace(/^\/api(\/handler)?/, '')
  const segments = urlPath.replace(/^\//, '').split('/').filter(Boolean)
  const [r0, r1, r2] = segments
  const id = r1 && !r2 && r1 !== 'login' && r1 !== 'register' && r1 !== 'me' && r1 !== 'stats' && r1 !== 'csv' ? r1 : null

  try {
    // === DEBUG (remove after diagnosis) ===
    if (r0 === 'debug' && req.method === 'GET') {
      return res.json({
        segments,
        reqUrl: req.url,
        queryPath: req.query?.path,
        hasDb: !!process.env.DATABASE_URL,
        hasJwt: !!process.env.JWT_SECRET,
        body: req.body,
      })
    }

    // === AUTH ===
    if (r0 === 'auth' && r1 === 'login' && req.method === 'POST') {
      const { identifier, password } = req.body
      const isNIM = /^\d+$/.test((identifier||'').trim())
      const email = isNIM ? `${identifier.trim()}@sipro.ac.id` : identifier.trim()
      const [user] = await sql`select * from users where email = ${email} limit 1`
      if (!user || !(await compare(password, user.password_hash)))
        return res.status(401).json({ error: 'Email atau password salah' })
      const token = await signToken({ id: user.id, email: user.email, role: user.role, nim: user.nim })
      return res.json({ token, user: { id: user.id, email: user.email, role: user.role, nim: user.nim } })
    }

    if (r0 === 'auth' && r1 === 'register' && req.method === 'POST') {
      const { email, nama, password } = req.body
      if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
      const [existing] = await sql`select id from users where email = ${email} limit 1`
      if (existing) return res.status(409).json({ error: 'Email sudah digunakan' })
      const password_hash = await hash(password, 12)
      const [user] = await sql`insert into users (email, password_hash, role) values (${email},${password_hash},'admin') returning id,email,role,nim`
      const token = await signToken({ id: user.id, email: user.email, role: user.role, nim: user.nim })
      return res.status(201).json({ token, user })
    }

    if (r0 === 'auth' && r1 === 'me' && req.method === 'GET') {
      const session = await getSession(req)
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      const [user] = await sql`select id,email,role,nim,created_at from users where id = ${session.id}`
      if (!user) return res.status(404).json({ error: 'Not found' })
      if (user.role === 'mahasiswa' && user.nim) {
        const [mhs] = await sql`select * from mahasiswa where nim = ${user.nim}`
        return res.json({ ...user, mahasiswa: mhs || null })
      }
      return res.json(user)
    }

    // === MAHASISWA ===
    if (r0 === 'mahasiswa' && !r1) {
      const session = await getSession(req)
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      if (req.method === 'GET') {
        if (session.role === 'admin') {
          const { search, prodi, semester } = req.query
          let rows
          if (search && prodi && semester) {
            rows = await sql`select * from mahasiswa where (lower(nama) like ${'%'+search.toLowerCase()+'%'} or nim like ${'%'+search+'%'}) and prodi=${prodi} and semester=${Number(semester)} order by nama`
          } else if (search && prodi) {
            rows = await sql`select * from mahasiswa where (lower(nama) like ${'%'+search.toLowerCase()+'%'} or nim like ${'%'+search+'%'}) and prodi=${prodi} order by nama`
          } else if (search && semester) {
            rows = await sql`select * from mahasiswa where (lower(nama) like ${'%'+search.toLowerCase()+'%'} or nim like ${'%'+search+'%'}) and semester=${Number(semester)} order by nama`
          } else if (prodi && semester) {
            rows = await sql`select * from mahasiswa where prodi=${prodi} and semester=${Number(semester)} order by nama`
          } else if (search) {
            rows = await sql`select * from mahasiswa where lower(nama) like ${'%'+search.toLowerCase()+'%'} or nim like ${'%'+search+'%'} order by nama`
          } else if (prodi) {
            rows = await sql`select * from mahasiswa where prodi=${prodi} order by nama`
          } else if (semester) {
            rows = await sql`select * from mahasiswa where semester=${Number(semester)} order by nama`
          } else {
            rows = await sql`select * from mahasiswa order by nama`
          }
          return res.json(rows)
        }
        const [mhs] = await sql`select * from mahasiswa where user_id = ${session.id}`
        return res.json(mhs || null)
      }
      if (req.method === 'POST') {
        if (session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
        const { nim, nama, tanggal_lahir, email, no_hp, alamat, fakultas, prodi, semester } = req.body
        const [ex] = await sql`select id from mahasiswa where nim=${nim}`
        if (ex) return res.status(409).json({ error: 'NIM sudah ada' })
        const [mhs] = await sql`insert into mahasiswa (nim,nama,tanggal_lahir,email,no_hp,alamat,fakultas,prodi,semester) values (${nim},${nama},${tanggal_lahir},${email||null},${no_hp||null},${alamat||null},${fakultas||null},${prodi||null},${semester||null}) returning *`
        return res.status(201).json(mhs)
      }
    }

    if (r0 === 'mahasiswa' && r1 && !r2) {
      const session = await getSession(req)
      if (!session || session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
      if (req.method === 'GET') {
        const [mhs] = await sql`select * from mahasiswa where id = ${r1}`
        return mhs ? res.json(mhs) : res.status(404).json({ error: 'Not found' })
      }
      if (req.method === 'PUT') {
        const b = req.body
        const [mhs] = await sql`update mahasiswa set nama=coalesce(${b.nama||null},nama),tanggal_lahir=coalesce(${b.tanggal_lahir||null},tanggal_lahir),email=coalesce(${b.email||null},email),no_hp=coalesce(${b.no_hp||null},no_hp),alamat=coalesce(${b.alamat||null},alamat),fakultas=coalesce(${b.fakultas||null},fakultas),prodi=coalesce(${b.prodi||null},prodi),semester=coalesce(${b.semester||null},semester) where id=${r1} returning *`
        return mhs ? res.json(mhs) : res.status(404).json({ error: 'Not found' })
      }
      if (req.method === 'DELETE') {
        await sql`delete from mahasiswa where id=${r1}`
        return res.json({ ok: true })
      }
    }

    // === NILAI ===
    if (r0 === 'nilai' && !r1) {
      const session = await getSession(req)
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      if (req.method === 'GET') {
        if (session.role === 'admin') {
          const { mahasiswa_id } = req.query
          const rows = mahasiswa_id
            ? await sql`select n.*,mk.nama as mata_kuliah_nama,mk.sks,mk.kode,m.nama as mahasiswa_nama,m.nim as mahasiswa_nim from nilai n join mata_kuliah mk on mk.id=n.mata_kuliah_id join mahasiswa m on m.id=n.mahasiswa_id where n.mahasiswa_id=${mahasiswa_id} order by n.semester,mk.nama`
            : await sql`select n.*,mk.nama as mata_kuliah_nama,mk.sks,mk.kode,m.nama as mahasiswa_nama,m.nim as mahasiswa_nim from nilai n join mata_kuliah mk on mk.id=n.mata_kuliah_id join mahasiswa m on m.id=n.mahasiswa_id order by n.semester,mk.nama`
          return res.json(rows)
        }
        const [mhs] = await sql`select id from mahasiswa where user_id=${session.id}`
        if (!mhs) return res.json([])
        const rows = await sql`select n.*,mk.nama as mata_kuliah_nama,mk.sks,mk.kode from nilai n join mata_kuliah mk on mk.id=n.mata_kuliah_id where n.mahasiswa_id=${mhs.id} order by n.semester,mk.nama`
        return res.json(rows)
      }
      if (req.method === 'POST') {
        if (session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
        const { mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf, bobot } = req.body
        const [row] = await sql`insert into nilai (mahasiswa_id,mata_kuliah_id,semester,tahun_ajaran,nilai_angka,nilai_huruf,bobot) values (${mahasiswa_id},${mata_kuliah_id},${semester},${tahun_ajaran||null},${nilai_angka},${nilai_huruf},${bobot}) on conflict (mahasiswa_id,mata_kuliah_id,semester) do update set nilai_angka=excluded.nilai_angka,nilai_huruf=excluded.nilai_huruf,bobot=excluded.bobot returning *`
        return res.status(201).json(row)
      }
    }

    if (r0 === 'nilai' && r1 && !r2) {
      const session = await getSession(req)
      if (!session || session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
      if (req.method === 'PUT') {
        const { nilai_angka, nilai_huruf, bobot, tahun_ajaran } = req.body
        const [row] = await sql`update nilai set nilai_angka=${nilai_angka},nilai_huruf=${nilai_huruf},bobot=${bobot},tahun_ajaran=coalesce(${tahun_ajaran||null},tahun_ajaran) where id=${r1} returning *`
        return row ? res.json(row) : res.status(404).json({ error: 'Not found' })
      }
      if (req.method === 'DELETE') { await sql`delete from nilai where id=${r1}`; return res.json({ ok: true }) }
    }

    // === JADWAL ===
    if (r0 === 'jadwal' && !r1) {
      const session = await getSession(req)
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      if (req.method === 'GET') {
        const { prodi, semester } = req.query
        let p = prodi, s = semester
        if (session.role === 'mahasiswa') {
          const [mhs] = await sql`select prodi,semester from mahasiswa where user_id=${session.id}`
          p = p || mhs?.prodi; s = s || mhs?.semester
        }
        let rows
        const sem = s ? Number(s) : null
        if (p && sem) {
          rows = await sql`select j.*,mk.nama as mata_kuliah_nama,mk.sks,mk.kode,mk.dosen from jadwal j join mata_kuliah mk on mk.id=j.mata_kuliah_id where j.prodi=${p} and j.semester=${sem} order by j.hari,j.jam_mulai`
        } else if (p) {
          rows = await sql`select j.*,mk.nama as mata_kuliah_nama,mk.sks,mk.kode,mk.dosen from jadwal j join mata_kuliah mk on mk.id=j.mata_kuliah_id where j.prodi=${p} order by j.hari,j.jam_mulai`
        } else if (sem) {
          rows = await sql`select j.*,mk.nama as mata_kuliah_nama,mk.sks,mk.kode,mk.dosen from jadwal j join mata_kuliah mk on mk.id=j.mata_kuliah_id where j.semester=${sem} order by j.hari,j.jam_mulai`
        } else {
          rows = await sql`select j.*,mk.nama as mata_kuliah_nama,mk.sks,mk.kode,mk.dosen from jadwal j join mata_kuliah mk on mk.id=j.mata_kuliah_id order by j.hari,j.jam_mulai`
        }
        return res.json(rows)
      }
      if (req.method === 'POST') {
        if (session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
        const { mata_kuliah_id, hari, jam_mulai, jam_selesai, ruang, semester, prodi } = req.body
        const [row] = await sql`insert into jadwal (mata_kuliah_id,hari,jam_mulai,jam_selesai,ruang,semester,prodi) values (${mata_kuliah_id},${hari},${jam_mulai},${jam_selesai},${ruang||null},${semester||null},${prodi||null}) returning *`
        return res.status(201).json(row)
      }
    }

    if (r0 === 'jadwal' && r1 && !r2) {
      const session = await getSession(req)
      if (!session || session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
      if (req.method === 'PUT') {
        const b = req.body
        const [row] = await sql`update jadwal set mata_kuliah_id=coalesce(${b.mata_kuliah_id||null},mata_kuliah_id),hari=coalesce(${b.hari||null},hari),jam_mulai=coalesce(${b.jam_mulai||null},jam_mulai),jam_selesai=coalesce(${b.jam_selesai||null},jam_selesai),ruang=coalesce(${b.ruang||null},ruang),semester=coalesce(${b.semester||null},semester),prodi=coalesce(${b.prodi||null},prodi) where id=${r1} returning *`
        return row ? res.json(row) : res.status(404).json({ error: 'Not found' })
      }
      if (req.method === 'DELETE') { await sql`delete from jadwal where id=${r1}`; return res.json({ ok: true }) }
    }

    // === PENGUMUMAN ===
    if (r0 === 'pengumuman' && !r1) {
      const session = await getSession(req)
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      if (req.method === 'GET') {
        const { kategori } = req.query
        const isAdmin = session.role === 'admin'
        let rows
        if (isAdmin && kategori) {
          rows = await sql`select p.*,u.email as author_email from pengumuman p left join users u on u.id=p.author_id where p.kategori=${kategori} order by p.created_at desc`
        } else if (isAdmin) {
          rows = await sql`select p.*,u.email as author_email from pengumuman p left join users u on u.id=p.author_id order by p.created_at desc`
        } else if (kategori) {
          rows = await sql`select p.*,u.email as author_email from pengumuman p left join users u on u.id=p.author_id where p.is_published=true and p.kategori=${kategori} order by p.created_at desc`
        } else {
          rows = await sql`select p.*,u.email as author_email from pengumuman p left join users u on u.id=p.author_id where p.is_published=true order by p.created_at desc`
        }
        return res.json(rows)
      }
      if (req.method === 'POST') {
        if (session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
        const { judul, konten, kategori, is_published } = req.body
        const [row] = await sql`insert into pengumuman (judul,konten,kategori,author_id,is_published) values (${judul},${konten},${kategori||'umum'},${session.id},${is_published!==false}) returning *`
        return res.status(201).json(row)
      }
    }

    if (r0 === 'pengumuman' && r1 && !r2) {
      const session = await getSession(req)
      if (!session || session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
      if (req.method === 'PUT') {
        const { judul, konten, kategori, is_published } = req.body
        const [row] = await sql`update pengumuman set judul=coalesce(${judul||null},judul),konten=coalesce(${konten||null},konten),kategori=coalesce(${kategori||null},kategori),is_published=coalesce(${is_published??null},is_published),updated_at=now() where id=${r1} returning *`
        return row ? res.json(row) : res.status(404).json({ error: 'Not found' })
      }
      if (req.method === 'DELETE') { await sql`delete from pengumuman where id=${r1}`; return res.json({ ok: true }) }
    }

    // === MATA KULIAH ===
    if (r0 === 'mata-kuliah' && !r1) {
      const session = await getSession(req)
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      if (req.method === 'GET') {
        const rows = await sql`select * from mata_kuliah order by semester,nama`
        return res.json(rows)
      }
    }

    // === PROFILE ===
    if (r0 === 'profile' && !r1) {
      const session = await getSession(req)
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      if (req.method === 'GET') {
        const [user] = await sql`select id,email,role,nim from users where id=${session.id}`
        if (!user) return res.status(404).json({ error: 'Not found' })
        if (user.role === 'mahasiswa' && user.nim) {
          const [mhs] = await sql`select * from mahasiswa where nim=${user.nim}`
          return res.json({ ...user, mahasiswa: mhs || null })
        }
        return res.json(user)
      }
      if (req.method === 'PUT') {
        const { nama, no_hp, alamat, current_password, new_password } = req.body
        if (new_password) {
          const [u] = await sql`select password_hash from users where id=${session.id}`
          if (!(await compare(current_password||'', u.password_hash)))
            return res.status(400).json({ error: 'Password lama salah' })
          const pw_hash = await hash(new_password, 12)
          await sql`update users set password_hash=${pw_hash} where id=${session.id}`
        }
        if (session.role === 'mahasiswa' && session.nim) {
          const [mhs] = await sql`update mahasiswa set nama=coalesce(${nama||null},nama),no_hp=coalesce(${no_hp||null},no_hp),alamat=coalesce(${alamat||null},alamat) where nim=${session.nim} returning *`
          return res.json(mhs)
        }
        return res.json({ ok: true })
      }
    }

    // === ADMIN STATS ===
    if (r0 === 'admin' && r1 === 'stats') {
      const session = await getSession(req)
      if (!session || session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
      const [{ count: totalMahasiswa }] = await sql`select count(*)::int from mahasiswa`
      const [{ count: totalMataKuliah }] = await sql`select count(*)::int from mata_kuliah`
      const [{ count: totalJadwal }] = await sql`select count(*)::int from jadwal`
      const [{ count: totalPengumuman }] = await sql`select count(*)::int from pengumuman where is_published=true`
      const distribusiProdi = await sql`select prodi,count(*)::int as total from mahasiswa where prodi is not null group by prodi order by total desc`
      const recentNilai = await sql`select n.*,m.nama as mahasiswa_nama,mk.nama as mata_kuliah_nama from nilai n join mahasiswa m on m.id=n.mahasiswa_id join mata_kuliah mk on mk.id=n.mata_kuliah_id order by n.created_at desc limit 10`
      return res.json({ totalMahasiswa, totalMataKuliah, totalJadwal, totalPengumuman, distribusiProdi, recentNilai })
    }

    // === IMPORT CSV ===
    if (r0 === 'import' && r1 === 'csv') {
      const session = await getSession(req)
      if (!session || session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
      const { rows } = req.body
      if (!Array.isArray(rows)) return res.status(400).json({ error: 'No rows' })
      let success = 0, skipped = 0, failed = 0, errors = []
      for (const row of rows) {
        try {
          const { nim, nama, tanggal_lahir, prodi, semester, fakultas } = row
          if (!nim || !nama || !tanggal_lahir) { skipped++; continue }
          const email = `${nim}@sipro.ac.id`
          const [ex] = await sql`select id from users where email=${email} limit 1`
          if (ex) { skipped++; continue }
          const password_hash = await hash(tanggal_lahir, 12)
          const [user] = await sql`insert into users (email,password_hash,role,nim) values (${email},${password_hash},'mahasiswa',${nim}) returning id`
          await sql`insert into mahasiswa (user_id,nim,nama,tanggal_lahir,prodi,semester,fakultas) values (${user.id},${nim},${nama},${tanggal_lahir},${prodi||null},${semester?Number(semester):null},${fakultas||null}) on conflict (nim) do nothing`
          success++
        } catch (e) { failed++; errors.push({ nim: row.nim, error: e.message }) }
      }
      return res.json({ success, skipped, failed, errors })
    }

    res.status(404).json({ error: 'Not found' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message || 'Internal server error' })
  }
}

