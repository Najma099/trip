import './DayWiseChart.css'

const MAX_HOURS = 24

export default function DayWiseChart({ dailyLogs = [] }) {
  if (!dailyLogs.length) return null

  return (
    <section className="card day-chart">
      <div className="day-chart-header">
        <h3>Daily Hours Breakdown</h3>
        <div className="day-chart-legend">
          <span><i className="dot driving" /> Driving</span>
          <span><i className="dot on-duty" /> On Duty</span>
          <span><i className="dot off-duty" /> Off Duty</span>
        </div>
      </div>

      <div className="day-chart-bars">
        {dailyLogs.map((day, i) => {
          const driving = day.total_driving_hours || 0
          const onDuty = day.total_on_duty_hours || 0
          const offDuty = day.total_off_duty_hours || 0
          const dateLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })

          return (
            <div
              key={day.date}
              className="day-bar-group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="day-bar-stack">
                <div
                  className="bar-segment driving"
                  style={{ height: `${(driving / MAX_HOURS) * 100}%` }}
                  title={`Driving: ${driving}h`}
                />
                <div
                  className="bar-segment on-duty"
                  style={{ height: `${(onDuty / MAX_HOURS) * 100}%` }}
                  title={`On duty: ${onDuty}h`}
                />
                <div
                  className="bar-segment off-duty"
                  style={{ height: `${(offDuty / MAX_HOURS) * 100}%` }}
                  title={`Off duty: ${offDuty}h`}
                />
              </div>
              <span className="day-bar-label">{dateLabel}</span>
              <span className="day-bar-total">{driving.toFixed(1)}h drive</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
