import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Filesystem path: /tmp on Vercel (ephemeral), local server/ dir otherwise
const FILE_PATH = process.env.VERCEL
  ? '/tmp/newsCache.json'
  : join(__dirname, '..', 'server', 'newsCache.json')

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
  // Filesystem fallback
  if (!existsSync(FILE_PATH)) return empty()
  try {
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8'))
  } catch {
    return empty()
  }
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
  // Filesystem fallback
  writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}
