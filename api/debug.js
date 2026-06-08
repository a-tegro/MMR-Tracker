// Temporary diagnostic endpoint — shows which env vars are present (names only, never values)
export default function handler(req, res) {
  const keys = Object.keys(process.env)
  const relevant = keys.filter(k =>
    k.startsWith('ANTHROPIC') ||
    k.startsWith('BRAVE') ||
    k.startsWith('KV_') ||
    k.startsWith('VERCEL') ||
    k === 'NODE_ENV' ||
    k === 'PORT'
  )
  res.json({
    relevantEnvKeys: relevant,
    allKeyCount: keys.length,
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
  })
}
