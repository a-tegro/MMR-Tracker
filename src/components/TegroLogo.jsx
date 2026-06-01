export default function TegroLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/*
        Tp monogram.
        ViewBox 0 0 108 100.
        T: crossbar (0-66, 0-16) + left stem (0-16, 0-100).
        p: D-shape with flat left from x=46, cubic-bezier bowl
           reaching ~x=99 at mid-height.
        Gap between T stem and p: x=16–46 (clearly readable T shape).
      */}
      <svg
        width="65"
        height="60"
        viewBox="0 0 108 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* T crossbar */}
        <rect x="0" y="0" width="66" height="16" rx="1.5" fill="#addfe3" />
        {/* T left stem */}
        <rect x="0" y="0" width="16" height="100" rx="1.5" fill="#addfe3" />
        {/* p — D-shape: flat left edge at x=46, bowl curves to ~x=99, flat right edge at x=66 */}
        <path
          d="M46 16 L66 16 C110 16 110 100 66 100 L46 100 Z"
          fill="#addfe3"
        />
      </svg>

      {/* Wordmark */}
      <div className="leading-none select-none">
        <div
          className="font-sans font-bold tracking-wide text-brand-text"
          style={{ fontSize: '19px', letterSpacing: '0.06em' }}
        >
          TEGRO
        </div>
        <div
          className="font-sans font-medium text-brand-text-dim"
          style={{ fontSize: '8px', letterSpacing: '0.35em', marginTop: '4px' }}
        >
          PARTNERS
        </div>
      </div>
    </div>
  )
}
