import { useState, Fragment } from 'react'
import { reactors, MILESTONES } from '../data/reactors'
import StatusBadge from './StatusBadge'
import CompanyPanel from './CompanyPanel'
import { useMilestoneUpdates } from '../hooks/useMilestoneUpdates'

const COL_COUNT = 3 + MILESTONES.length // rank + company + site + 6 milestones

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 text-brand-teal transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function TrackerTable() {
  const [expandedRank, setExpandedRank] = useState(null)
  const milestoneUpdates = useMilestoneUpdates()

  function toggle(rank) {
    setExpandedRank(prev => (prev === rank ? null : rank))
  }

  // Merge scan-detected updates over the static milestone data for a given reactor
  function getMilestone(reactor, milestoneKey) {
    const companyKey = `r${reactor.rank}`
    const override = milestoneUpdates[companyKey]?.[milestoneKey]
    if (override) {
      return { ...reactor.milestones[milestoneKey], ...override, scanUpdated: true }
    }
    return reactor.milestones[milestoneKey]
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-brand-border">
      <table className="w-full text-sm border-collapse min-w-[720px]">
        <thead>
          <tr className="border-b border-brand-border bg-brand-surface">
            <th className="text-left px-3 py-2.5 w-8">
              <span className="font-mono text-[10px] text-brand-muted">#</span>
            </th>
            <th className="text-left px-3 py-2.5 min-w-[200px]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-text-muted">
                Company · Reactor
              </span>
            </th>
            <th className="text-left px-3 py-2.5 min-w-[140px]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-text-muted">
                Pilot Site
              </span>
            </th>
            {MILESTONES.map(m => (
              <th key={m} className="text-center px-2 py-2.5 w-16">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-teal">
                  {m}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reactors.map((r, idx) => {
            const isOpen = expandedRank === r.rank
            return (
              <Fragment key={r.rank}>
                {/* Company row */}
                <tr
                  onClick={() => toggle(r.rank)}
                  className={`border-b border-brand-border cursor-pointer select-none transition-colors ${
                    isOpen
                      ? 'bg-brand-card'
                      : idx % 2 === 0
                      ? 'bg-brand-dark hover:bg-brand-teal/5'
                      : 'bg-brand-surface/50 hover:bg-brand-teal/5'
                  }`}
                >
                  {/* Rank */}
                  <td className="px-3 py-3">
                    <span className={`font-mono text-[11px] transition-colors ${isOpen ? 'text-brand-teal' : 'text-brand-muted'}`}>
                      {String(r.rank).padStart(2, '0')}
                    </span>
                  </td>

                  {/* Company + Reactor + chevron */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <div className={`font-sans font-semibold text-sm tracking-wide leading-tight transition-colors ${isOpen ? 'text-brand-teal-light' : 'text-brand-text'}`}>
                          {r.company}
                        </div>
                        <div className="font-mono text-[11px] text-brand-teal mt-0.5">
                          {r.reactor}
                        </div>
                      </div>
                      <ChevronIcon open={isOpen} />
                    </div>
                  </td>

                  {/* Site */}
                  <td className="px-3 py-3">
                    <div className="text-[12px] text-brand-text-dim leading-tight">{r.site}</div>
                    {r.siteState && (
                      <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mt-0.5">
                        {r.siteState}
                      </div>
                    )}
                  </td>

                  {/* Milestones — static data overlaid with any scan-detected updates */}
                  {MILESTONES.map(m => {
                    const milestone = getMilestone(r, m)
                    return (
                      <td key={m} className="px-2 py-3 text-center">
                        <div className="flex justify-center">
                          <StatusBadge
                            status={milestone.status}
                            date={milestone.date}
                            scanUpdated={!!milestone.scanUpdated}
                          />
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Expandable panel */}
                {isOpen && (
                  <CompanyPanel reactor={r} colSpan={COL_COUNT} />
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
