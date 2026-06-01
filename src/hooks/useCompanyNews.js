import { useState, useEffect, useCallback } from 'react'

function getCompanyKey(reactor) {
  return `r${reactor.rank}`
}

export { getCompanyKey }

export function useCompanyNews(reactor) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  const companyKey = getCompanyKey(reactor)

  const fetchCached = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/news/${companyKey}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch {
      setError('API server not reachable. Start the server with npm run dev.')
    } finally {
      setLoading(false)
    }
  }, [companyKey])

  const triggerScan = useCallback(async () => {
    setScanning(true)
    setError(null)
    try {
      const res = await fetch(`/api/scan/${companyKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactor }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }, [companyKey, reactor])

  useEffect(() => {
    fetchCached()
  }, [fetchCached])

  return { data, loading, scanning, error, triggerScan, refetch: fetchCached, companyKey }
}
