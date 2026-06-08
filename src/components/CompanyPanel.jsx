import { useState } from 'react'
import { useCompanyNews } from '../hooks/useCompanyNews'
import NewsItem from './NewsItem'

const TABS = [
  { key: 'latestNews',           label: 'Latest News',     icon: '◉' },
  { key: 'funding',              label: 'Funding',         icon: '$' },
  { key: 'approvals',            label: 'Approvals',       icon: '✓' },
  { key: 'permits',              label: 'Permits',         icon: '⊡' },
  { key: 'projectAnnouncements', label: 'Projects',        icon: '◈' },
  { key: 'criticality',          label: 'Criticality',     icon: '⚛' },
]

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function nextSundayDate() {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday
  const daysUntil = day === 0 ? 7 : 7 - day
  const next = new Date(now)
  next.setUTCDate(now.getUTCDate() + daysUntil)
  next.setUTCHours(2, 0, 0, 0)
  return next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Spinner() {
  return (
    <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
  )
}

function MilestoneUpdateBadge({ updates }) {
  const entries = Object.entries(updates)
  if (!entries.length) return null
  return (
    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded border border-brand-teal/40 bg-brand-teal/10">
      <span className="text-brand-teal text-xs">⚑</span>
      <span className="text-xs text-brand-text-dim font-mono">
        Scan detected milestone updates:{' '}
        {entries.map(([k, v]) => `${k} → ${v.status}${v.date ? ` (${v.date})` : ''}`).join(' · ')}
      </span>
    </div>
  )
}

export default function CompanyPanel({ reactor, colSpan }) {
  const [activeTab, setActiveTab] = useState('latestNews')
  const { data, loading, error } = useCompanyNews(reactor)

  const sections = data?.sections ?? {}
  const milestoneUpdates = data?.milestoneUpdates ?? {}
  const activeItems = sections[activeTab] ?? []

  return (
    <tr>
      <td colSpan={colSpan} className="p-0 border-b border-brand-border">
        <div className="bg-brand-card border-t border-brand-teal/25">
          <div className="px-6 pt-5 pb-6">

            {/* Panel header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-baseline gap-3">
                  <h3 className="font-sans font-bold text-brand-text text-base tracking-wide">
                    {reactor.company}
                  </h3>
                  <span className="font-mono text-brand-teal text-xs">{reactor.reactor}</span>
                </div>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  {reactor.site}{reactor.siteState ? `, ${reactor.siteState}` : ''}
                </p>
              </div>

              {/* Scan cadence info */}
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                {data?.lastScan ? (
                  <span className="font-mono text-[10px] text-brand-muted">
                    Updated {formatDate(data.lastScan)}
                  </span>
                ) : null}
                <span className="font-mono text-[10px] text-brand-muted/60">
                  Auto-scan · Next {nextSundayDate()}
                </span>
              </div>
            </div>

            {/* Milestone update banner */}
            {Object.keys(milestoneUpdates).length > 0 && (
              <MilestoneUpdateBadge updates={milestoneUpdates} />
            )}

            {/* Tabs */}
            <div className="flex gap-0 border-b border-brand-border mb-5 overflow-x-auto scrollbar-thin">
              {TABS.map(tab => {
                const count = (sections[tab.key] ?? []).length
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-mono uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                      isActive
                        ? 'border-brand-teal text-brand-teal'
                        : 'border-transparent text-brand-muted hover:text-brand-text-muted hover:border-brand-border'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          isActive
                            ? 'bg-brand-teal/20 text-brand-teal'
                            : 'bg-brand-border text-brand-muted'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Content area */}
            <div className="min-h-[100px]">

              {loading && (
                <div className="flex items-center gap-3 py-10 text-brand-muted">
                  <Spinner />
                  <span className="font-mono text-xs uppercase tracking-widest">Loading…</span>
                </div>
              )}

              {!loading && error && (
                <div className="py-6 px-3">
                  <p className="font-mono text-xs text-amber-400">{error}</p>
                </div>
              )}

              {!loading && !error && data === null && (
                <div className="py-10 text-center space-y-2">
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                    Awaiting first scan
                  </p>
                  <p className="text-xs text-brand-text-muted">
                    Market intelligence is gathered automatically each week.
                  </p>
                  <p className="font-mono text-[10px] text-brand-muted/60">
                    Next run: Sunday {nextSundayDate()} · 02:00 UTC
                  </p>
                </div>
              )}

              {!loading && !error && data !== null && activeItems.length === 0 && (
                <div className="py-8 text-center space-y-1">
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                    No items in this category
                  </p>
                  <p className="text-xs text-brand-text-muted">
                    Will update at next weekly scan
                  </p>
                </div>
              )}

              {!loading && !error && activeItems.length > 0 && (
                <div className="space-y-1">
                  {activeItems.map(item => (
                    <NewsItem key={item.id} item={item} />
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}
