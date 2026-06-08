import { loadCache } from '../lib/cache.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const cache = await loadCache()
  res.json({
    lastScanAll: cache.lastScanAll,
    companiesScanned: Object.keys(cache.companies).length,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    braveConfigured: !!process.env.BRAVE_API_KEY,
    kvConfigured: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  })
}
