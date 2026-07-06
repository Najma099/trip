import { Route, Timer, Gauge, CalendarDays } from 'lucide-react'

const ICONS = {
  distance: Route,
  drive: Timer,
  cycle: Gauge,
  days: CalendarDays,
}

export default function StatCard({ testId, label, display, hint, icon = 'distance', highlight = false }) {
  const Icon = ICONS[icon] || Route

  return (
    <div
      data-testid={testId}
      className={`sp-stat-card group relative flex flex-col gap-2 rounded-xl border p-5 shadow-sm transition-all duration-200 sm:p-6 hover:-translate-y-1 hover:shadow-md ${
        highlight
          ? 'border-[color:var(--sp-primary)]/30 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-white hover:shadow-lg'
          : 'border-[color:var(--sp-border)] bg-white hover:border-[color:var(--sp-border-strong)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
            highlight ? 'text-white/70' : 'text-[color:var(--sp-text-tertiary)]'
          }`}
        >
          {label}
        </span>
        <span
          className={`sp-stat-icon grid h-8 w-8 place-items-center rounded-lg transition-colors ${
            highlight
              ? 'bg-white/10 text-white'
              : 'bg-[color:var(--sp-bg)] text-[color:var(--sp-accent)]'
          }`}
        >
          <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-sora text-3xl font-semibold tracking-tight tabular-nums sm:text-[2rem] ${
            highlight ? 'text-white' : 'text-[color:var(--sp-text)]'
          }`}
        >
          {display}
        </span>
        {hint && (
          <span
            className={`text-sm font-medium ${
              highlight ? 'text-white/60' : 'text-[color:var(--sp-text-tertiary)]'
            }`}
          >
            {hint}
          </span>
        )}
      </div>
    </div>
  )
}
