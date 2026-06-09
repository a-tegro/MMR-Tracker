/**
 * Subscriber storage — three tiers, in priority order:
 *   1. Resend Audiences (when RESEND_API_KEY + RESEND_AUDIENCE_ID set) — persistent, no extra infra
 *   2. Vercel KV (when KV_REST_API_URL + KV_REST_API_TOKEN set) — persistent
 *   3. Local filesystem (server/subscribers.json) — local dev only
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FILE_PATH = process.env.VERCEL
  ? '/tmp/subscribers.json'
  : join(__dirname, '..', 'server', 'subscribers.json')
const SEED_PATH = join(__dirname, '..', 'server', 'subscribers.json')

const useAudience = !!(process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID)
const useKV = !useAudience && !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

async function getResend() {
  const { Resend } = await import('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

// Returns array of { email } objects
export async function loadSubscribers() {
  if (useAudience) {
    try {
      const resend = await getResend()
      const { data, error } = await resend.contacts.list({
        audienceId: process.env.RESEND_AUDIENCE_ID,
      })
      if (error) throw new Error(error.message)
      return (data?.data ?? [])
        .filter(c => !c.unsubscribed)
        .map(c => ({ email: c.email, id: c.id }))
    } catch (err) {
      console.error('[Subscribers] Audience read failed:', err.message)
      return []
    }
  }
  if (useKV) {
    try {
      const { kv } = await import('@vercel/kv')
      return (await kv.get('subscribers')) || []
    } catch (err) {
      console.error('[Subscribers] KV read failed:', err.message)
    }
  }
  for (const path of [FILE_PATH, SEED_PATH]) {
    if (existsSync(path)) {
      try { return JSON.parse(readFileSync(path, 'utf-8')) } catch {}
    }
  }
  return []
}

// Add a single subscriber
export async function addSubscriber(email) {
  if (useAudience) {
    try {
      const resend = await getResend()
      const { error } = await resend.contacts.create({
        audienceId: process.env.RESEND_AUDIENCE_ID,
        email,
        unsubscribed: false,
      })
      if (error) throw new Error(error.message)
      return
    } catch (err) {
      console.error('[Subscribers] Audience add failed:', err.message)
      throw err
    }
  }
  if (useKV) {
    try {
      const { kv } = await import('@vercel/kv')
      const list = (await kv.get('subscribers')) || []
      if (!list.some(s => s.email === email)) {
        list.push({ email, subscribedAt: new Date().toISOString() })
        await kv.set('subscribers', list)
      }
      return
    } catch (err) {
      console.error('[Subscribers] KV add failed:', err.message)
      throw err
    }
  }
  // File fallback
  const list = loadFileSubscribers()
  if (!list.some(s => s.email === email)) {
    list.push({ email, subscribedAt: new Date().toISOString() })
    writeFileSync(FILE_PATH, JSON.stringify(list, null, 2))
  }
}

// Remove a subscriber by email
export async function removeSubscriber(email) {
  if (useAudience) {
    try {
      const resend = await getResend()
      const { data, error } = await resend.contacts.list({
        audienceId: process.env.RESEND_AUDIENCE_ID,
      })
      if (error) throw new Error(error.message)
      const contact = (data?.data ?? []).find(c => c.email === email)
      if (contact) {
        await resend.contacts.update({
          audienceId: process.env.RESEND_AUDIENCE_ID,
          id: contact.id,
          unsubscribed: true,
        })
      }
      return
    } catch (err) {
      console.error('[Subscribers] Audience remove failed:', err.message)
    }
  }
  if (useKV) {
    try {
      const { kv } = await import('@vercel/kv')
      const list = (await kv.get('subscribers')) || []
      await kv.set('subscribers', list.filter(s => s.email !== email))
      return
    } catch (err) {
      console.error('[Subscribers] KV remove failed:', err.message)
    }
  }
  // File fallback
  const list = loadFileSubscribers().filter(s => s.email !== email)
  writeFileSync(FILE_PATH, JSON.stringify(list, null, 2))
}

// Check if an email is already subscribed
export async function isSubscribed(email) {
  if (useAudience) {
    try {
      const resend = await getResend()
      const { data } = await resend.contacts.list({
        audienceId: process.env.RESEND_AUDIENCE_ID,
      })
      return (data?.data ?? []).some(c => c.email === email && !c.unsubscribed)
    } catch { return false }
  }
  const list = await loadSubscribers()
  return list.some(s => s.email === email)
}

function loadFileSubscribers() {
  for (const path of [FILE_PATH, SEED_PATH]) {
    if (existsSync(path)) {
      try { return JSON.parse(readFileSync(path, 'utf-8')) } catch {}
    }
  }
  return []
}
