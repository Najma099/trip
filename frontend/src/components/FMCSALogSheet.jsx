import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Download, Fuel, Moon, Truck } from 'lucide-react'
import { segmentHours } from '../utils/format'

const ROWS = [
  { key: 'off', label: '1  Off Duty', short: 'OFF', color: 'var(--duty-off)' },
  { key: 'sleeper', label: '2  Sleeper Berth', short: 'SB', color: 'var(--duty-sleeper)' },
  { key: 'driving', label: '3  Driving', short: 'D', color: 'var(--duty-driving)' },
  { key: 'on', label: '4  On Duty', short: 'ON', color: 'var(--duty-on)' },
]

const ROW_Y = { off: 48.75, sleeper: 86.25, driving: 123.75, on: 161.25 }
const GRID_LEFT = 140
const GRID_WIDTH = 880
const GRID_RIGHT = GRID_LEFT + GRID_WIDTH
const HOUR_W = GRID_WIDTH / 24

const STATUS_LABEL = {
  off: 'Off',
  sleeper: 'Sleeper',
  driving: 'Driving',
  on: 'On',
}

function timeToX(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const hours = timeStr === '24:00' ? 24 : h + m / 60
  return GRID_LEFT + hours * HOUR_W
}

function buildPolyline(segments) {
  if (!segments.length) return { points: '', length: 0 }
  const pts = []
  segments.forEach((seg, i) => {
    const x1 = timeToX(seg.start)
    const x2 = timeToX(seg.end)
    const y = ROW_Y[seg.status] ?? ROW_Y.off
    if (i === 0) pts.push(`${x1},${y}`)
    else {
      const prevY = ROW_Y[segments[i - 1].status] ?? ROW_Y.off
      if (prevY !== y) pts.push(`${x1},${prevY}`, `${x1},${y}`)
    }
    pts.push(`${x2},${y}`)
  })
  const points = pts.join(' ')
  let length = 0
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1].split(',').map(Number)
    const [x2, y2] = pts[i].split(',').map(Number)
    length += Math.hypot(x2 - x1, y2 - y1)
  }
  return { points, length }
}

function TotalPill({ label, value, color, icon: Icon }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--sp-border)] bg-[color:var(--sp-bg)] py-1.5 pl-2.5 pr-4">
      <span className="grid h-5 w-5 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
        <Icon size={11} strokeWidth={2.6} aria-hidden="true" />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--sp-text-secondary)]">
        {label}
      </span>
      <span className="font-mono text-xs font-semibold tabular-nums text-[color:var(--sp-text)]">
        {Number(value).toFixed(2)}h
      </span>
    </div>
  )
}

export default function FMCSALogSheet({ day, dayIndex = 0, totalDays = 1 }) {
  const [hovered, setHovered] = useState(null)
  const [pathLen, setPathLen] = useState(0)
  const pathRef = useRef(null)

  const segments = day?.segments || []
  const { points, length } = useMemo(() => buildPolyline(segments), [segments, day?.date])

  useEffect(() => {
    setHovered(null)
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength()
      setPathLen(len)
    } else {
      setPathLen(length)
    }
  }, [day?.date, length])

  if (!day) return null

  const d = new Date(day.date + 'T12:00:00')
  const dateTitle = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  function handlePrint() {
    window.print()
  }

  return (
    <section
      data-testid="fmcsa-log-sheet"
      className="group relative overflow-hidden rounded-2xl border border-[color:var(--sp-border)] bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #0ea5e9 55%, #10b981 100%)' }}
      />

      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="sp-fade-in-quick" key={day.date}>
            <span className="eyebrow">Driver&apos;s Daily Log · FMCSA §395.8</span>
            <h2 className="mt-1 font-sora text-xl font-semibold tracking-tight text-[color:var(--sp-text)] sm:text-2xl">
              {dateTitle}
            </h2>
            <p className="mt-1 text-xs text-[color:var(--sp-text-tertiary)]">
              Day {dayIndex + 1} of {totalDays} · 24-hour record of duty status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div data-testid="log-status-legend" className="flex flex-wrap items-center gap-2">
              {ROWS.map((r) => (
                <span
                  key={r.key}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-bg)] px-2 py-1 text-[11px] font-medium text-[color:var(--sp-text-secondary)]"
                >
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: r.color }} />
                  {r.short}
                </span>
              ))}
            </div>
            <button
              type="button"
              data-testid="log-download-pdf"
              onClick={handlePrint}
              className="sp-print-hide inline-flex items-center gap-1.5 rounded-md border border-[color:var(--sp-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--sp-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--sp-primary)] hover:text-[color:var(--sp-primary)] hover:shadow-sm"
            >
              <Download size={13} strokeWidth={2.4} aria-hidden="true" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="sp-scroll sp-fade-in-quick overflow-x-auto" key={`grid-${day.date}`}>
          <svg viewBox="0 0 1040 220" className="w-full min-w-[720px]" role="img" aria-label="24-hour duty status grid">
            {ROWS.map((row, ri) => (
              <g key={row.key}>
                <rect
                  x={GRID_LEFT}
                  y={30 + ri * 37.5}
                  width={GRID_WIDTH}
                  height={37.5}
                  fill={ri % 2 === 0 ? '#f8fafc' : '#ffffff'}
                />
                <text
                  x={128}
                  y={30 + ri * 37.5 + 22.75}
                  textAnchor="end"
                  fontSize="12"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  fill="#475569"
                >
                  {row.label}
                </text>
              </g>
            ))}

            {Array.from({ length: 25 }, (_, h) => {
              const x = GRID_LEFT + h * (GRID_WIDTH / 24)
              const major = h % 3 === 0
              return (
                <g key={h}>
                  <line
                    x1={x}
                    x2={x}
                    y1={30}
                    y2={180}
                    stroke={major ? '#cbd5e1' : '#e2e8f0'}
                    strokeWidth={major ? 1 : 0.5}
                  />
                  {major && h < 24 && (
                    <text x={x} y={196} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#94a3b8">
                      {String(h).padStart(2, '0')}
                    </text>
                  )}
                </g>
              )
            })}

            {ROWS.map((_, ri) => (
              <line
                key={`hr-${ri}`}
                x1={GRID_LEFT}
                x2={GRID_RIGHT}
                y1={30 + ri * 37.5}
                y2={30 + ri * 37.5}
                stroke="#e2e8f0"
                strokeWidth={0.6}
              />
            ))}
            <line x1={GRID_LEFT} y1={180} x2={GRID_RIGHT} y2={180} stroke="#e2e8f0" strokeWidth={0.6} />

            <polyline
              ref={pathRef}
              points={points}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth={hovered !== null ? 4 : 3}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="sp-log-path"
              style={{ '--sp-path-length': `${pathLen || length}` }}
            />
          </svg>
        </div>

        <div className="sp-fade-in-quick flex flex-col divide-y divide-[color:var(--sp-border)] rounded-xl border border-[color:var(--sp-border)] bg-white" key={`segs-${day.date}`}>
          {segments.map((seg, i) => {
            const dur = segmentHours(seg.start, seg.end)
            const statusKey = seg.status
            const colorVar = ROWS.find((r) => r.key === statusKey)?.color || 'var(--duty-off)'
            const isHot = hovered === i

            return (
              <div
                key={i}
                data-testid={`log-segment-${i}`}
                className={`flex items-center gap-3 border-l-4 px-4 py-2.5 text-sm transition-colors ${
                  isHot ? 'bg-sky-50/80' : 'hover:bg-slate-50/60'
                }`}
                style={{ borderLeftColor: colorVar }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="w-24 font-mono text-[13px] font-semibold text-[color:var(--sp-text)]">
                  {seg.start}–{seg.end}
                </span>
                <span
                  className="w-16 text-[11px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: colorVar }}
                >
                  {STATUS_LABEL[statusKey] || seg.status}
                </span>
                <span className="hidden w-14 text-xs font-medium text-[color:var(--sp-text-secondary)] sm:inline">
                  {dur.toFixed(2)}h
                </span>
                <span className="flex-1 truncate text-[13px] text-[color:var(--sp-text-secondary)]">
                  {seg.location || seg.remark}
                  {seg.remark && seg.location && (
                    <span className="ml-2 text-[color:var(--sp-text-tertiary)]">· {seg.remark}</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>

        <div data-testid="log-totals" className="flex flex-wrap items-center justify-between gap-3">
          <div className="sp-fade-in-quick flex flex-wrap gap-2">
            <TotalPill label="Driving" value={day.total_driving_hours} color="#1e3a8a" icon={Truck} />
            <TotalPill label="On Duty" value={day.total_on_duty_hours} color="#0ea5e9" icon={Clock} />
            <TotalPill label="Off Duty" value={day.total_off_duty_hours} color="#64748b" icon={Moon} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--sp-text-tertiary)] sp-print-hide">
            <Fuel size={12} aria-hidden="true" />
            <span>Hover a segment to highlight it on the grid</span>
          </div>
        </div>
      </div>
    </section>
  )
}
