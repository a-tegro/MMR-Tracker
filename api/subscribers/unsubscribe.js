import { removeSubscriber } from '../../lib/subscribers.js'

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} · MMR Tracker</title>
  <style>
    body{margin:0;padding:0;background:#0C1B1E;color:#fbffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .card{max-width:400px;width:100%;padding:40px 32px;border:1px solid #1f4f54;border-radius:8px;background:#143639;text-align:center;}
    .icon{font-size:28px;margin-bottom:16px;}
    h1{font-size:18px;font-weight:bold;margin:0 0 10px;}
    p{font-size:13px;color:#addfe3;margin:0 0 24px;line-height:1.6;}
    a{display:inline-block;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#348385;text-decoration:none;border:1px solid #348385;padding:8px 20px;border-radius:4px;}
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed')
  }

  const { token } = req.query
  if (!token) {
    return res.status(400).send(page('Error', `
      <div class="icon">⚠</div>
      <h1>Invalid Link</h1>
      <p>This unsubscribe link is invalid or has expired.</p>
      <a href="/">Back to tracker</a>
    `))
  }

  let email
  try {
    email = Buffer.from(token, 'base64url').toString('utf-8')
    if (!email.includes('@')) throw new Error('not an email')
  } catch {
    return res.status(400).send(page('Error', `
      <div class="icon">⚠</div>
      <h1>Invalid Link</h1>
      <p>This unsubscribe link could not be decoded.</p>
      <a href="/">Back to tracker</a>
    `))
  }

  await removeSubscriber(email.toLowerCase())
  console.log(`[Subscribers] Unsubscribed: ${email}`)

  res.setHeader('Content-Type', 'text/html')
  res.send(page('Unsubscribed', `
    <div class="icon" style="color:#348385;">✓</div>
    <h1>Unsubscribed</h1>
    <p>${email} has been removed from milestone alerts.<br>You won't receive any further notifications.</p>
    <a href="/">Back to tracker</a>
  `))
}
