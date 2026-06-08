import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Writes always go to /tmp on Vercel (writable); local dev uses server/ dir
const WRITE_PATH = process.env.VERCEL
  ? '/tmp/newsCache.json'
  : join(__dirname, '..', 'server', 'newsCache.json')

// Committed seed file — bundled with Vercel functions via includeFiles in vercel.json
const SEED_PATH = join(__dirname, '..', 'server', 'newsCache.json')

const CACHE_KEY = 'newsCache'
const empty = () => ({ lastScanAll: null, companies: {} })

// Detect Vercel KV — injected automatically when a KV database is linked to the project
const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

export async function loadCache() {
  if (useKV) {
    try {
      const { kv } = await import('@vercel/kv')
      const data = await kv.get(CACHE_KEY)
      return data || empty()
    } catch (err) {
      console.error('[Cache] KV read failed, falling back to file:', err.message)
    }
  }

  // On Vercel: prefer /tmp (written by cron), fall back to bundled seed file
  // Locally: WRITE_PATH === SEED_PATH so this always reads the right file
  for (const path of [WRITE_PATH, SEED_PATH]) {
    if (existsSync(path)) {
      try {
        return JSON.parse(readFileSync(path, 'utf-8'))
      } catch {
        // corrupt — try next
      }
    }
  }
  return empty()
}

export async function saveCache(data) {
  if (useKV) {
    try {
      const { kv } = await import('@vercel/kv')
      await kv.set(CACHE_KEY, data)
      return
    } catch (err) {
      console.error('[Cache] KV write failed, falling back to file:', err.message)
    }
  }
  writeFileSync(WRITE_PATH, JSON.stringify(data, null, 2))
}
