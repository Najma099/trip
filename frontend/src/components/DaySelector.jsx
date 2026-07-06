export default function DaySelector({ dailyLogs = [], selectedDate, onSelect }) {
  if (!dailyLogs.length) return null

  return (
    <div data-testid="day-selector" className="sp-scroll -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-2">
      {dailyLogs.map((day, i) => {
        const d = new Date(day.date + 'T12:00:00')
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
        const mo = String(d.getMonth() + 1).padStart(2, '0')
        const yr = String(d.getFullYear()).slice(-2)
        const dayNum = d.getDate()
        const driving = day.total_driving_hours?.toFixed?.(1) ?? '0'
        const isActive = day.date === selectedDate

        return (
          <button
            key={day.date}
            type="button"
            data-testid={`day-pill-${i}`}
            onClick={() => onSelect?.(day.date)}
            className={`flex min-w-[110px] flex-col items-start gap-0.5 rounded-xl border px-4 py-2.5 text-left transition-all ${
              isActive
                ? 'border-[color:var(--sp-primary)] bg-[color:var(--sp-primary)] text-white shadow-sm'
                : 'border-[color:var(--sp-border)] bg-white text-[color:var(--sp-text-secondary)] hover:-translate-y-0.5 hover:border-[color:var(--sp-border-strong)] hover:shadow-sm'
            }`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                isActive ? 'text-white/70' : 'text-[color:var(--sp-text-tertiary)]'
              }`}
            >
              Day {i + 1} · {weekday}
            </span>
            <span className="font-sora text-lg font-semibold leading-none">
              {dayNum}{' '}
              <span className={`text-xs font-medium ${isActive ? 'opacity-70' : 'opacity-70'}`}>
                {mo}/{yr}
              </span>
            </span>
            <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-[color:var(--sp-text-tertiary)]'}`}>
              {driving}h driving
            </span>
          </button>
        )
      })}
    </div>
  )
}
