import { useState, useEffect } from 'react'
import { getJadwal } from '@/services/jadwalService'
import { todayName } from '@/utils/formatDate'

export function useJadwal(filters = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJadwal(filters)
      .then(setData)
      .finally(() => setLoading(false))
  }, [filters.prodi, filters.semester])

  const today = todayName()
  const todaySchedule = data.filter((j) => j.hari === today)

  return { data, loading, todaySchedule }
}
