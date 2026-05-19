import { useState, useEffect } from 'react'
import { getPengumuman } from '@/services/pengumumanService'

export function usePengumuman(filters = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPengumuman(filters)
      .then(setData)
      .finally(() => setLoading(false))
  }, [filters.kategori])

  return { data, loading }
}
