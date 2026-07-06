import { useEffect, useMemo, useState } from 'react'
import LogSheetGrid from './LogSheetGrid'
import './LogSheet.css'

const STATUS_LEGEND = [
  { key: 'off', label: 'Off Duty', color: 'var(--duty-off)' },
  { key: 'sleeper', label: 'Sleeper Berth', color: 'var(--duty-sleeper)' },
  { key: 'driving', label: 'Driving', color: 'var(--duty-driving)' },
  { key: 'on', label: 'On Duty', color: 'var(--duty-on)' },
]

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5.5 1.5v2M10.5 1.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function DriveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="4" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 11h1.5l1-4h7l1 4H14M5 7l1-2h4l1 2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function RestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 10c2-3 4-3 5 0s3 3 5 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M3 12h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export default function LogSheet({ dailyLogs = [], selectedDate }) {
  const [visible, setVisible] = useState(true)
  const activeDate = selectedDate || dailyLogs[0]?.date
  const activeDay = dailyLogs.find((d) => d.date === activeDate) || dailyLogs[0]

  useEffect(() => {
    if (!activeDate) return
    setVisible(false)
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [activeDate])

  if (!dailyLogs.length) {
    return (
      <div className="card log-sheet-empty">
        <p>No daily log sheets available for this trip.</p>
      </div>
    )
  }

  const formatted = new Date(activeDay.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="log-sheet">
      <div className="log-sheet__accent" aria-hidden="true" />

      <header className="log-sheet__header">
        <div>
          <h2 className="log-sheet__title">FMCSA Daily Log Sheet</h2>
          <p className="log-sheet__subtitle">§395.8 duty status record — visual grid & segment detail</p>
        </div>
        <div className="log-sheet__date-badge">
          <CalendarIcon />
          {formatted}
        </div>
      </header>

      <div className="log-sheet__legend" aria-label="Duty status legend">
        {STATUS_LEGEND.map(({ key, label, color }) => (
          <span key={key} className="log-sheet__legend-item">
            <i className="log-sheet__legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      <div className={`log-sheet__content ${visible ? 'log-sheet__content--visible' : ''}`}>
        <LogSheetGrid segments={activeDay.segments} date={activeDay.date} />

        <div className="log-sheet__totals">
          <div className="log-sheet__total-pill log-sheet__total-pill--drive">
            <DriveIcon />
            <div>
              <span className="log-sheet__total-pill-label">Driving</span>
              <span className="log-sheet__total-pill-value">{activeDay.total_driving_hours}h</span>
            </div>
          </div>
          <div className="log-sheet__total-pill log-sheet__total-pill--on">
            <ClockIcon />
            <div>
              <span className="log-sheet__total-pill-label">On Duty</span>
              <span className="log-sheet__total-pill-value">{activeDay.total_on_duty_hours}h</span>
            </div>
          </div>
          <div className="log-sheet__total-pill log-sheet__total-pill--off">
            <RestIcon />
            <div>
              <span className="log-sheet__total-pill-label">Off Duty</span>
              <span className="log-sheet__total-pill-value">{activeDay.total_off_duty_hours ?? '—'}h</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
