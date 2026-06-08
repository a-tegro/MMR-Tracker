import { MILESTONE_LABELS, STATUS_META } from '../src/data/reactors.js'

const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://mmr-tracker.vercel.app'

function unsubscribeUrl(email) {
  const token = Buffer.from(email).toString('base64url')
  return `${BASE_URL}/api/subscribers/unsubscribe?token=${token}`
}

function statusLabel(status) {
  return STATUS_META[status]?.label ?? status
}

function statusColor(status) {
  const map = {
    approved:  '#22c55e',
    in_review: '#F59E0B',
    target:    '#348385',
    pre_app:   '#addfe3',
    pending:   '#5f9ea3',
    unknown:   '#5f9ea3',
  }
  return map[status] ?? '#5f9ea3'
}

function buildEmailHtml({ reactor, milestoneUpdates, recipientEmail }) {
  const rows = Object.entries(milestoneUpdates).map(([key, val]) => {
    const label = MILESTONE_LABELS[key] ?? key
    const color = statusColor(val.status)
    const dateStr = val.date ? `<span style="font-family:monospace;font-size:10px;color:#5f9ea3;margin-left:8px;">${val.date}</span>` : ''
    return `
      <tr>
        <td style="font-family:monospace;font-size:11px;color:#addfe3;padding:8px 12px 8px 0;white-space:nowrap;font-weight:bold;">${key}</td>
        <td style="font-size:12px;color:#addfe3;padding:8px 12px 8px 0;">${label}</td>
        <td style="padding:8px 0;white-space:nowrap;">
          <span style="font-family:monospace;font-size:11px;font-weight:bold;color:${color};">
            ${statusLabel(val.status)}
          </span>
          ${dateStr}
        </td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0C1B1E;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 24px;">

    <!-- Header -->
    <div style="border-bottom:1px solid #1f4f54;padding-bottom:20px;margin-bottom:24px;">
      <div style="font-family:monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#5f9ea3;margin-bottom:10px;">
        MMR Criticality Tracker · Milestone Alert
      </div>
      <div style="font-size:22px;font-weight:bold;color:#fbffff;margin-bottom:4px;">${reactor.company}</div>
      <div style="font-family:monospace;font-size:12px;color:#348385;">${reactor.reactor} · ${reactor.site}</div>
    </div>

    <!-- Body -->
    <p style="font-size:13px;color:#addfe3;margin:0 0 20px;line-height:1.6;">
      A milestone status change has been detected for this company during the weekly market scan:
    </p>

    <!-- Milestone table -->
    <div style="background:#143639;border:1px solid #1f4f54;border-radius:6px;padding:4px 20px 4px;margin-bottom:28px;">
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${rows}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${BASE_URL}" style="display:inline-block;background:#348385;color:#fbffff;text-decoration:none;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;padding:11px 28px;border-radius:4px;">
        View Full Tracker
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1f4f54;padding-top:16px;text-align:center;">
      <p style="font-family:monospace;font-size:10px;color:#5f9ea3;margin:0 0 6px;">
        You're receiving this because you subscribed to MMR milestone alerts.
      </p>
      <a href="${unsubscribeUrl(recipientEmail)}" style="font-family:monospace;font-size:10px;color:#5f9ea3;">
        Unsubscribe
      </a>
    </div>

  </div>
</body>
</html>`
}

/**
 * Send milestone alert emails to all subscribers.
 * Silently skips if RESEND_API_KEY is not set.
 */
export async function sendMilestoneAlert(subscribers, reactor, milestoneUpdates) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping email notifications')
    return
  }
  if (!subscribers.length) return

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const subject = `Milestone Update — ${reactor.company} · ${reactor.reactor}`
  const milestoneKeys = Object.keys(milestoneUpdates).join(', ')
  const textBody = [
    `MMR Criticality Tracker — Milestone Alert`,
    ``,
    `${reactor.company} (${reactor.reactor}) — ${reactor.site}`,
    ``,
    `Milestone changes detected:`,
    ...Object.entries(milestoneUpdates).map(([k, v]) =>
      `  ${k}: ${statusLabel(v.status)}${v.date ? ` (${v.date})` : ''}`
    ),
    ``,
    `View the tracker: ${BASE_URL}`,
  ].join('\n')

  let sent = 0
  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? 'MMR Tracker <onboarding@resend.dev>',
        to: sub.email,
        subject,
        html: buildEmailHtml({ reactor, milestoneUpdates, recipientEmail: sub.email }),
        text: textBody,
      })
      sent++
    } catch (err) {
      console.error(`[Email] Failed to send to ${sub.email}:`, err.message)
    }
  }
  console.log(`[Email] Sent ${sent}/${subscribers.length} alerts for ${reactor.company} (${milestoneKeys})`)
}
