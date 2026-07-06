import './TripTimeline.css'

const STOP_ICONS = {
  pickup: '📦',
  dropoff: '🏁',
  fuel: '⛽',
  rest: '🛏',
  break: '☕',
  deadhead: '🚚',
}

export default function TripTimeline({ stops = [] }) {
  if (!stops.length) return null

  const sorted = [...stops].sort(
    (a, b) => new Date(a.arrival) - new Date(b.arrival)
  )

  return (
    <aside className="card trip-timeline">
      <h3>Trip Stops</h3>
      <ol className="timeline-list">
        {sorted.map((stop, i) => (
          <li key={`${stop.type}-${i}`} className="timeline-item" style={{ animationDelay: `${i * 0.08}s` }}>
            <span className="timeline-icon">{STOP_ICONS[stop.type] || '📍'}</span>
            <div className="timeline-content">
              <strong className={`timeline-type type-${stop.type}`}>{stop.type}</strong>
              <p className="timeline-label">{stop.location_label}</p>
              <time className="timeline-time">
                {new Date(stop.arrival).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  )
}
