import { useState } from 'react'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Subscription failed')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-brand-teal">✓</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-brand-text-muted">
          Alerts active
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap justify-end">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="email for milestone alerts"
        required
        disabled={status === 'loading'}
        className="bg-brand-card border border-brand-border rounded px-2.5 py-1.5 text-[11px] font-mono text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-teal transition-colors w-44 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded border border-brand-teal text-brand-teal hover:bg-brand-teal/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {status === 'loading' ? '…' : 'Get Alerts'}
      </button>
      {status === 'error' && errorMsg && (
        <span className="font-mono text-[10px] text-amber-400 w-full text-right">
          {errorMsg}
        </span>
      )}
    </form>
  )
}
