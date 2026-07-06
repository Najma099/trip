export default function VerdictBadge({ isLegal, testId }) {
  if (isLegal) {
    return (
      <div
        data-testid={testId || 'verdict-badge-legal'}
        className="sp-badge-in inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-50 shadow-sm backdrop-blur-sm"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M8 12.5l3 3 5.5-6.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sp-check-draw"
          />
        </svg>
        <span>Legal trip plan</span>
        <span className="hidden text-[11px] uppercase tracking-[0.12em] text-emerald-100/70 sm:inline">
          · FMCSA §395
        </span>
      </div>
    )
  }

  return (
    <div
      data-testid="verdict-badge-illegal"
      className="sp-badge-in inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-400/15 px-4 py-2 text-sm font-medium text-red-50 shadow-sm backdrop-blur-sm"
    >
      <span>Trip not completable</span>
    </div>
  )
}
