import { loadCache } from '../../lib/cache.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const cache = loadCache()
  const updates = {}
  for (const [key, data] of Object.entries(cache.companies)) {
    if (data?.milestoneUpdates && Object.keys(data.milestoneUpdates).length > 0) {
      updates[key] = data.milestoneUpdates
    }
  }
  res.json(updates)
}
