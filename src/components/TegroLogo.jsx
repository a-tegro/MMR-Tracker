export default function TegroLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Tp monogram — geometric approximation of the wordmark */}
      <svg width="76" height="58" viewBox="0 0 76 58" fill="#295c60" xmlns="http://www.w3.org/2000/svg">
        {/* T crossbar */}
        <rect x="0" y="0" width="55" height="13" rx="1" />
        {/* T left stem */}
        <rect x="0" y="0" width="13" height="58" rx="1" />
        {/* p stem */}
        <rect x="42" y="13" width="13" height="45" rx="1" />
        {/* p bowl — exact semicircle: from (55,13) to (55,58) r=22.5 */}
        <path d="M42 13 L55 13 A22.5 22.5 0 1 1 55 58 L42 58 Z" />
      </svg>

      {/* Wordmark */}
      <div className="leading-none">
        <div
          className="font-sans font-bold tracking-wide"
          style={{ fontSize: '20px', color: '#295c60', letterSpacing: '0.04em' }}
        >
          TEGRO
        </div>
        <div
          className="font-sans font-normal"
          style={{ fontSize: '8.5px', color: '#295c60', letterSpacing: '0.32em', marginTop: '4px' }}
        >
          PARTNERS
        </div>
      </div>
    </div>
  )
}
