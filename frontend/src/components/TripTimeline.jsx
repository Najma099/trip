import './TripTimeline.css'

const STOP_LABELS = {
  pickup: 'Pickup',
  dropoff: 'Dropoff',
  fuel: 'Fuel',
  rest: 'Rest',
  break: 'Break',
  deadhead: 'Deadhead',
}

export default function TripTimeline({ stops = [] }) {
  if (!stops.length) return null

  const sorted = [...stops].sort((a, b) => new Date(a.arrival) - new Date(b.arrival))

  return (
    <aside className="card trip-timeline">
      <h2 className="section-title">Stop Timeline</h2>
      <ol className="timeline-list">
        {sorted.map((stop, i) => (
          <li key={`${stop.type}-${i}`} className="timeline-item" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="timeline-icon" aria-hidden="true">●</span>
            <div>
              <strong className={`timeline-type type-${stop.type}`}>
                {STOP_LABELS[stop.type] || stop.type}
              </strong>
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
