import './DayWiseChart.css'

const CHART_H = 128

export default function DayWiseChart({ dailyLogs = [], selectedDate, onSelectDay }) {
  if (!dailyLogs.length) return null

  const maxVal = Math.max(
    ...dailyLogs.map((d) =>
      Math.max(d.total_driving_hours || 0, d.total_on_duty_hours || 0, d.total_off_duty_hours || 0, 1)
    ),
    12
  )

  const totalDrive = dailyLogs.reduce((s, d) => s + (d.total_driving_hours || 0), 0)

  return (
    <section className="card chart-card fade-switch" key={selectedDate}>
      <header className="chart-card__header">
        <div>
          <h2 className="section-title">Daily Hours Breakdown</h2>
          <p className="section-sub">Driving · on-duty · off-duty per calendar day</p>
        </div>
        <span className="chart-card__total">{totalDrive.toFixed(1)}h total drive</span>
      </header>

      <div className="chart-card__body">
        {dailyLogs.map((day, i) => {
          const driving = day.total_driving_hours || 0
          const onDuty = day.total_on_duty_hours || 0
          const offDuty = day.total_off_duty_hours || 0
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
                <div className="chart-col__bar chart-col__bar--off" style={{ height: `${(offDuty / maxVal) * 100}%` }} />
                <div className="chart-col__bar chart-col__bar--on" style={{ height: `${(onDuty / maxVal) * 100}%` }} />
                <div className="chart-col__bar chart-col__bar--drive" style={{ height: `${(driving / maxVal) * 100}%` }} />
              </div>
              <span className="chart-col__label">{label}</span>
              <span className="chart-col__value">{driving.toFixed(1)}h</span>
            </button>
          )
        })}
      </div>

      <div className="chart-card__legend">
        <span><i className="leg leg--drive" /> Driving</span>
        <span><i className="leg leg--on" /> On Duty</span>
        <span><i className="leg leg--off" /> Off Duty</span>
      </div>
    </section>
  )
}
