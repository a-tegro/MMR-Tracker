import Anthropic from '@anthropic-ai/sdk'

const SECTION_KEYS = ['latestNews', 'funding', 'projectAnnouncements', 'approvals', 'criticality', 'permits']

function milestoneStr(milestones) {
  return Object.entries(milestones)
    .map(([k, v]) => `${k}: ${v.status}${v.date ? ` (${v.date})` : ''}`)
    .join(', ')
}

async function searchBrave(query) {
  if (!process.env.BRAVE_API_KEY) return []
  try {
    const url = `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(query)}&count=12&freshness=pm`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).map(r => ({
      title: r.title,
      description: r.description,
      url: r.url,
      age: r.age,
    }))
  } catch {
    return []
  }
}

export async function scanCompany(reactor) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const searchResults = await searchBrave(
    `"${reactor.company}" nuclear reactor ${reactor.reactor} 2025 2026`
  )

  const hasLiveData = searchResults.length > 0
  const searchBlock = hasLiveData
    ? `Live search results (use as primary source):\n${JSON.stringify(searchResults, null, 2)}\n\n`
    : `No live search feed available. Use your training knowledge about this company.\n\n`

  const prompt = `You are a nuclear industry analyst generating a structured intelligence briefing for ${reactor.company}, developer of the ${reactor.reactor} microreactor at ${reactor.site}.

${searchBlock}Current milestone status: ${milestoneStr(reactor.milestones)}
Today's date context: mid-2026, under U.S. Executive Order 14301 (federal reactor pilot program, July 4 2026 criticality deadline).

TASK: Return a JSON object with categorised intelligence for each section. Draw on your training knowledge about this company — funding history, regulatory filings, partnerships, public announcements, and development milestones. Be specific and factual; do not fabricate events you have no basis for.

SECTIONS:
- latestNews: Most significant recent general developments
- funding: Investment rounds, DOE grants, government contracts, equity raises
- projectAnnouncements: Site selections, partnerships, reactor design updates, new programs
- approvals: NRC regulatory approvals, license decisions, safety certifications
- criticality: Progress toward first criticality, ZPC/FTPC/150H milestones
- permits: Design or construction permits — NSDA/PDSA/FDSA submissions and grants

MILESTONE KEYS — only include in milestoneUpdates if you have clear evidence of a change from the current status above:
NSDA, PDSA, FDSA, ZPC, FTPC, 150H
Status values: approved | in_review | pre_app | target | pending | unknown

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences, no explanation:
{
  "sections": {
    "latestNews": [
      { "id": "ln-1", "date": "YYYY-MM-DD", "headline": "...", "summary": "1-2 sentence summary.", "source": "Publication Name", "url": "#" }
    ],
    "funding": [],
    "projectAnnouncements": [],
    "approvals": [],
    "criticality": [],
    "permits": []
  },
  "milestoneUpdates": {}
}

RULES:
1. Each section: 0–5 items. Use [] only if you genuinely have no information for that category.
2. milestoneUpdates: only include keys where you have evidence of a status change. Use {} if none.
3. date: YYYY-MM-DD. Estimate from known context if exact date unavailable (e.g. "2025-11-01").
4. source: realistic nuclear industry publication — World Nuclear News, NucNet, NEI Magazine, Power Magazine, Nuclear Engineering International, company press release, DOE announcement, NRC docket, etc.
5. url: use "#" unless you have a real URL from search results.
6. id: unique short string e.g. "ln-1", "f-1", "a-2".
7. Do NOT fabricate specific dollar amounts, named individuals, or NRC docket numbers unless you are confident they are accurate.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()
  // Strip any accidental markdown fences
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    // Attempt to extract JSON object from response
    const match = jsonStr.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`Could not parse scanner response: ${raw.slice(0, 200)}`)
    parsed = JSON.parse(match[0])
  }

  // Ensure all section keys exist
  for (const key of SECTION_KEYS) {
    parsed.sections[key] = parsed.sections[key] ?? []
  }
  parsed.milestoneUpdates = parsed.milestoneUpdates ?? {}

  return parsed
}
