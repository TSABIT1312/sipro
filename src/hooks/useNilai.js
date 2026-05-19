import { useState, useEffect } from 'react'
import { getNilaiByMahasiswa } from '@/services/nilaiService'
import { calculateIPK, totalSKS } from '@/utils/calculateIPK'

export function useNilaiMahasiswa(mahasiswaId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mahasiswaId) return
    getNilaiByMahasiswa(mahasiswaId)
      .then(setData)
      .finally(() => setLoading(false))
  }, [mahasiswaId])

  const ipk = calculateIPK(data)
  const sks = totalSKS(data)
  const semesters = [...new Set(data.map((n) => n.semester))].sort()

  return { data, loading, ipk, sks, semesters }
}
