import { isSubscribed, addSubscriber } from '../../lib/subscribers.js'
import { sendWelcomeEmail } from '../../lib/email.js'

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

  if (await isSubscribed(normalised)) {
    return res.json({ ok: true, alreadySubscribed: true })
  }

  await addSubscriber(normalised)
  console.log(`[Subscribers] New subscriber: ${normalised}`)

  // Send welcome email — fire-and-forget, don't block the response
  sendWelcomeEmail(normalised).catch(() => {})

  res.json({ ok: true })
}
