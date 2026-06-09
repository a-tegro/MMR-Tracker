/**
 * Subscriber storage using Resend Contacts (v6 global contacts model).
 * Falls back to local filesystem for dev / when Resend isn't configured.
 *
 * Resend v6 dropped per-audience contacts in favour of global contacts.
 * RESEND_AUDIENCE_ID is no longer used.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FILE_PATH = process.env.VERCEL
  ? '/tmp/subscribers.json'
  : join(__dirname, '..', 'server', 'subscribers.json')
const SEED_PATH = join(__dirname, '..', 'server', 'subscribers.json')

const useResend = !!process.env.RESEND_API_KEY

async function getResend() {
  const { Resend } = await import('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

// Returns array of { email, id? }
export async function loadSubscribers() {
  if (useResend) {
    try {
      const resend = await getResend()
      const { data, error } = await resend.contacts.list()
      if (error) throw new Error(error.message)
      return (data?.data ?? [])
        .filter(c => !c.unsubscribed)
        .map(c => ({ email: c.email, id: c.id }))
    } catch (err) {
      console.error('[Subscribers] Resend list failed:', err.message)
      return []
    }
  }
  return loadFileSubscribers()
}

// Add a new subscriber
export async function addSubscriber(email) {
  if (useResend) {
    const resend = await getResend()
    const { error } = await resend.contacts.create({ email, unsubscribed: false })
    if (error) throw new Error(error.message)
    return
  }
  const list = loadFileSubscribers()
  if (!list.some(s => s.email === email)) {
    list.push({ email, subscribedAt: new Date().toISOString() })
    writeFileSync(FILE_PATH, JSON.stringify(list, null, 2))
  }
}

// Mark a subscriber as unsubscribed
export async function removeSubscriber(email) {
  if (useResend) {
    try {
      const resend = await getResend()
      // Find the contact by email to get their ID
      const { data } = await resend.contacts.list()
      const contact = (data?.data ?? []).find(c => c.email === email)
      if (contact?.id) {
        await resend.contacts.update({ id: contact.id, unsubscribed: true })
      }
    } catch (err) {
      console.error('[Subscribers] Resend unsubscribe failed:', err.message)
    }
    return
  }
  const list = loadFileSubscribers().filter(s => s.email !== email)
  writeFileSync(FILE_PATH, JSON.stringify(list, null, 2))
}

// Check if already subscribed (not unsubscribed)
export async function isSubscribed(email) {
  if (useResend) {
    try {
      const resend = await getResend()
      const { data } = await resend.contacts.list()
      return (data?.data ?? []).some(c => c.email === email && !c.unsubscribed)
    } catch {
      return false
    }
  }
  return loadFileSubscribers().some(s => s.email === email)
}

function loadFileSubscribers() {
  for (const path of [FILE_PATH, SEED_PATH]) {
    if (existsSync(path)) {
      try { return JSON.parse(readFileSync(path, 'utf-8')) } catch {}
    }
  }
  return []
}
