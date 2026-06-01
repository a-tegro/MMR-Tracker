import { useState, useEffect, useCallback } from 'react'

export function getCompanyKey(reactor) {
  return `r${reactor.rank}`
}

const SERVER_DOWN_MSG = 'API server is not running. Open a terminal in the project folder and run: npm run dev'

async function safeJson(res) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error(SERVER_DOWN_MSG)
  }
  return res.json()
}

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
      const json = await safeJson(res)
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setData(json)
    } catch (err) {
      const msg = err.message.includes('fetch') || err.message.includes('NetworkError')
        ? SERVER_DOWN_MSG
        : err.message
      setError(msg)
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
      const json = await safeJson(res)
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setData(json)
    } catch (err) {
      const msg = err.message.includes('fetch') || err.message.includes('NetworkError')
        ? SERVER_DOWN_MSG
        : err.message
      setError(msg)
    } finally {
      setScanning(false)
    }
  }, [companyKey, reactor])

  useEffect(() => {
    fetchCached()
  }, [fetchCached])

  return { data, loading, scanning, error, triggerScan, refetch: fetchCached, companyKey }
}
