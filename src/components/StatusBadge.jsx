const STATUS_STYLES = {
  approved:  { bg: 'bg-green-700',         border: 'border-green-500',    text: 'text-green-100',      ring: 'ring-green-500' },
  in_review: { bg: 'bg-amber-500',         border: 'border-amber-400',    text: 'text-amber-100',      ring: 'ring-amber-400' },
  pre_app:   { bg: 'bg-brand-card',        border: 'border-brand-border', text: 'text-brand-teal',     ring: '' },
  target:    { bg: 'bg-brand-teal',        border: 'border-brand-teal',   text: 'text-white',          ring: 'ring-brand-teal' },
  pending:   { bg: 'bg-transparent',       border: 'border-brand-border', text: 'text-brand-muted',    ring: '' },
  unknown:   { bg: 'bg-transparent',       border: 'border-brand-border', text: 'text-brand-muted/50', ring: '' },
}

const ICONS = {
  approved:  () => (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
      <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  in_review: () => (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3" fill="currentColor" />
    </svg>
  ),
  pre_app: () => (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  target: () => (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  ),
  pending: () => (
    <span className="text-sm font-mono leading-none select-none">—</span>
  ),
  unknown: () => (
    <span className="text-sm font-mono leading-none select-none">?</span>
  ),
}

export default function StatusBadge({ status, date, scanUpdated = false }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.unknown
  const Icon = ICONS[status] || ICONS.unknown

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative">
        <div className={`flex items-center justify-center w-7 h-7 rounded-full border ${styles.border} ${styles.bg} ${styles.text}`}>
          <Icon />
        </div>
        {/* Scan-detected update indicator — small teal dot in the top-right corner */}
        {scanUpdated && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-teal border border-brand-dark"
            title="Updated by weekly market scan"
          />
        )}
      </div>
      {date && (
        <span className="text-[9px] font-mono text-brand-text-muted leading-none whitespace-nowrap">
          {date}
        </span>
      )}
    </div>
  )
}
