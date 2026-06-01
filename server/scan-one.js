/**
 * One-shot scan script. Usage:
 *   node --env-file=.env server/scan-one.js <rank>
 * Example:
 *   node --env-file=.env server/scan-one.js 5
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

const rank = parseInt(process.argv[2])
if (!rank) { console.error('Usage: node server/scan-one.js <rank>'); process.exit(1) }

const reactor = reactors.find(r => r.rank === rank)
if (!reactor) { console.error(`No reactor with rank ${rank}`); process.exit(1) }

if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }

console.log(`\nScanning ${reactor.company} (${reactor.reactor})...\n`)

const result = await scanCompany(reactor)
const cache = loadCache()
cache.companies[`r${rank}`] = { ...result, lastScan: new Date().toISOString() }
writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))

console.log('=== SECTIONS ===')
for (const [section, items] of Object.entries(result.sections)) {
  console.log(`\n[${section.toUpperCase()}] (${items.length} items)`)
  for (const item of items) {
    console.log(`  • ${item.date}  ${item.headline}`)
    if (item.summary) console.log(`    ${item.summary}`)
    if (item.source) console.log(`    Source: ${item.source}`)
  }
}

if (Object.keys(result.milestoneUpdates).length > 0) {
  console.log('\n=== MILESTONE UPDATES DETECTED ===')
  for (const [key, val] of Object.entries(result.milestoneUpdates)) {
    console.log(`  ${key}: ${val.status}${val.date ? ` (${val.date})` : ''}`)
  }
}

console.log(`\nSaved to newsCache.json`)
