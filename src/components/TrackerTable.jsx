import { reactors, MILESTONES } from '../data/reactors'
import StatusBadge from './StatusBadge'

export default function TrackerTable() {
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
          {reactors.map((r, idx) => (
            <tr
              key={r.rank}
              className={`border-b border-brand-border transition-colors hover:bg-brand-teal/5 ${
                idx % 2 === 0 ? 'bg-brand-dark' : 'bg-brand-surface/50'
              }`}
            >
              {/* Rank */}
              <td className="px-3 py-3">
                <span className="font-mono text-[11px] text-brand-muted">
                  {String(r.rank).padStart(2, '0')}
                </span>
              </td>

              {/* Company + Reactor */}
              <td className="px-3 py-3">
                <div className="font-sans font-semibold text-brand-text text-sm tracking-wide leading-tight">
                  {r.company}
                </div>
                <div className="font-mono text-[11px] text-brand-teal mt-0.5">
                  {r.reactor}
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

              {/* Milestones */}
              {MILESTONES.map(m => {
                const ms = r.milestones[m]
                return (
                  <td key={m} className="px-2 py-3 text-center">
                    <div className="flex justify-center">
                      <StatusBadge status={ms.status} date={ms.date} />
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
