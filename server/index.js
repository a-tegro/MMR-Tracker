import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { scanCompany } from './scanner.js'
import { startScheduler } from './scheduler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CACHE_FILE = join(__dirname, 'newsCache.json')

export function loadCache() {
  if (!existsSync(CACHE_FILE)) {
    const initial = { lastScanAll: null, companies: {} }
    writeFileSync(CACHE_FILE, JSON.stringify(initial, null, 2))
    return initial
  }
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
  } catch {
    return { lastScanAll: null, companies: {} }
  }
}

export function saveCache(data) {
  writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2))
}

const app = express()
app.use(cors())
app.use(express.json())

// Get cached news for a company
app.get('/api/news/:companyKey', (req, res) => {
  const cache = loadCache()
  const data = cache.companies[req.params.companyKey] ?? null
  res.json(data)
})

// Trigger an on-demand scan for one company
app.post('/api/scan/:companyKey', async (req, res) => {
  const { companyKey } = req.params
  const { reactor } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured in .env' })
  }
  if (!reactor) {
    return res.status(400).json({ error: 'reactor data required in request body' })
  }

  try {
    const result = await scanCompany(reactor)
    const cache = loadCache()
    cache.companies[companyKey] = { ...result, lastScan: new Date().toISOString() }
    saveCache(cache)
    res.json(cache.companies[companyKey])
  } catch (err) {
    console.error('[Scan] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Get all accumulated milestone updates (for main table overlay)
app.get('/api/milestones/updates', (req, res) => {
  const cache = loadCache()
  const updates = {}
  for (const [key, data] of Object.entries(cache.companies)) {
    if (data?.milestoneUpdates && Object.keys(data.milestoneUpdates).length > 0) {
      updates[key] = data.milestoneUpdates
    }
  }
  res.json(updates)
})

// Status check
app.get('/api/status', (req, res) => {
  const cache = loadCache()
  res.json({
    lastScanAll: cache.lastScanAll,
    companiesScanned: Object.keys(cache.companies).length,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    braveConfigured: !!process.env.BRAVE_API_KEY,
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`[Server] API running on http://localhost:${PORT}`)
  if (process.env.ANTHROPIC_API_KEY) {
    startScheduler(loadCache, saveCache)
  } else {
    console.warn('[Server] ANTHROPIC_API_KEY not set — weekly scans disabled. Add to .env to enable.')
  }
})
