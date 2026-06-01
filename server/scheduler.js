import cron from 'node-cron'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { scanCompany } from './scanner.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getCompanyKey(reactor) {
  return `r${reactor.rank}`
}

function loadReactors() {
  // Read reactors.js as text and extract the array — avoids circular import issues
  // We import dynamically so the server can start without vite processing src/
  return import('../src/data/reactors.js').then(m => m.reactors)
}

export function startScheduler(loadCache, saveCache) {
  // Every Sunday at 02:00 local time
  cron.schedule('0 2 * * 0', async () => {
    console.log('[Scheduler] Starting weekly market scan...')
    let reactors
    try {
      reactors = await loadReactors()
    } catch (err) {
      console.error('[Scheduler] Could not load reactor list:', err.message)
      return
    }

    const cache = loadCache()

    for (const reactor of reactors) {
      const key = getCompanyKey(reactor)
      try {
        console.log(`[Scheduler] Scanning ${reactor.company} (${key})...`)
        const result = await scanCompany(reactor)
        cache.companies[key] = { ...result, lastScan: new Date().toISOString() }
        saveCache(cache)
        // Throttle: 3s between calls to avoid rate limits
        await new Promise(r => setTimeout(r, 3000))
      } catch (err) {
        console.error(`[Scheduler] Error scanning ${reactor.company}:`, err.message)
      }
    }

    cache.lastScanAll = new Date().toISOString()
    saveCache(cache)
    console.log('[Scheduler] Weekly scan complete.')
  })

  console.log('[Scheduler] Weekly scan scheduled — Sundays at 02:00')
}
