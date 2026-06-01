import { loadCache } from '../../lib/cache.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { companyKey } = req.query
  const cache = loadCache()
  const data = cache.companies[companyKey] ?? null
  res.json(data)
}
