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
    ? `Live search results (use these as your primary source):\n${JSON.stringify(searchResults, null, 2)}\n\n`
    : `No live search results available (Brave API not configured).\n\n`

  const prompt = `You are a nuclear industry analyst generating a structured intelligence briefing for ${reactor.company}, developer of the ${reactor.reactor} microreactor at ${reactor.site}.

${searchBlock}Current milestone status: ${milestoneStr(reactor.milestones)}

TASK: Return a JSON object categorising news and intelligence into the sections below. Follow all rules exactly.

SECTIONS:
- latestNews: Most recent general developments (last 30 days)
- funding: Investment rounds, DOE grants, government contracts, equity raises
- projectAnnouncements: Site selections, partnerships, reactor design updates, new programs
- approvals: NRC regulatory approvals, license decisions, safety certifications
- criticality: Progress toward first criticality, ZPC/FTPC/150H milestones
- permits: Construction permits, design approvals (NSDA/PDSA/FDSA submissions or grants)

MILESTONE KEYS (only include in milestoneUpdates if search results provide clear evidence):
NSDA, PDSA, FDSA, ZPC, FTPC, 150H
Status values: approved | in_review | pre_app | target | pending | unknown

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences, no explanation:
{
  "sections": {
    "latestNews": [
      { "id": "ln-1", "date": "YYYY-MM-DD", "headline": "...", "summary": "1-2 sentence summary", "source": "Publication Name", "url": "https://..." }
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
1. Each section: 0–5 items. Use [] if nothing found.
2. milestoneUpdates: only include keys where search results show a status change. Use {} if no changes.
3. date: use YYYY-MM-DD format. Use best estimate from search result age if exact date unavailable.
4. source: realistic nuclear industry publication (World Nuclear News, NucNet, NEI Magazine, Power Magazine, Nuclear Engineering International, company press release, etc.)
5. url: only include if from search results. Use "#" if unavailable.
6. id: unique short string e.g. "ln-1", "f-1", "a-2"
7. Do NOT fabricate specific funding amounts, dates, or approvals unless from search results.
8. If no live data: return empty sections — do not invent news items.`

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
