import { loadCache } from '../lib/cache.js'
import { loadSubscribers } from '../lib/subscribers.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const [cache, subscribers] = await Promise.all([loadCache(), loadSubscribers()])
  res.json({
    lastScanAll: cache.lastScanAll,
    companiesScanned: Object.keys(cache.companies).length,
    subscriberCount: subscribers.length,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    resendConfigured: !!process.env.RESEND_API_KEY,
    audienceConfigured: !!(process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID),
    kvConfigured: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  })
}
