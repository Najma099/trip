import { useEffect, useMemo, useState } from 'react'

const ROW_Y = { off: 20, sleeper: 60, driving: 100, on: 140 }
const ROW_LABELS = [
  { key: 'off', label: 'Off Duty' },
  { key: 'sleeper', label: 'Sleeper Berth' },
  { key: 'driving', label: 'Driving' },
  { key: 'on', label: 'On Duty (Not Driving)' },
]
const HOUR_WIDTH = 30
const CHART_WIDTH = 24 * HOUR_WIDTH + 60
const DRAW_MS = 1000

const STATUS_LABELS = {
  off: 'Off Duty',
  sleeper: 'Sleeper Berth',
  driving: 'Driving',
  on: 'On Duty',
}

function timeToX(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const hours = timeStr === '24:00' ? 24 : h + m / 60
  return 50 + hours * HOUR_WIDTH
}

function segmentHours(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startH = sh + sm / 60
  const endH = end === '24:00' ? 24 : eh + em / 60
  return Math.max(0, endH - startH)
}

function formatDuration(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

function buildSegmentGeometry(segments) {
  const horizontals = []
  const connectors = []

  segments.forEach((seg, i) => {
    const x1 = timeToX(seg.start)
    const x2 = timeToX(seg.end)
    const y = ROW_Y[seg.status] ?? ROW_Y.off
    const length = Math.max(x2 - x1, 0)

    horizontals.push({ seg, i, x1, x2, y, length })

    if (i > 0) {
      const prev = segments[i - 1]
      const prevY = ROW_Y[prev.status] ?? ROW_Y.off
      if (prevY !== y) {
        connectors.push({ i, x: x1, y1: prevY, y2: y, vLength: Math.abs(y - prevY) })
      }
    }
  })

  return { horizontals, connectors }
}

export default function LogSheetGrid({ segments = [], date }) {
  const [animated, setAnimated] = useState(false)
  const [hovered, setHovered] = useState(null)

  const { horizontals, connectors } = useMemo(() => buildSegmentGeometry(segments), [segments])

  const totalSpan = useMemo(() => {
    if (!horizontals.length) return 1
    const first = horizontals[0].x1
    const last = horizontals[horizontals.length - 1].x2
    return Math.max(last - first, 1)
  }, [horizontals])

  useEffect(() => {
    setAnimated(false)
    setHovered(null)
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true))
    })
    return () => cancelAnimationFrame(t)
  }, [date])

  const formatted = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="log-grid">
      <div className="log-grid__svg-wrap">
        <svg viewBox={`0 0 ${CHART_WIDTH} 180`} className="log-grid__svg" role="img" aria-label={`Daily log for ${date}`}>
          {Array.from({ length: 25 }, (_, h) => {
            const x = 50 + h * HOUR_WIDTH
            return (
              <g key={h}>
                <line
                  x1={x} y1={0} x2={x} y2={160}
                  stroke="var(--border-default)"
                  strokeWidth={h % 4 === 0 ? 1 : 0.5}
                />
                {h < 24 && h % 3 === 0 && (
                  <text x={x + 2} y={175} fill="var(--text-tertiary)" fontSize="9">
                    {String(h).padStart(2, '0')}
                  </text>
                )}
              </g>
            )
          })}

          {ROW_LABELS.map(({ key, label }) => {
            const y = ROW_Y[key]
            return (
              <g key={key}>
                <text x={0} y={y + 4} fill="var(--text-secondary)" fontSize="9">{label}</text>
                <line x1={50} y1={y} x2={CHART_WIDTH - 10} y2={y} stroke="var(--border-strong)" strokeWidth={1} />
              </g>
            )
          })}

          {connectors.map((c) => {
            const hSeg = horizontals.find((h) => h.i === c.i - 1) || horizontals[c.i - 1]
            const reachX = hSeg ? hSeg.x2 : c.x
            const delay = ((reachX - (horizontals[0]?.x1 ?? 50)) / totalSpan) * DRAW_MS

            return (
              <line
                key={`v-${c.i}-${date}`}
                x1={c.x}
                y1={c.y1}
                x2={c.x}
                y2={c.y2}
                stroke="var(--brand-primary)"
                strokeWidth={hovered === c.i || hovered === c.i - 1 ? 3.5 : 2}
                strokeDasharray={c.vLength}
                strokeDashoffset={animated ? 0 : c.vLength}
                className="log-grid__connector"
                style={{
                  transition: `stroke-dashoffset 180ms var(--ease-out) ${delay}ms, stroke-width var(--duration-fast)`,
                  opacity: animated ? 1 : 0,
                }}
              />
            )
          })}

          {horizontals.map(({ seg, i, x1, x2, y, length }) => {
            const delay = ((x1 - (horizontals[0]?.x1 ?? 50)) / totalSpan) * DRAW_MS
            const isHot = hovered === i
            const segDuration = segmentHours(seg.start, seg.end)
            const drawDuration = Math.max(200, (length / totalSpan) * DRAW_MS)

            return (
              <g key={`h-${i}-${date}`}>
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="transparent"
                  strokeWidth={14}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="var(--brand-primary)"
                  strokeWidth={isHot ? 4 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray={length}
                  strokeDashoffset={animated ? 0 : length}
                  className={`log-grid__segment-line ${isHot ? 'log-grid__segment-line--hot' : ''}`}
                  style={{
                    transition: `stroke-dashoffset ${drawDuration}ms var(--ease-out) ${delay}ms, stroke-width var(--duration-fast), filter var(--duration-fast)`,
                    filter: isHot ? 'drop-shadow(0 0 4px rgba(8, 145, 178, 0.45))' : 'none',
                  }}
                  pointerEvents="none"
                />
                <title>{`${STATUS_LABELS[seg.status] || seg.status}: ${seg.start}–${seg.end} (${formatDuration(segDuration)})`}</title>
              </g>
            )
          })}
        </svg>
      </div>

      <ul className="log-grid__segments">
        {segments.map((seg, i) => {
          const dur = segmentHours(seg.start, seg.end)
          const isHot = hovered === i

          return (
            <li
              key={i}
              className={`log-seg log-seg--${seg.status} ${isHot ? 'log-seg--highlight' : ''}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="log-seg__chip">{STATUS_LABELS[seg.status] || seg.status}</span>
              <div className="log-seg__body">
                <div className="log-seg__primary">
                  <span className="log-seg__time">{seg.start} – {seg.end}</span>
                  <span className="log-seg__duration">{formatDuration(dur)}</span>
                </div>
                {(seg.remark || seg.location) && (
                  <span className="log-seg__remark">{seg.remark || seg.location}</span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <p className="log-grid__date-sr" aria-hidden="true">{formatted}</p>
    </div>
  )
}
