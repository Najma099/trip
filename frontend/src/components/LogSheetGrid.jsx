const ROW_Y = { off: 20, sleeper: 60, driving: 100, on: 140 }
const ROW_LABELS = [
  { key: 'off', label: 'Off Duty' },
  { key: 'sleeper', label: 'Sleeper Berth' },
  { key: 'driving', label: 'Driving' },
  { key: 'on', label: 'On Duty (Not Driving)' },
]
const HOUR_WIDTH = 30
const CHART_WIDTH = 24 * HOUR_WIDTH + 60

function timeToX(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return 50 + (h + m / 60) * HOUR_WIDTH
}

function buildPolylinePoints(segments) {
  if (!segments.length) return { linePoints: '', connectors: [] }

  const points = []
  const connectors = []

  segments.forEach((seg, i) => {
    const x1 = timeToX(seg.start)
    const x2 = timeToX(seg.end)
    const y = ROW_Y[seg.status] ?? ROW_Y.off

    if (i === 0) {
      points.push(`${x1},${y}`)
    } else {
      const prev = segments[i - 1]
      const prevY = ROW_Y[prev.status] ?? ROW_Y.off
      if (prevY !== y) {
        connectors.push({ x: x1, y1: prevY, y2: y })
      }
      points.push(`${x1},${y}`)
    }
    points.push(`${x2},${y}`)
  })

  return { linePoints: points.join(' '), connectors }
}

export default function LogSheetGrid({ segments = [], date }) {
  const { linePoints, connectors } = buildPolylinePoints(segments)

  return (
    <div className="log-sheet-grid">
      <h4 className="log-date">{date}</h4>
      <svg viewBox={`0 0 ${CHART_WIDTH} 180`} className="log-svg" role="img" aria-label={`Daily log for ${date}`}>
        {/* Hour grid */}
        {Array.from({ length: 25 }, (_, h) => {
          const x = 50 + h * HOUR_WIDTH
          return (
            <g key={h}>
              <line x1={x} y1={0} x2={x} y2={160} stroke="#334155" strokeWidth={h % 4 === 0 ? 1 : 0.5} />
              {h < 24 && h % 3 === 0 && (
                <text x={x + 2} y={175} fill="#64748b" fontSize="9">
                  {String(h).padStart(2, '0')}
                </text>
              )}
            </g>
          )
        })}

        {/* Row labels and baselines */}
        {ROW_LABELS.map(({ key, label }) => {
          const y = ROW_Y[key]
          return (
            <g key={key}>
              <text x={0} y={y + 4} fill="#94a3b8" fontSize="9">
                {label}
              </text>
              <line x1={50} y1={y} x2={CHART_WIDTH - 10} y2={y} stroke="#475569" strokeWidth={1} />
            </g>
          )
        })}

        {/* Vertical connectors at status changes */}
        {connectors.map((c, i) => (
          <line
            key={i}
            x1={c.x}
            y1={c.y1}
            x2={c.x}
            y2={c.y2}
            stroke="#e2e8f0"
            strokeWidth={2}
          />
        ))}

        {/* Duty status timeline */}
        {linePoints && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )}
      </svg>

      <div className="log-segment-list">
        {segments.map((seg, i) => (
          <span key={i} className={`log-seg log-seg-${seg.status}`}>
            {seg.status}: {seg.start}–{seg.end}
          </span>
        ))}
      </div>
    </div>
  )
}
