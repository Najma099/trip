import './DayWiseChart.css'

const CHART_H = 120
const MAX_H = 14

export default function DayWiseChart({ dailyLogs = [], selectedDate, onSelectDay }) {
  if (!dailyLogs.length) return null

  const maxVal = Math.max(
    ...dailyLogs.map((d) => Math.max(d.total_driving_hours || 0, d.total_on_duty_hours || 0, 1)),
    MAX_H
  )

  const points = dailyLogs.map((day, i) => {
    const x = dailyLogs.length === 1 ? 50 : (i / (dailyLogs.length - 1)) * 100
    const y = 100 - ((day.total_driving_hours || 0) / maxVal) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <section className="card chart-card">
      <div className="chart-card-header">
        <div>
          <h3>Daily Driving Hours</h3>
          <p className="chart-subtitle">Day-wise breakdown across your trip</p>
        </div>
        <span className="chart-total">
          {dailyLogs.reduce((s, d) => s + (d.total_driving_hours || 0), 0).toFixed(1)}h total
        </span>
      </div>

      <div className="chart-body">
        <div className="chart-bars-row">
          {dailyLogs.map((day, i) => {
            const driving = day.total_driving_hours || 0
            const onDuty = day.total_on_duty_hours || 0
            const offDuty = day.total_off_duty_hours || 0
            const d = new Date(day.date + 'T12:00:00')
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            const isSelected = day.date === selectedDate

            return (
              <button
                key={day.date}
                type="button"
                className={`chart-bar-col ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectDay?.(day.date)}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="chart-bar-stack" style={{ height: CHART_H }}>
                  <div
                    className="chart-bar off"
                    style={{ height: `${(offDuty / maxVal) * 100}%` }}
                    title={`Off: ${offDuty}h`}
                  />
                  <div
                    className="chart-bar on"
                    style={{ height: `${(onDuty / maxVal) * 100}%` }}
                    title={`On duty: ${onDuty}h`}
                  />
                  <div
                    className="chart-bar drive"
                    style={{ height: `${(driving / maxVal) * 100}%` }}
                    title={`Driving: ${driving}h`}
                  />
                </div>
                <span className="chart-bar-label">{label}</span>
                <span className="chart-bar-value">{driving.toFixed(1)}h</span>
              </button>
            )
          })}
        </div>

        <svg className="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="chart-legend">
        <span><i className="leg drive" /> Driving</span>
        <span><i className="leg on" /> On Duty</span>
        <span><i className="leg off" /> Off Duty</span>
      </div>
    </section>
  )
}
