import { scanCompany } from '../../server/scanner.js'
import { loadCache, saveCache } from '../../lib/cache.js'
import { reactors } from '../../src/data/reactors.js'

export default async function handler(req, res) {
  // Vercel cron calls with GET; also allow POST for manual triggers
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Protect from unauthorized calls when not invoked by Vercel Cron
  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const cache = loadCache()
  const results = { scanned: 0, errors: [] }

  for (const reactor of reactors) {
    const key = `r${reactor.rank}`
    try {
      const result = await scanCompany(reactor)
      cache.companies[key] = { ...result, lastScan: new Date().toISOString() }
      saveCache(cache)
      results.scanned++
      // Throttle between API calls
      await new Promise(r => setTimeout(r, 3000))
    } catch (err) {
      console.error(`[CronScan] Error scanning ${reactor.company}:`, err.message)
      results.errors.push({ company: reactor.company, error: err.message })
    }
  }

  cache.lastScanAll = new Date().toISOString()
  saveCache(cache)

  res.json({ ok: true, ...results, completedAt: cache.lastScanAll })
}
