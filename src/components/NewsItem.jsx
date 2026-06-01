export default function NewsItem({ item }) {
  const isLink = item.url && item.url !== '#'

  const Wrapper = isLink ? 'a' : 'div'
  const wrapperProps = isLink
    ? { href: item.url, target: '_blank', rel: 'noopener noreferrer', className: 'group' }
    : { className: 'group' }

  return (
    <Wrapper {...wrapperProps}>
      <div className="flex items-start gap-3 px-3 py-3 rounded-md border border-transparent hover:border-brand-border hover:bg-brand-surface/60 transition-colors">
        <div className="w-1 h-full min-h-[36px] rounded-full bg-brand-teal/40 shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-brand-text leading-snug group-hover:text-brand-teal-light transition-colors">
              {item.headline}
            </p>
            <span className="font-mono text-[10px] text-brand-muted shrink-0 mt-0.5 whitespace-nowrap">
              {item.date}
            </span>
          </div>
          {item.summary && (
            <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">{item.summary}</p>
          )}
          {item.source && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] font-mono text-brand-teal">{item.source}</span>
              {isLink && <span className="text-[10px] text-brand-teal">↗</span>}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
