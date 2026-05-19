/**
 * Import CSV mahasiswa ke Neon Database
 *
 * Setup:
 * 1. Pastikan DATABASE_URL_UNPOOLED ada di .env.local
 * 2. Run: node scripts/import-csv.js [path-to-csv]
 */

import { Client } from 'pg'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.local') })

const DB_URL = process.env.DATABASE_URL_UNPOOLED
if (!DB_URL) { console.error('❌ DATABASE_URL_UNPOOLED tidak ditemukan di .env.local'); process.exit(1) }

const CSV_PATH = process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '../data_dummy_mahasiswa.csv')

function parseCSV(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map(line => {
    const cols = []; let inQuote = false, cur = ''
    for (const ch of line) {
      if (ch === '"') inQuote = !inQuote
      else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
      else cur += ch
    }
    cols.push(cur.trim())
    return headers.reduce((obj, h, i) => { obj[h] = cols[i] || ''; return obj }, {})
  })
}

async function importMahasiswa() {
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  const rows = parseCSV(CSV_PATH)
  console.log(`📄 ${rows.length} mahasiswa ditemukan di CSV\n`)
  let success = 0, skipped = 0, failed = 0

  for (const row of rows) {
    const { nama, nim, tanggal_lahir, prodi, semester, fakultas } = row
    if (!nim || !nama || !tanggal_lahir) { skipped++; continue }

    try {
      const email = `${nim}@sipro.ac.id`
      const { rows: existing } = await client.query('select id from users where email=$1', [email])
      if (existing.length > 0) { console.log(`⏭️  Skip ${nim} — sudah ada`); skipped++; continue }

      const password_hash = await bcrypt.hash(tanggal_lahir, 12)
      const { rows: [user] } = await client.query(
        `insert into users (email, password_hash, role, nim) values ($1,$2,'mahasiswa',$3) returning id`,
        [email, password_hash, nim]
      )
      await client.query(
        `insert into mahasiswa (user_id, nim, nama, tanggal_lahir, prodi, semester, fakultas)
         values ($1,$2,$3,$4,$5,$6,$7) on conflict (nim) do nothing`,
        [user.id, nim, nama, tanggal_lahir, prodi||null, semester ? Number(semester) : 1, fakultas||null]
      )
      console.log(`✅ ${nim} — ${nama}`)
      success++
    } catch (e) {
      console.error(`❌ ${nim}: ${e.message}`)
      failed++
    }
  }

  await client.end()
  console.log(`\n📊 Selesai: ${success} berhasil, ${skipped} dilewati, ${failed} gagal`)
}

importMahasiswa()
