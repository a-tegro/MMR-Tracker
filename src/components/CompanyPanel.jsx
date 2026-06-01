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

function ScanSpinner() {
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
  const { data, loading, scanning, error, triggerScan } = useCompanyNews(reactor)

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

              <div className="flex items-center gap-3 shrink-0">
                {data?.lastScan && (
                  <span className="font-mono text-[10px] text-brand-muted">
                    Last scan: {formatDate(data.lastScan)}
                  </span>
                )}
                <button
                  onClick={triggerScan}
                  disabled={scanning || loading}
                  className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded border border-brand-teal text-brand-teal hover:bg-brand-teal/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {scanning ? <><ScanSpinner /> Scanning…</> : 'Run Scan'}
                </button>
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

              {/* Loading state */}
              {loading && (
                <div className="flex items-center gap-3 py-10 text-brand-muted">
                  <ScanSpinner />
                  <span className="font-mono text-xs uppercase tracking-widest">Loading cached data…</span>
                </div>
              )}

              {/* Scanning state */}
              {scanning && !loading && (
                <div className="flex items-center gap-3 py-10 text-brand-teal">
                  <ScanSpinner />
                  <span className="font-mono text-xs uppercase tracking-widest">
                    Running market scan — this may take 15–30 seconds…
                  </span>
                </div>
              )}

              {/* Error state */}
              {!loading && !scanning && error && (
                <div className="py-6 px-3">
                  <p className="font-mono text-xs text-amber-400">{error}</p>
                </div>
              )}

              {/* No data state */}
              {!loading && !scanning && !error && data === null && (
                <div className="py-8 text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                    No scan data yet
                  </p>
                  <p className="text-xs text-brand-text-muted mt-2">
                    Click <strong className="text-brand-teal">Run Scan</strong> to fetch the latest intelligence on this company
                  </p>
                </div>
              )}

              {/* Empty tab */}
              {!loading && !scanning && !error && data !== null && activeItems.length === 0 && (
                <div className="py-8 text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                    No items in this category
                  </p>
                  <p className="text-xs text-brand-text-muted mt-1">
                    Run a new scan to check for recent updates
                  </p>
                </div>
              )}

              {/* News items */}
              {!loading && !scanning && !error && activeItems.length > 0 && (
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
