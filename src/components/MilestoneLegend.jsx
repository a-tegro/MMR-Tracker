import { MILESTONE_LABELS, MILESTONES, STATUS_META } from '../data/reactors'
import StatusBadge from './StatusBadge'

export default function MilestoneLegend() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-2">
      {/* Milestone sequence */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted mb-4">
          Milestone Sequence
        </div>
        <div className="space-y-4">
          {MILESTONES.map(m => (
            <div key={m} className="flex gap-3">
              <div className="font-mono text-xs font-bold text-brand-teal w-10 shrink-0 pt-0.5">{m}</div>
              <div>
                <div className="text-[11px] font-semibold text-brand-text-dim uppercase tracking-wide">{m}</div>
                <div className="text-[11px] text-brand-text-muted mt-0.5">{MILESTONE_LABELS[m]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status key */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted mb-4">
          Status Key
        </div>
        <div className="space-y-4">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div key={key} className="flex items-start gap-3">
              <div className="shrink-0 pt-0.5">
                <StatusBadge status={key} />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-brand-text">{meta.label}</div>
                <div className="text-[11px] text-brand-text-muted mt-0.5">{meta.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
