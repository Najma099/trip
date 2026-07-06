import {
  Bed,
  Coffee,
  Fuel,
  Info,
  MapPin,
  Navigation,
  PackageCheck,
  PackageOpen,
} from 'lucide-react'
import { formatStopTime } from '../utils/format'

const FUEL_INTERVAL_MILES = 1000

const STOP_META = {
  deadhead: { label: 'Origin', color: 'var(--stop-deadhead)', icon: Navigation },
  pickup: { label: 'Pickup', color: 'var(--stop-pickup)', icon: PackageOpen },
  dropoff: { label: 'Dropoff', color: 'var(--stop-dropoff)', icon: PackageCheck },
  fuel: { label: 'Fuel', color: 'var(--stop-fuel)', icon: Fuel },
  rest: { label: '10-hour Rest', color: 'var(--stop-rest)', icon: Bed },
  break: { label: '30-min Break', color: 'var(--stop-break)', icon: Coffee },
}

export default function StopTimeline({ stops = [], loadedMiles = null }) {
  if (!stops.length) return null

  const sorted = [...stops].sort((a, b) => new Date(a.arrival) - new Date(b.arrival))
  const hasFuelStop = sorted.some((stop) => stop.type === 'fuel')
  const showFuelNote =
    !hasFuelStop && (loadedMiles == null || loadedMiles < FUEL_INTERVAL_MILES)

  return (
    <div
      data-testid="stop-timeline"
      className="flex flex-col rounded-xl border border-[color:var(--sp-border)] bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-[color:var(--sp-border)] px-5 py-4">
        <div>
          <h3 className="font-sora text-base font-semibold tracking-tight text-[color:var(--sp-text)]">
            Stop Timeline
          </h3>
          <p className="mt-0.5 text-xs text-[color:var(--sp-text-tertiary)]">
            {sorted.length} planned stops in chronological order
          </p>
        </div>
        <MapPin size={16} className="text-[color:var(--sp-text-tertiary)]" aria-hidden="true" />
      </div>

      {showFuelNote && (
        <div
          data-testid="fuel-stop-note"
          className="mx-5 mb-4 flex gap-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
        >
          <Info size={14} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
          <p>
            {loadedMiles != null ? (
              <>
                No fuel stop required — loaded leg is{' '}
                <strong>{Math.round(loadedMiles).toLocaleString()} mi</strong> (under{' '}
                {FUEL_INTERVAL_MILES.toLocaleString()} mi).
              </>
            ) : (
              <>
                No fuel stop on this trip — fuel stops are inserted every{' '}
                {FUEL_INTERVAL_MILES.toLocaleString()} mi on the loaded leg only.
              </>
            )}
          </p>
        </div>
      )}

      <ol className="sp-scroll relative max-h-[440px] overflow-y-auto px-5 py-4">
        {sorted.map((stop, i) => {
          const meta = STOP_META[stop.type] || STOP_META.deadhead
          const Icon = meta.icon
          const isLast = i === sorted.length - 1

          return (
            <li
              key={`${stop.type}-${i}`}
              data-testid={`stop-timeline-item-${i}`}
              className="sp-fade-up relative flex gap-3 pb-4 pl-1 last:pb-1"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className="flex flex-col items-center">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full text-white shadow-sm ring-4 ring-white"
                  style={{ backgroundColor: meta.color }}
                >
                  <Icon size={14} strokeWidth={2.4} aria-hidden="true" />
                </span>
                {!isLast && (
                  <span
                    className="mt-1 w-px flex-1 min-h-[16px]"
                    style={{ background: 'linear-gradient(to bottom, var(--sp-border), transparent)' }}
                  />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-[color:var(--sp-text-tertiary)]">
                    · {formatStopTime(stop.arrival)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium leading-snug text-[color:var(--sp-text)]">
                  {stop.location_label}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
