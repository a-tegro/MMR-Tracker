import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// On Vercel, /tmp is the only writable directory (ephemeral between cold starts)
const CACHE_FILE = process.env.VERCEL
  ? '/tmp/newsCache.json'
  : join(__dirname, '..', 'server', 'newsCache.json')

const empty = () => ({ lastScanAll: null, companies: {} })

export function loadCache() {
  if (!existsSync(CACHE_FILE)) return empty()
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
  } catch {
    return empty()
  }
}

export function saveCache(data) {
  writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2))
}
