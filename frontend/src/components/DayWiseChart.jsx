import { useEffect, useMemo, useState } from 'react'
import './DayWiseChart.css'

const CHART_H = 128
const DONUT_R = 72
const DONUT_STROKE = 22
const DONUT_C = 2 * Math.PI * DONUT_R

function pct(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function DonutChart({ driving, onDuty, offDuty, animateKey }) {
  const [ready, setReady] = useState(false)
  const total = driving + onDuty + offDuty
  const displayTotal = total > 0 ? total.toFixed(1) : '0'

  const slices = useMemo(() => {
    if (total <= 0) {
      return [{ key: 'empty', value: 1, color: 'var(--border-default)', label: 'No data' }]
    }
    return [
      { key: 'drive', value: driving, color: 'var(--duty-driving)', label: 'Driving' },
      { key: 'on', value: onDuty, color: 'var(--duty-on)', label: 'On Duty' },
      { key: 'off', value: offDuty, color: 'var(--duty-off)', label: 'Off Duty' },
    ].filter((s) => s.value > 0)
  }, [driving, onDuty, offDuty, total])

  useEffect(() => {
    setReady(false)
    const t = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(t)
  }, [animateKey])

  let offset = 0

  return (
    <div className="donut-chart">
      <svg viewBox="0 0 200 200" className="donut-chart__svg" role="img" aria-label="Daily hours breakdown">
        <g transform="translate(100, 100) rotate(-90)">
          {slices.map((slice, i) => {
            const length = (slice.value / (total || 1)) * DONUT_C
            const dashOffset = -offset
            offset += length
            return (
              <circle
                key={`${animateKey}-${slice.key}`}
                r={DONUT_R}
                fill="none"
                stroke={slice.color}
                strokeWidth={DONUT_STROKE}
                strokeLinecap="butt"
                strokeDasharray={`${ready ? length : 0} ${DONUT_C}`}
                strokeDashoffset={dashOffset}
                style={{
                  transition: `stroke-dasharray var(--duration-chart) var(--ease-out) ${i * 80}ms`,
                }}
              />
            )
          })}
        </g>
      </svg>
      <div className="donut-chart__center">
        <span className="donut-chart__total">{displayTotal}</span>
        <span className="donut-chart__label">hours</span>
      </div>
      <ul className="donut-chart__legend">
        {total > 0 ? (
          <>
            <li><span className="donut-dot donut-dot--drive" />Driving {pct(driving, total)}%</li>
            <li><span className="donut-dot donut-dot--on" />On Duty {pct(onDuty, total)}%</li>
            <li><span className="donut-dot donut-dot--off" />Off Duty {pct(offDuty, total)}%</li>
          </>
        ) : (
          <li>No duty hours recorded</li>
        )}
      </ul>
    </div>
  )
}

export default function DayWiseChart({ dailyLogs = [], selectedDate, onSelectDay }) {
  if (!dailyLogs.length) return null

  const activeDay = dailyLogs.find((d) => d.date === selectedDate) || dailyLogs[0]
  const driving = activeDay.total_driving_hours || 0
  const onDuty = activeDay.total_on_duty_hours || 0
  const offDuty = activeDay.total_off_duty_hours || 0

  const maxVal = Math.max(
    ...dailyLogs.map((d) =>
      Math.max(d.total_driving_hours || 0, d.total_on_duty_hours || 0, d.total_off_duty_hours || 0, 1)
    ),
    12
  )

  const totalDrive = dailyLogs.reduce((s, d) => s + (d.total_driving_hours || 0), 0)
  const activeLabel = new Date(activeDay.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <section className="hours-section card" key={selectedDate}>
      <header className="hours-section__header">
        <div>
          <h2 className="section-title">Daily Hours Breakdown</h2>
          <p className="section-sub">Day proportion vs multi-day comparison</p>
        </div>
        <span className="hours-section__badge">{totalDrive.toFixed(1)}h total drive</span>
      </header>

      <div className="hours-section__grid">
        <div className="hours-section__donut card-inner">
          <h3 className="hours-section__panel-title">Selected day</h3>
          <p className="hours-section__panel-sub">{activeLabel}</p>
          <DonutChart
            driving={driving}
            onDuty={onDuty}
            offDuty={offDuty}
            animateKey={activeDay.date}
          />
        </div>

        <div className="hours-section__bars card-inner">
          <h3 className="hours-section__panel-title">All trip days</h3>
          <p className="hours-section__panel-sub">Click a bar to switch days</p>
          <div className="chart-card__body">
            {dailyLogs.map((day, i) => {
              const dayDriving = day.total_driving_hours || 0
              const dayOnDuty = day.total_on_duty_hours || 0
              const dayOffDuty = day.total_off_duty_hours || 0
              const d = new Date(day.date + 'T12:00:00')
              const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              const isSelected = day.date === selectedDate

              return (
                <button
                  key={day.date}
                  type="button"
                  className={`chart-col ${isSelected ? 'chart-col--selected' : ''}`}
                  onClick={() => onSelectDay?.(day.date)}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="chart-col__stack" style={{ height: CHART_H }}>
                    <div className="chart-col__bar chart-col__bar--off" style={{ height: `${(dayOffDuty / maxVal) * 100}%` }} />
                    <div className="chart-col__bar chart-col__bar--on" style={{ height: `${(dayOnDuty / maxVal) * 100}%` }} />
                    <div className="chart-col__bar chart-col__bar--drive" style={{ height: `${(dayDriving / maxVal) * 100}%` }} />
                  </div>
                  <span className="chart-col__label">{label}</span>
                  <span className="chart-col__value">{dayDriving.toFixed(1)}h</span>
                </button>
              )
            })}
          </div>
          <div className="chart-card__legend">
            <span><i className="leg leg--drive" /> Driving</span>
            <span><i className="leg leg--on" /> On Duty</span>
            <span><i className="leg leg--off" /> Off Duty</span>
          </div>
        </div>
      </div>
    </section>
  )
}
