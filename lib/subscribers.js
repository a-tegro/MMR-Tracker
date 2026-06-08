import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const WRITE_PATH = process.env.VERCEL
  ? '/tmp/subscribers.json'
  : join(__dirname, '..', 'server', 'subscribers.json')

const SEED_PATH = join(__dirname, '..', 'server', 'subscribers.json')

const SUB_KEY = 'subscribers'
const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

export async function loadSubscribers() {
  if (useKV) {
    try {
      const { kv } = await import('@vercel/kv')
      return (await kv.get(SUB_KEY)) || []
    } catch (err) {
      console.error('[Subscribers] KV read failed:', err.message)
    }
  }
  for (const path of [WRITE_PATH, SEED_PATH]) {
    if (existsSync(path)) {
      try { return JSON.parse(readFileSync(path, 'utf-8')) } catch {}
    }
  }
  return []
}

export async function saveSubscribers(list) {
  if (useKV) {
    try {
      const { kv } = await import('@vercel/kv')
      await kv.set(SUB_KEY, list)
      return
    } catch (err) {
      console.error('[Subscribers] KV write failed:', err.message)
    }
  }
  writeFileSync(WRITE_PATH, JSON.stringify(list, null, 2))
}
