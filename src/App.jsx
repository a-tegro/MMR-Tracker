import Countdown from './components/Countdown'
import TrackerTable from './components/TrackerTable'
import MilestoneLegend from './components/MilestoneLegend'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Top bar */}
      <div className="border-b border-brand-border bg-brand-surface/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3">
          <div className="w-3 h-0.5 bg-brand-orange" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Executive Order 14301 · Pilot Program Tracker
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div>
            <h1 className="font-mono font-bold leading-none">
              <span className="text-5xl sm:text-7xl text-white block">RACE TO</span>
              <span className="text-5xl sm:text-7xl text-brand-orange block">CRITICALITY</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-4 max-w-lg leading-relaxed">
              Twelve advanced reactor designs from U.S. nuclear startups racing toward
              zero-power criticality and continuous operation under the federal reactor
              pilot program.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Live Tracker
              </span>
              <span className="font-mono text-[10px] text-zinc-600 ml-2">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Live countdown */}
          <div className="sm:text-right">
            <Countdown />
          </div>
        </div>

        {/* Deadline banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-brand-border bg-brand-surface px-5 py-4">
          <div className="shrink-0">
            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1">
              Criticality Deadline
            </div>
            <div className="font-mono font-bold text-white text-xl tracking-wide">
              JULY 4 · 2026
            </div>
          </div>
          <div className="h-10 w-px bg-brand-border hidden sm:block mx-4" />
          <p className="text-[11px] font-mono uppercase tracking-wide text-zinc-400 leading-relaxed">
            Per Executive Order 14301 — All pilot reactors to achieve first criticality by
            U.S. 250th birthday
          </p>
          <div className="sm:ml-auto shrink-0">
            <div className="bg-brand-orange text-white font-mono font-bold text-2xl px-5 py-2 rounded">
              T–{Math.ceil((new Date('2026-07-04') - new Date()) / (1000 * 60 * 60 * 24))}
              <span className="text-sm font-normal ml-1">DAYS</span>
            </div>
          </div>
        </div>

        {/* Tracker table */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              All Reactors
            </div>
            <div className="h-px flex-1 bg-brand-border" />
            <div className="font-mono text-[10px] text-zinc-600">
              {12} reactors tracking
            </div>
          </div>
          <TrackerTable />
        </div>

        {/* Legend */}
        <div className="rounded-lg border border-brand-border bg-brand-surface px-6 py-6">
          <MilestoneLegend />
        </div>

        {/* Footer */}
        <div className="border-t border-brand-border pt-6 flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-orange" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              This Week in Nuclear
            </span>
          </div>
          <div className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
            Source · Master Program Spreadsheet (v3.0)
          </div>
          <div className="font-mono text-[10px] text-zinc-700">
            · 12 Reactors Tracking
          </div>
        </div>

      </div>
    </div>
  )
}
