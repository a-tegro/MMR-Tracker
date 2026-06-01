import { MILESTONE_LABELS, MILESTONE_SUBLABELS, STATUS_META, MILESTONES } from '../data/reactors'
import StatusBadge from './StatusBadge'

export default function MilestoneLegend() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
      {/* Milestone sequence */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3">
          Milestone Sequence
        </div>
        <div className="space-y-3">
          {MILESTONES.map(m => (
            <div key={m} className="flex gap-3">
              <div className="font-mono text-xs font-bold text-brand-orange w-10 shrink-0 pt-0.5">{m}</div>
              <div>
                <div className="text-[10px] font-mono text-zinc-300 uppercase tracking-wide">{m}</div>
                <div className="text-[11px] text-zinc-500">{MILESTONE_LABELS[m]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status key */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3">
          Status Key
        </div>
        <div className="space-y-3">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div key={key} className="flex items-start gap-3">
              <div className="shrink-0 pt-0.5">
                <StatusBadge status={key} />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-zinc-200">{meta.label}</div>
                <div className="text-[11px] text-zinc-500">{meta.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
