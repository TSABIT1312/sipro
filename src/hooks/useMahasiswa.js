import { useState, useEffect, useCallback } from 'react'
import { getMahasiswaList, getMahasiswaByUserId } from '@/services/mahasiswaService'

export function useMahasiswaList(filters = {}) {
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMahasiswaList(filters)
      setData(result.data)
      setCount(result.count)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  return { data, count, loading, error, refetch: fetch }
}

export function useMahasiswaSelf(userId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    getMahasiswaByUserId(userId)
      .then(setData)
      .finally(() => setLoading(false))
  }, [userId])

  return { data, loading }
}
