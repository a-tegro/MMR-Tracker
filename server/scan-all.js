/**
 * One-shot full scan script. Scans all reactors sequentially and writes
 * results to server/newsCache.json (picked up by the local dev server).
 *
 * Usage:
 *   node --env-file=.env server/scan-all.js
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { scanCompany } from './scanner.js'
import { reactors } from '../src/data/reactors.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_FILE = join(__dirname, 'newsCache.json')

function loadCache() {
  if (!existsSync(CACHE_FILE)) return { lastScanAll: null, companies: {} }
  try { return JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) } catch { return { lastScanAll: null, companies: {} } }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌  ANTHROPIC_API_KEY not set. Run with: node --env-file=.env server/scan-all.js')
  process.exit(1)
}

console.log(`\n🔍  Starting full scan — ${reactors.length} companies\n`)

const cache = loadCache()
let scanned = 0
const errors = []

for (const reactor of reactors) {
  const key = `r${reactor.rank}`
  process.stdout.write(`[${String(reactor.rank).padStart(2, '0')}/${reactors.length}] ${reactor.company} … `)
  try {
    const result = await scanCompany(reactor)
    cache.companies[key] = { ...result, lastScan: new Date().toISOString() }
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
    const counts = Object.entries(result.sections)
      .map(([k, v]) => `${v.length} ${k.replace('projectAnnouncements','projects').replace('latestNews','news')}`)
      .filter(s => !s.startsWith('0 '))
      .join(', ')
    console.log(`✓  ${counts || 'no items'}`)
    scanned++
  } catch (err) {
    console.log(`✗  ${err.message}`)
    errors.push({ company: reactor.company, error: err.message })
  }
}

cache.lastScanAll = new Date().toISOString()
writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))

console.log(`\n✅  Done — ${scanned}/${reactors.length} companies scanned`)
if (errors.length) {
  console.log('\n⚠️  Errors:')
  errors.forEach(e => console.log(`  • ${e.company}: ${e.error}`))
}
console.log(`\nResults written to server/newsCache.json\n`)
