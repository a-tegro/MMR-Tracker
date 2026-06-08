import { loadSubscribers, saveSubscribers } from '../../lib/subscribers.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body ?? {}
  if (!email || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required' })
  }

  const normalised = email.trim().toLowerCase()
  const subscribers = await loadSubscribers()

  if (subscribers.some(s => s.email === normalised)) {
    // Idempotent — already subscribed is a success
    return res.json({ ok: true, alreadySubscribed: true })
  }

  subscribers.push({ email: normalised, subscribedAt: new Date().toISOString() })
  await saveSubscribers(subscribers)

  console.log(`[Subscribers] New subscriber: ${normalised} (total: ${subscribers.length})`)
  res.json({ ok: true })
}
