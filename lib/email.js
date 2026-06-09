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

function buildWelcomeHtml({ recipientEmail }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0C1B1E;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 24px;">

    <!-- Header -->
    <div style="border-bottom:1px solid #1f4f54;padding-bottom:20px;margin-bottom:28px;">
      <div style="font-family:monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#5f9ea3;margin-bottom:12px;">
        MMR Criticality Tracker
      </div>
      <div style="font-size:26px;font-weight:bold;color:#fbffff;line-height:1.2;margin-bottom:6px;">
        Welcome to the<br><span style="color:#348385;">Race to Criticality</span>
      </div>
    </div>

    <!-- Body -->
    <p style="font-size:13px;color:#addfe3;margin:0 0 20px;line-height:1.7;">
      You're now subscribed to milestone alerts for the U.S. Advanced Reactor Pilot Program.
      Twelve nuclear startups are racing to achieve first criticality by <strong style="color:#fbffff;">July 4, 2026</strong>
      under Executive Order 14301.
    </p>

    <!-- What you'll receive -->
    <div style="background:#143639;border:1px solid #1f4f54;border-radius:6px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-family:monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#5f9ea3;margin-bottom:14px;">
        You'll be notified when
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          ${[
            ['NSDA', 'Nuclear Safety Design Agreement'],
            ['PDSA', 'Preliminary Documented Safety Analysis'],
            ['FDSA', 'Final Documented Safety Analysis'],
            ['ZPC',  'Zero-Power Criticality'],
            ['FTPC', 'Full Temperature & Power'],
            ['150H', '150-Hour Continuous Operation'],
          ].map(([key, label]) => `
          <tr>
            <td style="font-family:monospace;font-size:11px;color:#348385;padding:5px 14px 5px 0;white-space:nowrap;font-weight:bold;">${key}</td>
            <td style="font-size:12px;color:#addfe3;padding:5px 0;">${label}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="font-family:monospace;font-size:10px;color:#5f9ea3;margin-top:14px;">
        Scans run automatically every Sunday at 02:00 UTC
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${BASE_URL}" style="display:inline-block;background:#348385;color:#fbffff;text-decoration:none;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;padding:11px 28px;border-radius:4px;">
        View the Tracker
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1f4f54;padding-top:16px;text-align:center;">
      <p style="font-family:monospace;font-size:10px;color:#5f9ea3;margin:0 0 6px;">
        Powered by Tegro Capital · Weekly AI market scan
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
 * Send a welcome email to a newly subscribed user.
 * Silently skips if RESEND_API_KEY is not set.
 */
export async function sendWelcomeEmail(email) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'MMR Tracker <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to the MMR Criticality Tracker',
      html: buildWelcomeHtml({ recipientEmail: email }),
      text: [
        `Welcome to the MMR Criticality Tracker`,
        ``,
        `You're now subscribed to milestone alerts for the U.S. Advanced Reactor Pilot Program.`,
        ``,
        `You'll receive an email whenever a milestone status changes for any of the 12 tracked reactors:`,
        `NSDA · PDSA · FDSA · ZPC · FTPC · 150H`,
        ``,
        `Scans run every Sunday at 02:00 UTC.`,
        ``,
        `View the tracker: ${BASE_URL}`,
        ``,
        `Unsubscribe: ${unsubscribeUrl(email)}`,
      ].join('\n'),
    })
    console.log(`[Email] Welcome email sent to ${email}`)
  } catch (err) {
    console.error(`[Email] Failed to send welcome to ${email}:`, err.message)
  }
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
