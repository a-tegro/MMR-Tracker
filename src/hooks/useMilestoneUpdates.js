import { useState, useEffect } from 'react'

/**
 * Fetches scan-detected milestone overrides from the API.
 * Returns an object keyed by companyKey (e.g. "r1") containing
 * milestone updates: { ZPC: { status: 'approved', date: '2026-04-15' }, ... }
 */
export function useMilestoneUpdates() {
  const [updates, setUpdates] = useState({})

  useEffect(() => {
    fetch('/api/milestones/updates')
      .then(res => {
        if (!res.ok) return {}
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return {}
        return res.json()
      })
      .then(data => setUpdates(data || {}))
      .catch(() => {}) // silently ignore — static data still shows
  }, [])

  return updates
}
