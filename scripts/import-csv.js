/**
 * Import CSV mahasiswa ke Supabase Auth + Database
 *
 * Setup:
 * 1. Copy .env.script.example ke .env.script
 * 2. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY
 * 3. Letakkan file CSV di path yang ditentukan
 * 4. Run: node scripts/import-csv.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load env dari .env.script atau env vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sebagai env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const CSV_PATH = process.argv[2] || path.join(__dirname, '../data_dummy_mahasiswa.csv')

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const cols = []
    let inQuote = false, cur = ''
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
      else cur += ch
    }
    cols.push(cur.trim())

    return headers.reduce((obj, h, i) => {
      obj[h] = cols[i] || ''
      return obj
    }, {})
  })
}

async function importMahasiswa() {
  const rows = parseCSV(CSV_PATH)
  console.log(`📄 ${rows.length} mahasiswa ditemukan di CSV\n`)

  let success = 0, skipped = 0, failed = 0

  for (const row of rows) {
    const { nama, nim, tanggal_lahir } = row
    if (!nim || !nama || !tanggal_lahir) {
      console.warn(`⚠️  Skip baris tidak lengkap: ${JSON.stringify(row)}`)
      skipped++
      continue
    }

    const email = `${nim}@sipro.ac.id`
    const password = tanggal_lahir // YYYY-MM-DD

    try {
      // 1. Buat Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) {
        if (authError.message?.includes('already been registered')) {
          console.log(`⏭️  Skip ${nim} (${nama}) — sudah ada`)
          skipped++
          continue
        }
        throw authError
      }

      const userId = authData.user.id

      // 2. Insert ke profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        role: 'mahasiswa',
        nim,
        nama,
      })
      if (profileError) throw profileError

      // 3. Insert ke mahasiswa
      const { error: mhsError } = await supabase.from('mahasiswa').insert({
        user_id: userId,
        nim,
        nama,
        tanggal_lahir,
        semester: 1,
      })
      if (mhsError) throw mhsError

      console.log(`✅ ${nim} — ${nama}`)
      success++
    } catch (e) {
      console.error(`❌ ${nim} — ${nama}: ${e.message}`)
      failed++
    }
  }

  console.log(`\n📊 Selesai: ${success} berhasil, ${skipped} dilewati, ${failed} gagal`)
}

importMahasiswa()
