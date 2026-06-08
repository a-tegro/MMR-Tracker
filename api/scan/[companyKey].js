import { scanCompany } from '../../server/scanner.js'
import { loadCache, saveCache } from '../../lib/cache.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { companyKey } = req.query
  const { reactor } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }
  if (!reactor) {
    return res.status(400).json({ error: 'reactor data required in request body' })
  }

  try {
    const result = await scanCompany(reactor)
    const cache = await loadCache()
    cache.companies[companyKey] = { ...result, lastScan: new Date().toISOString() }
    await saveCache(cache)
    res.json(cache.companies[companyKey])
  } catch (err) {
    console.error('[Scan] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
